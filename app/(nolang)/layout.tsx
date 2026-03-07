import { PropsWithChildren, Suspense } from "react";
import Statistics from "@/components/Statisctics";
import { fallbackLng, languages } from "../i18n/settings";
import { Metadata } from "next";
import { getT } from "../i18n";
import { opengraph_defaults } from "@/lib/opengraph";

const GlobalLayout: React.FC<PropsWithChildren<object>> = async ({ children }) => <html><body>
    {children}
    <Suspense fallback={null}>
        <Statistics />
    </Suspense>
</body></html>

export default GlobalLayout;


export async function generateMetadata({ }): Promise<Metadata> {
    const { t } = await getT('common', { lng: fallbackLng })

    const lang_pages = Object.fromEntries(languages.map(lng => [lng, `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/`]))

    return {
        title: t('title'),
        description: t('description'),
        keywords: ["home assistant", "thermostat", "climate control", "smart home", "automation"],
        authors: [{ name: "Remi BONNET" }],
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
            siteName: "Versatile Thermostat",
            ...opengraph_defaults
        },
        alternates: {
            canonical: process.env.NEXT_PUBLIC_SITE_URL,
            languages: {
                ...lang_pages,
                'x-default': `${process.env.NEXT_PUBLIC_SITE_URL}/`
            }
        }
    }
}
