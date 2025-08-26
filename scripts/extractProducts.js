/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

let cheerio;
try {
	cheerio = require("cheerio");
} catch {
	console.error(
		'This script requires "cheerio". Install with: npm install cheerio'
	);
	process.exit(1);
}

function readHtml(filepath) {
	return fs.readFileSync(filepath, "utf8");
}

function normalizeText(s) {
	if (!s) return "";
	return s.replace(/\s+/g, " ").trim();
}

function extractFromProductCard($, el) {
	const $el = $(el);

	const nameEl = $el.find("h3").first();
	const name = nameEl.length ? normalizeText(nameEl.text()) : null;

	let description = null;
	const descEl = $el.find("p.text-gray-700").first();
	if (descEl.length) {
		description = normalizeText(descEl.text());
	}

	let price = null;
	const priceEl = $el.find(".absolute.top-2.right-2").first();
	if (priceEl.length) {
		const priceText = normalizeText(priceEl.text());
		const match = priceText.match(/\d+/);
		if (match) {
			price = parseInt(match[0]);
		}
	}

	if (price === null) {
		const buyButton = $el
			.find("button")
			.filter((i, btn) => {
				const btnText = $(btn).text().toLowerCase();
				return btnText.includes("buy for") && btnText.includes("shell");
			})
			.first();

		if (buyButton.length) {
			const buttonText = normalizeText(buyButton.text());
			const match = buttonText.match(/buy for\s+(\d+)\s+shells?/i);
			if (match) {
				price = parseInt(match[1]);
			}
		}
	}

	const images = [];
	$el.find("img").each((i, img) => {
		const $img = $(img);
		const src = $img.attr("src") || $img.attr("data-src");

		if (src && !src.includes("shell.") && !src.includes("/shell")) {
			if (
				src.startsWith("/assets/") ||
				src.startsWith(
					"https://summer.hackclub.com/rails/active_storage/"
				)
			) {
				images.push(src);
			}
		}
	});

	let outOfStock = false;

	const outOfStockEl = $el
		.find(".text-red-600, .text-red-500")
		.filter((i, elem) => {
			const text = $(elem).text().toLowerCase();
			return text.includes("out of stock") || text.includes("sold out");
		});

	const quantityEl = $el
		.find(
			".text-orange-600, .text-orange-500, .text-green-600, .text-green-500"
		)
		.filter((i, elem) => {
			const text = $(elem).text().toLowerCase();
			return text.match(/\d+\s+left/) || text.includes("in stock");
		});

	outOfStock = outOfStockEl.length > 0 && quantityEl.length === 0;

	let link = null;
	const form = $el.find("form[action]").first();
	if (form.length) {
		link = form.attr("action");
	}

	return {
		name: name,
		description: description,
		images: images,
		link: link,
		price: price,
		outOfStock: outOfStock,
	};
}

function isValidProduct(product) {
	if (!product.name || product.name.length < 2) {
		return false;
	}

	const skipNames = [
		"🌍 choose your region",
		"🛍️ shop items",
		"shop items",
		"🏆 badge collection",
	];

	const lowerName = product.name.toLowerCase();
	if (skipNames.includes(lowerName)) {
		return false;
	}

	const hasPrice = product.price !== null;
	const hasDescription =
		product.description && product.description.length > 10;
	const hasImage = product.images && product.images.length > 0;

	return hasPrice || hasDescription || hasImage;
}

function main() {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		console.error(
			"Usage: node extractProducts.js /path/to/shop.html [output.json]"
		);
		process.exit(1);
	}

	const inputPath = path.resolve(args[0]);
	const outputPath = args[1]
		? path.resolve(args[1])
		: path.resolve(process.cwd(), "products.json");

	if (!fs.existsSync(inputPath)) {
		console.error("Input file does not exist:", inputPath);
		process.exit(1);
	}

	const html = readHtml(inputPath);
	const $ = cheerio.load(html);

	const productCards = $(".card-with-gradient").toArray();
	console.log(`Found ${productCards.length} product cards`);

	const products = [];
	const seenNames = new Set();

	for (const card of productCards) {
		const product = extractFromProductCard($, card);

		if (!isValidProduct(product)) {
			continue;
		}

		if (seenNames.has(product.name)) {
			continue;
		}
		seenNames.add(product.name);

		products.push(product);
	}

	const output = products.map((p, i) => ({
		uid: `product-${i + 1}`,
		name: p.name,
		description: p.description,
		images: p.images,
		link: p.link,
		price: p.price,
		outOfStock: p.outOfStock,
	}));

	fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf8");
	console.log(`Wrote ${output.length} products to ${outputPath}`);
}

main();
