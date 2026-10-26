import { getT } from "@/app/i18n";
import { languages } from "@/app/i18n/settings";
import { deviceConfigSections, deviceName, getDeviceDefinition, getDeviceEntries, getDeviceSlugs, readDeviceReadme, readSlugFile } from "@/lib/devicecontent";
import { absolutizeLinks, textResponse } from "@/lib/llms";

export const dynamic = "force-static";

// Route handlers are outside the [lng] layout: they do not receive its params
export async function generateStaticParams() {
    return languages.flatMap(lng => getDeviceSlugs().map(x => ({ slug: x, lng })))
}

/** Markdown version of a device page */
export async function GET(_request: Request, { params }: { params: Promise<{ lng: string, slug: string }> }) {
    const { lng, slug } = await params;
    const { t } = await getT('devices', { lng });

    const config = await getDeviceDefinition(slug);
    const readme = readDeviceReadme(slug, lng);
    // Community references are not translated
    const references = readSlugFile(slug, 'REFERENCES.md');
    const t_opts = { device: config.title ?? slug };

    const deviceEntries = getDeviceEntries(slug);
    const deviceStates = [...new Set(deviceEntries.map(device => device.state))];

    const parts: string[] = [
        readme?.trim() ?? `# ${t('details.title', t_opts)}`,
        `## ${t('status.title')}`,
        deviceStates.map(state => {
            const names = deviceEntries.filter(device => device.state === state).map(deviceName).join(', ');
            return `- **${t('states.' + state)}**: ${t('status.descriptions.' + state)} ${t('status.devices')} ${names}`;
        }).join('\n'),
    ];

    if (config.config.thermostat_type) {
        parts.push(`## ${t('conf.title')}`);
        for (const section of deviceConfigSections(config.config, t)) {
            parts.push(`### ${section.title}`, ...section.paragraphs);
            if (section.items.length > 0) {
                parts.push(section.items.map((item, i) => `${i + 1}. ${item}`).join('\n'));
            }
            if (section.outro) {
                parts.push(section.outro);
            }
        }
    }

    if (references) {
        parts.push(`## ${t('references')}`, t('references_disclaimer'), references.trim());
    }

    return textResponse(absolutizeLinks(parts.join('\n\n')), 'text/markdown');
}
