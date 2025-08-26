export const getProducts = () => {
	try {
		const dataString = process.env.DATA;

		if (!dataString) {
			console.warn("No DATA environment variable found");
			return [];
		}

		const productsData = JSON.parse(dataString);
		return productsData;
	} catch (error) {
		console.error("Error parsing products data:", error);
		return [];
	}
};
