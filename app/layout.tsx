import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Versatile Thermostat - Smart Climate Control for Home Assistant",
  description: "Versatile Thermostat is an advanced climate integration for Home Assistant that works with any existing climate, switch or valve entity. Features include smart calibration, boiler control and TPI Algorithm.",
  keywords: ["home assistant", "thermostat", "climate control", "smart home", "automation"],
  authors: [{ name: "Remi BONNET" }],
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL :
    `http://localhost:${process.env.PORT ?? 3000}`,
  openGraph: {
    title: "Versatile Thermostat - Smart Climate Control",
    description: "Advanced climate integration for Home Assistant",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children
}
