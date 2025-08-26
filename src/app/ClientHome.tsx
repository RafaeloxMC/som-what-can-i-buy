"use client";

import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import Image from "next/image";
import { useDebounce } from "@/lib/hooks";
import { ProductCardSkeleton, SkeletonStyles } from "@/components/Skeleton";
import Footer from "@/components/Footer";

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

interface FormState {
	shells: string;
	strategy: "most_valuable" | "most_products";
	maxProducts: string;
	excludedProducts: string[];
	allowDuplicates: boolean;
	excludeCredits: boolean;
	excludeBadges: boolean;
	excludeLotteryTicket: boolean;
}

const defaultFormState: FormState = {
	shells: "",
	strategy: "most_valuable",
	maxProducts: "",
	excludedProducts: [],
	allowDuplicates: false,
	excludeCredits: false,
	excludeBadges: false,
	excludeLotteryTicket: false,
};

const ProductCard = memo(
	({
		product,
		quantity,
		isExcluded,
		onToggleExclude,
	}: {
		product: Product;
		quantity: number;
		isExcluded?: boolean;
		onToggleExclude?: (productName: string) => void;
	}) => (
		<div className="bg-background/50 rounded-xl border border-border/30 p-4 hover:border-border/50 transition-colors relative">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-card-foreground truncate">
						{product.name}
					</h4>
					<p className="text-sm text-muted-foreground mt-1 line-clamp-2">
						{product.description}
					</p>
					<div className="flex items-center gap-4 mt-3">
						<span className="text-sm font-medium text-primary">
							{product.price} shells
						</span>
						{quantity > 1 && (
							<span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
								×{quantity}
							</span>
						)}
					</div>
				</div>
				{product.images.length > 0 && (
					<div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden relative">
						<Image
							src={product.images[0]}
							alt={product.name}
							fill
							className="object-cover"
							sizes="64px"
						/>
					</div>
				)}
			</div>
			{onToggleExclude && (
				<button
					onClick={() => onToggleExclude(product.name)}
					className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-2 border-background shadow-sm transition-all hover:scale-110 ${
						isExcluded
							? "bg-red-500 hover:bg-red-600 text-white"
							: "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
					}`}
					title={isExcluded ? "Include product" : "Exclude product"}
				>
					{isExcluded ? (
						<svg
							className="w-4 h-4 mx-auto"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
						</svg>
					) : (
						<svg
							className="w-4 h-4 mx-auto"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="12" r="10" strokeWidth="2" />
							<path d="M4.93 4.93l14.14 14.14" strokeWidth="2" />
						</svg>
					)}
				</button>
			)}
		</div>
	)
);

ProductCard.displayName = "ProductCard";

const ExcludedProductsTags = memo(
	({
		excludedProducts,
		onAddProduct,
		onRemoveProduct,
	}: {
		excludedProducts: string[];
		onAddProduct: (productName: string) => void;
		onRemoveProduct: (productName: string) => void;
	}) => {
		const [inputValue, setInputValue] = useState("");
		const [showSuggestions, setShowSuggestions] = useState(false);
		const [suggestions, setSuggestions] = useState<string[]>([]);
		const [isSearching, setIsSearching] = useState(false);

		const debouncedSearch = useDebounce(async (query: string) => {
			if (query.length < 2) {
				setSuggestions([]);
				return;
			}

			setIsSearching(true);
			try {
				const response = await fetch(
					`/api/v1/products/search?q=${encodeURIComponent(query)}`
				);
				const data = await response.json();

				if (response.ok) {
					const filtered = data.matches.filter(
						(name: string) => !excludedProducts.includes(name)
					);
					setSuggestions(filtered);
				} else {
					setSuggestions([]);
				}
			} catch (error) {
				console.error("Search error:", error);
				setSuggestions([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setInputValue(value);
			setShowSuggestions(true);

			if (value.length >= 2) {
				debouncedSearch(value);
			} else {
				setSuggestions([]);
			}
		};

		const handleSuggestionClick = (productName: string) => {
			onAddProduct(productName);
			setInputValue("");
			setShowSuggestions(false);
			setSuggestions([]);
		};

		const handleInputKeyDown = (
			e: React.KeyboardEvent<HTMLInputElement>
		) => {
			if (
				e.key === "Enter" &&
				inputValue.trim() &&
				suggestions.length > 0
			) {
				e.preventDefault();
				const exactMatch = suggestions.find(
					(name: string) =>
						name.toLowerCase() === inputValue.toLowerCase().trim()
				);
				if (exactMatch) {
					handleSuggestionClick(exactMatch);
				} else if (suggestions.length === 1) {
					handleSuggestionClick(suggestions[0]);
				}
			} else if (e.key === "Escape") {
				setShowSuggestions(false);
				setSuggestions([]);
			}
		};

		return (
			<div className="space-y-3">
				<div className="relative">
					<input
						type="text"
						placeholder="Type 2+ letters to search products to exclude..."
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleInputKeyDown}
						onFocus={() => {
							if (suggestions.length > 0)
								setShowSuggestions(true);
						}}
						onBlur={() => {
							setTimeout(() => {
								setShowSuggestions(false);
								setSuggestions([]);
							}, 150);
						}}
						className="w-full h-12 px-4 bg-input border border-border rounded-xl focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all outline-none text-foreground placeholder:text-muted-foreground"
					/>

					{/* Loading indicator */}
					{isSearching && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<svg
								className="w-4 h-4 text-muted-foreground animate-spin"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>
					)}

					{/* Suggestions dropdown */}
					{showSuggestions && suggestions.length > 0 && (
						<div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
							{suggestions.map((productName: string) => (
								<button
									key={productName}
									onClick={() =>
										handleSuggestionClick(productName)
									}
									className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-sm text-foreground"
								>
									{productName}
								</button>
							))}
						</div>
					)}

					{/* No results message */}
					{showSuggestions &&
						!isSearching &&
						inputValue.length >= 2 &&
						suggestions.length === 0 && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 px-4 py-2">
								<div className="text-sm text-muted-foreground">
									No products found matching &quot;
									{inputValue}&quot;
								</div>
							</div>
						)}
				</div>

				{/* Show excluded products as tags */}
				{excludedProducts.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{excludedProducts.map((productName) => (
							<div
								key={productName}
								className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm border border-red-200 dark:border-red-800/30"
							>
								<span>{productName}</span>
								<button
									onClick={() => onRemoveProduct(productName)}
									className="hover:text-red-600 dark:hover:text-red-300 transition-colors"
									title="Remove from excluded list"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
);

ExcludedProductsTags.displayName = "ExcludedProductsTags";

export default function ClientHome() {
	const [formData, setFormData] = useState<FormState>(defaultFormState);
	const [isHydrated, setIsHydrated] = useState(false);
	const [results, setResults] = useState<WCIBResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasProducts, setHasProducts] = useState<boolean | null>(null);

	useEffect(() => {
		const saved = localStorage.getItem("som-wcib-form");
		if (saved) {
			try {
				const parsedData = JSON.parse(saved);
				if (parsedData.excludedProducts === undefined) {
					parsedData.excludedProducts = [];
				} else if (typeof parsedData.excludedProducts === "string") {
					parsedData.excludedProducts = parsedData.excludedProducts
						.split(",")
						.map((name: string) => name.trim())
						.filter((name: string) => name.length > 0);
				}
				setFormData(parsedData);
			} catch {
				setFormData(defaultFormState);
			}
		}
		setIsHydrated(true);

		fetch("/api/v1/products")
			.then((response) => response.json())
			.then((data) => {
				setHasProducts(data.hasProducts);
			})
			.catch((error) => {
				console.error("Error checking products availability:", error);
				setHasProducts(false);
			});
	}, []);

	const debouncedSaveToStorage = useDebounce((data: FormState) => {
		if (isHydrated) {
			localStorage.setItem("som-wcib-form", JSON.stringify(data));
		}
	}, 500);

	useEffect(() => {
		if (isHydrated) {
			debouncedSaveToStorage(formData);
		}
	}, [formData, debouncedSaveToStorage, isHydrated]);

	const isFormValid = useMemo(() => {
		const shellsNum = parseInt(formData.shells);
		return !isNaN(shellsNum) && shellsNum >= 0;
	}, [formData.shells]);

	const handleInputChange = useCallback(
		(field: keyof FormState, value: string | boolean | string[]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setError(null);
		},
		[]
	);

	const handleShellsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			handleInputChange("shells", e.target.value);
		},
		[handleInputChange]
	);

	const handleStrategyChange = useCallback(
		(e: React.ChangeEvent<HTMLSelectElement>) => {
			handleInputChange(
				"strategy",
				e.target.value as "most_valuable" | "most_products"
			);
		},
		[handleInputChange]
	);

	const handleMaxProductsChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			handleInputChange("maxProducts", e.target.value);
		},
		[handleInputChange]
	);

	const handleCheckboxChange = useCallback(
		(
			field:
				| "allowDuplicates"
				| "excludeCredits"
				| "excludeBadges"
				| "excludeLotteryTicket"
		) => {
			return (e: React.ChangeEvent<HTMLInputElement>) => {
				handleInputChange(field, e.target.checked);
			};
		},
		[handleInputChange]
	);

	const excludedProductsSet = useMemo(() => {
		return new Set(formData.excludedProducts);
	}, [formData.excludedProducts]);

	const handleAddExcludedProduct = useCallback(
		(productName: string) => {
			if (!formData.excludedProducts.includes(productName)) {
				handleInputChange("excludedProducts", [
					...formData.excludedProducts,
					productName,
				]);
			}
		},
		[formData.excludedProducts, handleInputChange]
	);

	const handleRemoveExcludedProduct = useCallback(
		(productName: string) => {
			handleInputChange(
				"excludedProducts",
				formData.excludedProducts.filter((name) => name !== productName)
			);
		},
		[formData.excludedProducts, handleInputChange]
	);

	const handleToggleExclude = useCallback(
		(productName: string) => {
			const currentExcluded = formData.excludedProducts;
			const isCurrentlyExcluded = currentExcluded.includes(productName);

			let newExcluded: string[];
			if (isCurrentlyExcluded) {
				newExcluded = currentExcluded.filter(
					(name) => name !== productName
				);
			} else {
				newExcluded = [...currentExcluded, productName];
			}

			handleInputChange("excludedProducts", newExcluded);
		},
		[formData.excludedProducts, handleInputChange]
	);

	const calculateOptimalPurchase = useCallback(async () => {
		if (!isFormValid) {
			setError("Please enter a valid number of shells (0 or greater)");
			return;
		}

		if (hasProducts === false) {
			setError("No products are currently available");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const requestBody = {
				shells: parseInt(formData.shells),
				strategy: formData.strategy,
				maxProducts: formData.maxProducts
					? parseInt(formData.maxProducts)
					: undefined,
				excludedProducts:
					formData.excludedProducts.length > 0
						? formData.excludedProducts
						: undefined,
				allowDuplicates: formData.allowDuplicates,
				excludeCredits: formData.excludeCredits,
				excludeBadges: formData.excludeBadges,
				excludeLotteryTicket: formData.excludeLotteryTicket,
			};

			const response = await fetch("/api/v1/wcib", {
				method: "POST",
				body: JSON.stringify(requestBody),
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				const errorMessage =
					errorData?.error ||
					`HTTP ${response.status}: ${response.statusText}`;
				throw new Error(errorMessage);
			}

			const data = await response.json();
			setResults(data);
		} catch (err) {
			console.error("API Error:", err);
			const errorMessage =
				err instanceof Error
					? err.message
					: "An unexpected error occurred";
			setError(errorMessage);
			setResults(null);
		} finally {
			setIsLoading(false);
		}
	}, [formData, isFormValid, hasProducts]);

	const resultsSummary = useMemo(() => {
		if (!results) return null;

		return {
			totalValue: results.usedShells,
			totalItems: results.totalProducts,
			remainingShells: results.remainingShells,
			efficiency:
				results.totalShells > 0
					? (results.usedShells / results.totalShells) * 100
					: 0,
		};
	}, [results]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted px-6 py-16">
			<SkeletonStyles />
			<div className="mx-auto max-w-3xl space-y-6">
				<header className="text-center space-y-6">
					<div className="space-y-2">
						<p className="text-lg text-muted-foreground font-light">
							Summer Of Making
						</p>
						<h1 className="text-6xl font-extrabold tracking-tight text-foreground">
							What Can I Buy?
						</h1>
						<p className="text-lg text-muted-foreground font-light">
							with my shells?
						</p>
						<p className="text-sm text-muted-foreground">
							Optimize your Summer of Making shell spending with
							ease. No leftovers means more products!
						</p>
					</div>
				</header>

				<main className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden shadow-sm">
					{hasProducts === null ? (
						<section className="p-8">
							<div className="text-center py-16">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-6">
									<svg
										className="w-7 h-7 text-muted-foreground animate-spin"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
										/>
									</svg>
								</div>
								<h3 className="text-lg font-medium text-card-foreground mb-2">
									Loading products...
								</h3>
								<p className="text-muted-foreground text-sm max-w-md mx-auto">
									Please wait while we check available
									products.
								</p>
							</div>
						</section>
					) : hasProducts === false ? (
						<section className="p-8">
							<div className="text-center py-16">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-6">
									<svg
										className="w-7 h-7 text-muted-foreground"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
										/>
									</svg>
								</div>
								<h3 className="text-lg font-medium text-card-foreground mb-2">
									No products available
								</h3>
								<p className="text-muted-foreground text-sm max-w-md mx-auto">
									There are currently no products available to
									purchase. Please check back later.
								</p>
							</div>
						</section>
					) : (
						<>
							<section className="p-8 border-b border-border">
								<div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
									<div className="space-y-6">
										<div className="space-y-3">
											<label className="text-sm font-medium text-card-foreground">
												Shells Available
											</label>
											<input
												type="number"
												placeholder="0"
												value={formData.shells}
												onChange={handleShellsChange}
												min="0"
												className={`w-full h-12 px-4 text-lg bg-input border rounded-xl focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all outline-none text-foreground placeholder:text-muted-foreground ${
													error && !isFormValid
														? "border-red-500"
														: "border-border"
												}`}
											/>
										</div>

										<div className="space-y-3">
											<label className="text-sm font-medium text-card-foreground">
												Optimization Strategy
											</label>
											<select
												value={formData.strategy}
												onChange={handleStrategyChange}
												className="w-full h-12 px-4 bg-input border border-border rounded-xl focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all outline-none text-foreground"
											>
												<option value="most_valuable">
													Maximize Value
												</option>
												<option value="most_products">
													Maximize Quantity
												</option>
											</select>
										</div>

										<div className="space-y-3">
											<label className="text-sm font-medium text-card-foreground">
												Product Limit
											</label>
											<input
												type="number"
												placeholder="No limit"
												value={formData.maxProducts}
												onChange={
													handleMaxProductsChange
												}
												min="1"
												className="w-full h-12 px-4 bg-input border border-border rounded-xl focus:bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all outline-none text-foreground placeholder:text-muted-foreground"
											/>
										</div>

										<div className="space-y-3">
											<label className="text-sm font-medium text-card-foreground">
												Exclude Products
											</label>
											<ExcludedProductsTags
												excludedProducts={
													formData.excludedProducts
												}
												onAddProduct={
													handleAddExcludedProduct
												}
												onRemoveProduct={
													handleRemoveExcludedProduct
												}
											/>
										</div>
									</div>

									<div className="space-y-6">
										<div className="space-y-4">
											<h3 className="text-sm font-medium text-card-foreground">
												Preferences
											</h3>
											<div className="space-y-4">
												{[
													{
														id: "allowDuplicates" as const,
														label: "Allow duplicate items",
														checked:
															formData.allowDuplicates,
													},
													{
														id: "excludeCredits" as const,
														label: "Exclude credit purchases",
														checked:
															formData.excludeCredits,
													},
													{
														id: "excludeBadges" as const,
														label: "Exclude badge purchases",
														checked:
															formData.excludeBadges,
													},
													{
														id: "excludeLotteryTicket" as const,
														label: "Exclude lottery ticket purchases",
														checked:
															formData.excludeLotteryTicket,
													},
												].map((option) => (
													<label
														key={option.id}
														className="flex items-center gap-3 cursor-pointer group"
													>
														<div className="relative">
															<input
																type="checkbox"
																checked={
																	option.checked
																}
																onChange={handleCheckboxChange(
																	option.id
																)}
																className="peer w-5 h-5 appearance-none border-2 border-border rounded checked:border-primary checked:bg-primary transition-colors"
															/>
															<svg
																className="absolute inset-0 w-5 h-5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<span className="text-sm text-muted-foreground group-hover:text-card-foreground transition-colors">
															{option.label}
														</span>
													</label>
												))}
											</div>
										</div>
									</div>
								</div>

								{error && (
									<div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
										<p className="text-sm text-red-700">
											{error}
										</p>
									</div>
								)}

								<div className="mt-8 flex justify-center">
									<button
										onClick={calculateOptimalPurchase}
										disabled={!isFormValid || isLoading}
										className={`px-8 py-4 font-medium rounded-xl transition-all shadow-sm ${
											isFormValid && !isLoading
												? "bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-md"
												: "bg-muted text-muted-foreground cursor-not-allowed"
										}`}
									>
										{isLoading
											? "Calculating..."
											: "Calculate Optimal Purchase"}
									</button>
								</div>
							</section>

							<section className="p-8">
								{isLoading ? (
									<div className="space-y-8">
										<div className="text-center py-8">
											<div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 animate-pulse">
												<svg
													className="w-7 h-7 text-primary animate-spin"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
													/>
												</svg>
											</div>
											<h3 className="text-lg font-medium text-card-foreground mb-2">
												Calculating optimal purchase...
											</h3>
											<p className="text-muted-foreground text-sm">
												Finding the best combination for
												your shells
											</p>
										</div>

										<div className="space-y-6">
											<h3 className="text-lg font-medium text-card-foreground">
												Loading recommendations...
											</h3>
											<div className="grid gap-4 lg:grid-cols-2">
												{Array.from({ length: 4 }).map(
													(_, index) => (
														<ProductCardSkeleton
															key={index}
														/>
													)
												)}
											</div>
										</div>
									</div>
								) : results ? (
									<div className="space-y-8">
										<div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
											<div className="text-center space-y-2">
												<div className="text-2xl font-semibold text-card-foreground">
													{resultsSummary?.totalItems ||
														0}
												</div>
												<div className="text-sm text-muted-foreground">
													Items
												</div>
											</div>
											<div className="text-center space-y-2">
												<div className="text-2xl font-semibold text-card-foreground">
													{resultsSummary?.totalValue ||
														0}
												</div>
												<div className="text-sm text-muted-foreground">
													Shells Used
												</div>
											</div>
											<div className="text-center space-y-2">
												<div className="text-2xl font-semibold text-card-foreground">
													{resultsSummary?.remainingShells ||
														0}
												</div>
												<div className="text-sm text-muted-foreground">
													Remaining
												</div>
											</div>
											<div className="text-center space-y-2">
												<div className="text-2xl font-semibold text-card-foreground">
													{Math.round(
														resultsSummary?.efficiency ||
															0
													)}
													%
												</div>
												<div className="text-sm text-muted-foreground">
													Efficiency
												</div>
											</div>
										</div>

										{results.products.length > 0 ? (
											<div className="space-y-6">
												<h3 className="text-lg font-medium text-card-foreground">
													Recommended Products
												</h3>
												<div className="grid gap-4 lg:grid-cols-2">
													{results.products.map(
														(item, index) => (
															<ProductCard
																key={`${item.product.uid}-${index}`}
																product={
																	item.product
																}
																quantity={
																	item.quantity
																}
																isExcluded={excludedProductsSet.has(
																	item.product
																		.name
																)}
																onToggleExclude={
																	handleToggleExclude
																}
															/>
														)
													)}
												</div>
											</div>
										) : (
											<div className="text-center py-8">
												<p className="text-muted-foreground">
													{results.message ||
														"No products found for your criteria"}
												</p>
											</div>
										)}
									</div>
								) : (
									<div className="text-center py-16">
										<div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-6">
											<svg
												className="w-7 h-7 text-muted-foreground"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<h3 className="text-lg font-medium text-card-foreground mb-2">
											Ready to optimize
										</h3>
										<p className="text-muted-foreground text-sm max-w-md mx-auto">
											Enter your available shells and
											preferences above to find the
											optimal purchase combination.
										</p>
									</div>
								)}
							</section>
							<section className="border-t border-border">
								<Footer />
							</section>
						</>
					)}
				</main>
			</div>
		</div>
	);
}
