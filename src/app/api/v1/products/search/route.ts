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

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("q");

	if (!query || query.length < 2) {
		return NextResponse.json({
			matches: [],
			hasMore: false,
			message: "Query must be at least 2 characters",
		});
	}

	try {
		const products = getProducts() as Product[];

		const matches = products
			.filter(
				(product) =>
					!product.outOfStock &&
					product.name.toLowerCase().includes(query.toLowerCase())
			)
			.map((product) => product.name)
			.slice(0, 8)
			.sort();

		return NextResponse.json({
			matches,
			hasMore: matches.length === 8,
			count: matches.length,
		});
	} catch (error) {
		console.error("Error searching products:", error);
		return NextResponse.json(
			{
				error: "Search failed",
				matches: [],
				hasMore: false,
				count: 0,
			},
			{ status: 500 }
		);
	}
}
