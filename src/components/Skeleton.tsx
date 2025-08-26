import React from "react";

interface SkeletonProps {
	className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
	<div
		className={`animate-pulse bg-muted rounded ${className}`}
		style={{
			background:
				"linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
			backgroundSize: "200% 100%",
			animation: "skeleton-loading 1.5s ease-in-out infinite",
		}}
	/>
);

export const ProductCardSkeleton: React.FC = () => (
	<div className="bg-background/50 rounded-xl border border-border/30 p-4">
		<div className="flex items-start justify-between gap-4">
			<div className="flex-1 min-w-0 space-y-3">
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
				<div className="flex items-center gap-4 mt-3">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-6 w-8 rounded-full" />
				</div>
			</div>
			<Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
		</div>
	</div>
);

export const SkeletonStyles = () => (
	<style jsx global>{`
		@keyframes skeleton-loading {
			0% {
				background-position: -200% 0;
			}
			100% {
				background-position: 200% 0;
			}
		}
	`}</style>
);
