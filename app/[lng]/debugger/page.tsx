import { getT } from "@/app/i18n";
import DynamicDebugger from './debugger';
import { Metadata } from "next";
import { opengraph_defaults } from "@/lib/opengraph";
import Semantic from "@/components/Semantic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { breadcrumb, pageUrl, SITE_ID } from "@/lib/semantic";

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params
    const { t } = await getT('analyzer', { lng })
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            siteName: "Versatile Thermostat",
            type: "website",
            url: `/${lng}/debugger/`,
            ...opengraph_defaults,
        }
    }
}

const DebuggerPage: React.FC<{ params: Promise<{ lng: string }> }> = async ({ params }) => {
    const { lng } = await params
    const { t } = await getT('analyzer', { lng })
    const { t: common_t } = await getT('common', { lng })
    const crumbs = [{ name: common_t('menu.log-analyzer'), path: '/debugger/' }]

    return (
        <>
            <Breadcrumbs lng={lng} items={crumbs} />
            <Semantic id={`debugger-${lng}`} data={{
                "@context": "https://schema.org",
                "@type": "WebPage",
                inLanguage: lng,
                isPartOf: { "@id": SITE_ID },
                url: pageUrl(lng, '/debugger/'),
                name: t('title'),
                description: t('description'),
                breadcrumb: breadcrumb(lng, common_t('menu.home'), crumbs),
            }} />
            <DynamicDebugger />
        </>
    );
}

export default DebuggerPage;
