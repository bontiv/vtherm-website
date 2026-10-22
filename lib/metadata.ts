import { Metadata } from "next";
import { getAlternatesMetadata } from "@/app/i18n";
import { opengraph_defaults } from "@/lib/opengraph";

/**
 * Standard metadata of a localized page: title, description, alternates and OpenGraph.
 * `path` must start and end with a slash.
 */
export function pageMetadata(path: string, lng: string, title: string, description: string, keywords?: string[]): Metadata {
    return {
        title,
        description,
        keywords,
        alternates: getAlternatesMetadata(path, lng),
        openGraph: {
            ...opengraph_defaults,
            title,
            description,
            url: `/${lng}${path}`,
        },
    };
}
