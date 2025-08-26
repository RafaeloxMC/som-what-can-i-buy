import { NextResponse } from "next/server";
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

export async function GET() {
	try {
		const products = getProducts() as Product[];

		return NextResponse.json({
			hasProducts: products.length > 0,
			count: products.filter((product) => !product.outOfStock).length,
		});
	} catch (error) {
		console.error("Error checking products:", error);
		return NextResponse.json(
			{
				error: "Failed to check products",
				hasProducts: false,
				count: 0,
			},
			{ status: 500 }
		);
	}
}
