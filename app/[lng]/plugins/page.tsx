import type { Metadata } from 'next';
import PluginTable from "./table";
import { getAlternatesMetadata, getT } from '@/app/i18n';
import { opengraph_defaults } from '@/lib/opengraph';
import plugins from '@/pluginsdb/plugins.json';
import { VTPlugin } from '@/lib/plugindb';
import { getRepoStars } from '@/lib/github';
import Semantic from '@/components/Semantic';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { breadcrumb, pageUrl, SITE_ID } from '@/lib/semantic';

export const generateMetadata = async ({ params }: { params: Promise<{ lng: string, plugins: VTPlugin[] }> }): Promise<Metadata> => {
    const { lng } = await params;
    const { t } = await getT('plugins', { lng });
    const alternates = getAlternatesMetadata('/plugins/', lng, { markdown: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/plugins/llms.txt` });

    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            description: t('description'),
            ...opengraph_defaults
        },
        alternates
    }
};

const pluginPage = async ({ params }: { params: Promise<{ lng: string }> }) => {
    const { lng } = await params;
    const { t } = await getT('plugins', { lng });
    const { t: common_t } = await getT('common', { lng });
    const pluginsWithStars = await Promise.all((plugins as VTPlugin[]).map(async plugin => ({
        ...plugin,
        stars: plugin.slug ? await getRepoStars(plugin.slug) : undefined,
    })));

    const crumbs = [{ name: common_t('menu.plugins'), path: '/plugins/' }];

    return <>
        <Breadcrumbs lng={lng} items={crumbs} />
        <Semantic id={`plugins-${lng}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": SITE_ID },
            url: pageUrl(lng, '/plugins/'),
            name: t('title'),
            description: t('description'),
            breadcrumb: breadcrumb(lng, common_t('menu.home'), crumbs),
        }} />
        <PluginTable plugins={pluginsWithStars} />
    </>;
}

export default pluginPage;
