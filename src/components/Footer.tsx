export default function Footer() {
	return (
		<footer className="w-full my-4 py-4 text-center text-sm text-muted-foreground">
			<p>
				&copy; {new Date().getFullYear()}{" "}
				<span className="font-semibold">What Can I Buy? - </span>
				<a
					href="https://github.com/RafaeloxMC/som-what-can-i-buy"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub Repository
				</a>
				<br />
				Created by <span className="font-semibold">xvcf</span> for
				Summer of Making 2025.
			</p>
		</footer>
	);
}
