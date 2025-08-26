import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

interface Product {
	uid: string;
	name: string;
	description: string;
	images: string[];
	link: string | null;
	price: number;
	outOfStock: boolean;
}

interface ProductCombination {
	product: Product;
	quantity: number;
}

interface WCIBRequest {
	shells: number;
	strategy: "most_valuable" | "most_products";
	maxProducts?: number;
	excludedProducts?: string[];
	allowDuplicates?: boolean;
	excludeCredits?: boolean;
	excludeBadges?: boolean;
	excludeLotteryTicket?: boolean;
}

interface WCIBResponse {
	totalShells: number;
	usedShells: number;
	remainingShells: number;
	products: ProductCombination[];
	totalProducts: number;
	strategy: string;
	maxProducts?: number;
	excludedProducts?: string[];
	allowDuplicates: boolean;
	excludeCredits: boolean;
	excludeBadges: boolean;
	excludeLotteryTicket: boolean;
	message?: string;
}

export async function POST(req: NextRequest) {
	let requestData: WCIBRequest;

	try {
		requestData = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 }
		);
	}

	const {
		shells,
		strategy,
		maxProducts,
		excludedProducts,
		allowDuplicates = false,
		excludeCredits = false,
		excludeBadges = false,
		excludeLotteryTicket = false,
	} = requestData;

	if (typeof shells !== "number" || isNaN(shells) || shells < 0) {
		return NextResponse.json(
			{ error: "Invalid shells value. Must be a non-negative number." },
			{ status: 400 }
		);
	}

	if (!strategy || !["most_valuable", "most_products"].includes(strategy)) {
		return NextResponse.json(
			{
				error: "Invalid strategy. Must be 'most_valuable' or 'most_products'.",
			},
			{ status: 400 }
		);
	}

	if (
		maxProducts !== undefined &&
		(typeof maxProducts !== "number" || maxProducts < 1)
	) {
		return NextResponse.json(
			{ error: "Invalid maxProducts value. Must be a positive number." },
			{ status: 400 }
		);
	}

	if (
		excludedProducts !== undefined &&
		(!Array.isArray(excludedProducts) ||
			!excludedProducts.every((name) => typeof name === "string"))
	) {
		return NextResponse.json(
			{
				error: "Invalid excludedProducts value. Must be an array of strings.",
			},
			{ status: 400 }
		);
	}

	const allProducts = getProducts() as Product[];
	let availableProducts = allProducts.filter(
		(product) => !product.outOfStock && product.price > 0
	);

	if (excludeCredits) {
		availableProducts = availableProducts.filter(
			(product) => !isCreditOrVoucher(product)
		);
	}

	if (excludeBadges) {
		availableProducts = availableProducts.filter(
			(product) => !isBadgeProduct(product)
		);
	}

	if (excludeLotteryTicket) {
		availableProducts = availableProducts.filter(
			(product) =>
				!product.name.toLowerCase().includes("lottery ticket") &&
				!product.description.toLowerCase().includes("lottery ticket")
		);
	}

	if (excludedProducts && excludedProducts.length > 0) {
		const excludedNamesLower = excludedProducts.map((name) =>
			name.toLowerCase().trim()
		);
		availableProducts = availableProducts.filter(
			(product) =>
				!excludedNamesLower.includes(product.name.toLowerCase())
		);
	}

	if (availableProducts.length === 0) {
		return NextResponse.json({
			totalShells: shells,
			usedShells: 0,
			remainingShells: shells,
			products: [],
			totalProducts: 0,
			strategy,
			maxProducts,
			excludedProducts,
			allowDuplicates,
			excludeCredits,
			excludeBadges,
			excludeLotteryTicket,
			message: "No products available for purchase with current filters.",
		} as WCIBResponse);
	}

	let selectedProducts: ProductCombination[] = [];

	if (strategy === "most_valuable") {
		selectedProducts = getMostValuableCombination(
			availableProducts,
			shells,
			maxProducts,
			allowDuplicates
		);
	} else {
		selectedProducts = getMostProductsCombination(
			availableProducts,
			shells,
			maxProducts,
			allowDuplicates
		);
	}

	const usedShells = selectedProducts.reduce(
		(total, combo) => total + combo.product.price * combo.quantity,
		0
	);
	const totalProductCount = selectedProducts.reduce(
		(total, combo) => total + combo.quantity,
		0
	);

	return NextResponse.json({
		totalShells: shells,
		usedShells,
		remainingShells: shells - usedShells,
		products: selectedProducts,
		totalProducts: totalProductCount,
		strategy,
		maxProducts,
		excludedProducts,
		allowDuplicates,
		excludeCredits,
		excludeBadges,
		excludeLotteryTicket,
	} as WCIBResponse);
}

