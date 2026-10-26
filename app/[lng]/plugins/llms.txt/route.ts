import { getT } from "@/app/i18n";
import { fallbackLng, languages } from "@/app/i18n/settings";
import plugins from '@/pluginsdb/plugins.json';
import { htmlToText, linkItem, textResponse } from "@/lib/llms";
import { certConfig, pluginAnchor, VTCertificationLevel, VTPlugin } from "@/lib/plugindb";
import { pageUrl } from "@/lib/semantic";

export const dynamic = "force-static";

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

/** Localized value of a plugin field (`name_fr`, `description_de`...), falling back to the English one */
function localized(plugin: VTPlugin, field: 'name' | 'description', lng: string): string {
    const key = `${field}_${lng}` as keyof VTPlugin;
    return lng != fallbackLng && key in plugin ? plugin[key] as string : plugin[field];
}

/** Index of the plugins, grouped by certification level */
export async function GET(_request: Request, { params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('plugins', { lng });

    const levels = (Object.keys(certConfig) as VTCertificationLevel[]).sort((a, b) => certConfig[a].rank - certConfig[b].rank);
    const sections = levels.flatMap(level => {
        const items = (plugins as VTPlugin[]).filter(plugin => plugin.certification === level).map(plugin => {
            const url = plugin.slug ? `https://github.com/${plugin.slug}` : plugin.url ?? `${pageUrl(lng, '/plugins/')}#${pluginAnchor(plugin)}`;
            const details = [
                t(`types.${plugin.type}`),
                plugin.family && t(`families.${plugin.family}`),
                plugin.author && htmlToText(t('from', { author: plugin.author })),
            ].filter(Boolean).join(', ');
            return linkItem(localized(plugin, 'name', lng), url, `${htmlToText(localized(plugin, 'description', lng))} (${details})`);
        });
        return items.length > 0 ? [`## ${t(`certification.${level}`)}`, items.join('\n')] : [];
    });

    return textResponse([
        `# Versatile Thermostat - ${t('title')}`,
        `> ${t('description')}`,
        htmlToText(t('description_short')),
        ...sections,
    ].join('\n\n'));
}
