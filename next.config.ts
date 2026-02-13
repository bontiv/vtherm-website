import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  trailingSlash: true,
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