function isBadgeProduct(product: Product): boolean {
	const badgeProductNames = [
		"Spider",
		"Graphic design is my passion",
		"Summer of Making Blue",
		"Pocket Watcher",
		"Sunglasses",
		"Offshore Bank Account",
		"Gold Verified",
		"I am Rich",
	];

	return badgeProductNames.includes(product.name);
}

function isCreditOrVoucher(product: Product): boolean {
	const nameAndDescription =
		`${product.name} ${product.description}`.toLowerCase();

	const creditKeywords = [
		"credit",
		"credits",
		"voucher",
		"vouchers",
		"gift card",
		"giftcard",
		"digital currency",
		"store credit",
		"account credit",
		"balance",
		"top up",
		"reload",
		"prepaid",
		"$",
		"dollars",
		"bucks",
		"cash",
		"redeem",
		"coupon",
		"promo code",
		"promotional code",
		"subscription",
		"membership",
		"service",
		"grant",
	];

	const hasKeywords = creditKeywords.some((keyword) =>
		nameAndDescription.includes(keyword)
	);

	const creditProviders = [
		"cloudflare",
		"bambu lab",
		"dbrand",
		"ikea",
		"keychron",
		"ifixit",
		"purelymail",
		"digikey",
		"lcsc",
		"framework",
		"mullvad",
		"amp",
	];

	const isFromCreditProvider = creditProviders.some(
		(provider) =>
			nameAndDescription.includes(provider) &&
			nameAndDescription.includes("credit")
	);

	const hasCreditAmount =
		/\$\d+.*credit|credit.*\$\d+|\d+.*credit|\d+.*voucher/.test(
			nameAndDescription
		);

	return hasKeywords || isFromCreditProvider || hasCreditAmount;
}

function getMostValuableCombination(
	products: Product[],
	budget: number,
	maxProducts?: number,
	allowDuplicates: boolean = false
): ProductCombination[] {
	const result: ProductCombination[] = [];
	let remainingBudget = budget;
	let productCount = 0;

	if (allowDuplicates) {
		const sortedProducts = [...products]
			.filter((p) => p.price <= budget)
			.sort((a, b) => b.price - a.price);

		for (const product of sortedProducts) {
			if (maxProducts && productCount >= maxProducts) break;
			if (product.price > remainingBudget) continue;

			const maxQuantity = Math.floor(remainingBudget / product.price);
			const actualQuantity = maxProducts
				? Math.min(maxQuantity, maxProducts - productCount)
				: maxQuantity;

			if (actualQuantity > 0) {
				result.push({ product, quantity: actualQuantity });
				remainingBudget -= product.price * actualQuantity;
				productCount += actualQuantity;
			}

			if (
				remainingBudget === 0 ||
				(maxProducts && productCount >= maxProducts)
			)
				break;
		}
	} else {
		const sortedProducts = [...products]
			.filter((p) => p.price <= budget)
			.sort((a, b) => b.price - a.price);

		for (const product of sortedProducts) {
			if (maxProducts && productCount >= maxProducts) break;
			if (product.price > remainingBudget) continue;

			result.push({ product, quantity: 1 });
			remainingBudget -= product.price;
			productCount += 1;

			if (
				remainingBudget === 0 ||
				(maxProducts && productCount >= maxProducts)
			)
				break;
		}
	}

	return result;
}

function getMostProductsCombination(
	products: Product[],
	budget: number,
	maxProducts?: number,
	allowDuplicates: boolean = false
): ProductCombination[] {
	const result: ProductCombination[] = [];
	let remainingBudget = budget;
	let productCount = 0;

	if (allowDuplicates) {
		const sortedProducts = [...products]
			.filter((p) => p.price <= budget)
			.sort((a, b) => a.price - b.price);

		for (const product of sortedProducts) {
			if (maxProducts && productCount >= maxProducts) break;
			if (product.price > remainingBudget) continue;

			const maxQuantity = Math.floor(remainingBudget / product.price);
			const actualQuantity = maxProducts
				? Math.min(maxQuantity, maxProducts - productCount)
				: maxQuantity;

			if (actualQuantity > 0) {
				result.push({ product, quantity: actualQuantity });
				remainingBudget -= product.price * actualQuantity;
				productCount += actualQuantity;
			}

			if (
				remainingBudget === 0 ||
				(maxProducts && productCount >= maxProducts)
			)
				break;
		}
	} else {
		const sortedProducts = [...products]
			.filter((p) => p.price <= budget)
			.sort((a, b) => a.price - b.price);

		for (const product of sortedProducts) {
			if (maxProducts && productCount >= maxProducts) break;
			if (product.price > remainingBudget) continue;

			result.push({ product, quantity: 1 });
			remainingBudget -= product.price;
			productCount += 1;

			if (
				remainingBudget === 0 ||
				(maxProducts && productCount >= maxProducts)
			)
				break;
		}
	}

	return result;
}
