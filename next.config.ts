import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  distDir: process.env.DIST_DIR ?? "out",
  trailingSlash: true,
  assetPrefix: process.env.ASSET_PREFIX ?? undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/jmcollin78/versatile_thermostat/**",
      },
    ],
  },
};

export default nextConfig;
