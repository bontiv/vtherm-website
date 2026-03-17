import ListDevices from "./ListDevices";
import devices_list from '@/devicesdb/devices.json';

import { getAlternatesMetadata, getT } from "@/app/i18n";
import { Metadata } from "next";
import { opengraph_defaults } from "@/lib/opengraph";
import Semantic from "@/components/Semantic";
export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('devices', { lng });
    const alternates = getAlternatesMetadata('/devices/', lng);
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
            siteName: "Versatile Thermostat",
            url: `/${lng}/devices/`,
            ...opengraph_defaults,
        },
        alternates,
    }
}

const DevicesPage: React.FC<{ params: Promise<{ lng: string }> }> = async ({ params }) => {
    const { lng } = await params;
    const { t } = await getT('devices', { lng });
    const { t: commont } = await getT('common', { lng });
    return <>
        <h1 className="hidden">{t('title')}</h1>
        <Semantic id={`devices-${lng}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": "https://www.versatile-thermostat.org/#website" },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/`,
            name: t('title'),
            description: t('description'),
            breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                    {
                        "@type": "ListItem",
                        "name": commont('menu.home'),
                        item: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/`,
                        position: 1
                    },
                    {
                        "@type": "ListItem",
                        "name": commont('menu.devices'),
                        item: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/`,
                        position: 2
                    }
                ]
            }
        }} />
        <ListDevices devices={devices_list} />
    </>
}

export default DevicesPage;