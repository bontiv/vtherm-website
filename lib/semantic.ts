import type { BreadcrumbList } from "schema-dts";

export const SITE_ID = "https://www.versatile-thermostat.org/#website";
export const SOFTWARE_ID = "https://www.versatile-thermostat.org/#software";

/** Absolute URL of a localized page. `path` must start and end with a slash. */
export function pageUrl(lng: string, path: string): string {
    return `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}${path}`;
}

/** A breadcrumb level. `path` must start and end with a slash. */
export interface Crumb {
    name: string;
    path: string;
}

/**
 * Build a BreadcrumbList from the home page to the current page.
 * @param items name and path of each level after home
 */
export function breadcrumb(lng: string, homeName: string, items: Crumb[]): BreadcrumbList {
    return {
        "@type": "BreadcrumbList",
        itemListElement: [{ name: homeName, path: '/' }, ...items].map((item, i) => ({
            "@type": "ListItem",
            name: item.name,
            item: pageUrl(lng, item.path),
            position: i + 1,
        })),
    };
}
