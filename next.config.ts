import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "summer.hackclub.com",
			},
		],
	},
};

export default nextConfig;
