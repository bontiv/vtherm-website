import type { Metadata } from 'next';
import PluginTable from "./table";
import { getAlternatesMetadata, getT } from '@/app/i18n';
import { opengraph_defaults } from '@/lib/opengraph';
import plugins from '@/pluginsdb/plugins.json';
import { VTPlugin } from '@/lib/plugindb';
import { getRepoStars } from '@/lib/github';

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

const pluginPage = async () => {
    const pluginsWithStars = await Promise.all((plugins as VTPlugin[]).map(async plugin => ({
        ...plugin,
        stars: plugin.slug ? await getRepoStars(plugin.slug) : undefined,
    })));

    return (<PluginTable plugins={pluginsWithStars} />);
}

export default pluginPage;
