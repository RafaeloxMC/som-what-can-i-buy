type Product = {
	uid: string;
	name: string;
	description: string;
	images: string[];
	link: string | null;
	price: number;
	outOfStock: boolean;
};

let productsData: Product[] | undefined;

try {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	productsData = require("./data/products.json");
} catch {
	if (process.env.DATA) {
		try {
			productsData = JSON.parse(process.env.DATA);
		} catch {
			throw new Error("Failed to parse DATA from environment variable.");
		}
	} else {
		throw new Error(
			"products.json not found and DATA environment variable is not set."
		);
	}
}

export const getProducts = () => {
	return productsData;
};
