import { Metadata } from "next";
import { Suspense } from "react";
import { fallbackLng } from "./i18n/settings";
import Statistics from "@/components/Statisctics";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = {
    title: "404 - Page not found - Versatile Thermostat",
    robots: { index: false, follow: true },
};

// The root layout renders no <html>: each route group provides its own, so does the 404 page
export default function NotFound() {
    return <html lang={fallbackLng}>
        <body className="antialiased">
            <NotFoundContent />
            <Suspense fallback={null}>
                <Statistics />
            </Suspense>
        </body>
    </html>
}
