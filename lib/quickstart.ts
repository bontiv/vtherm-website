import devices from '@/devicesdb/devices.json';
import type { RelatedLink } from "@/components/quickstart/RelatedLinks";

/** Links to documentation pages, labelled with the `docs.*` keys of the `common` namespace */
export function docLinks(common_t: (key: string) => string, docs: string[]): RelatedLink[] {
    return docs.map(doc => ({ href: `/docs/${doc}/`, label: common_t(`docs.${doc}`) }));
}

/** Links to device pages, labelled with manufacturer and model */
export function deviceLinks(slugs: string[]): RelatedLink[] {
    return slugs.map(slug => {
        const device = devices.find(d => d.slug === slug);
        return { href: `/devices/${slug}/`, label: device ? `${device.manufacturer} ${device.model}`.trim() : slug };
    });
}
