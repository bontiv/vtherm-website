import { getT } from "@/app/i18n";
import { languages } from "@/app/i18n/settings";
import devices from '@/devicesdb/devices.json';
import { deviceName, getDeviceDefinition } from "@/lib/devicecontent";
import { linkItem, textResponse } from "@/lib/llms";
import { pageUrl } from "@/lib/semantic";

export const dynamic = "force-static";

const STATES = ['supported', 'community', 'partially', 'unsupported'];

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

/** Index of the compatible devices, linked to the Markdown version of each device page */
export async function GET(_request: Request, { params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('devices', { lng });

    const sections: string[] = [];
    for (const state of STATES) {
        const stateDevices = devices.filter(device => device.state === state);
        const slugs = [...new Set(stateDevices.map(device => device.slug))];
        if (slugs.length === 0) {
            continue;
        }

        const items = await Promise.all(slugs.map(async slug => {
            const config = await getDeviceDefinition(slug);
            const entries = stateDevices.filter(device => device.slug === slug);
            const types = [...new Set(entries.map(device => t(`types.${device.type}`)))].join(', ');
            return linkItem(config.title ?? slug, pageUrl(lng, `/devices/${slug}/index.md`), `${entries.map(deviceName).join(', ')} (${types})`);
        }));
        sections.push(`## ${t('states.' + state)}`, t('status.descriptions.' + state), items.join('\n'));
    }

    return textResponse([
        `# Versatile Thermostat - ${t('title')}`,
        `> ${t('description')}`,
        t('notice'),
        ...sections,
    ].join('\n\n'));
}
