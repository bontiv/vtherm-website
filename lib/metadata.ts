import { Metadata } from "next";
import { getAlternatesMetadata } from "@/app/i18n";
import { opengraph_defaults } from "@/lib/opengraph";

const TITLE_SUFFIX = " - Versatile Thermostat";
const TITLE_MAX_LENGTH = 60;

/**
 * Title of a page: the site name suffix of the layout template is dropped
 * when it would push the title over the length shown in search results.
 */
export function pageTitle(title: string): Metadata['title'] {
    return title.length + TITLE_SUFFIX.length > TITLE_MAX_LENGTH ? { absolute: title } : title;
}

/**
 * Standard metadata of a localized page: title, description, alternates and OpenGraph.
 * `path` must start and end with a slash.
 * @param markdown URL of the Markdown version of the page
 */
export function pageMetadata(path: string, lng: string, title: string, description: string, keywords?: string[], markdown?: string): Metadata {
    return {
        title: pageTitle(title),
        description,
        keywords,
        alternates: getAlternatesMetadata(path, lng, { markdown }),
        openGraph: {
            ...opengraph_defaults,
            title,
            description,
            url: `/${lng}${path}`,
        },
    };
}
