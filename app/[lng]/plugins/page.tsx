import type { Metadata } from 'next';
import PluginTable from "./table";
import { getAlternatesMetadata, getT } from '@/app/i18n';
import { opengraph_defaults } from '@/lib/opengraph';

export const generateMetadata = async ({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> => {
    const { lng } = await params;
    const { t } = await getT('plugins', { lng });
    const alternates = getAlternatesMetadata('/plugins', lng);
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

const pluginPage: React.FC = () => {
    return (<PluginTable />);
}

export default pluginPage;
