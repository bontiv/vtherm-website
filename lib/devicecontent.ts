import path from 'path';
import IO from 'fs';
import type { TFunction } from 'i18next';
import { fallbackLng } from '@/app/i18n/settings';
import devices from '@/devicesdb/devices.json';
import type { DeviceDefinition } from '@/lib/devicedb';

/**
 * Server-side content of a device page, shared by the HTML page and its Markdown version.
 */

export type DeviceEntry = typeof devices[number];

/** A step of the configuration guide of a device */
export interface ConfigSection {
    title: string;
    paragraphs: string[];
    /** Ordered list of tasks */
    items: string[];
    outro?: string;
}

/**
 * Read a markdown file from the device directory
 * @param slug Device directory in devicesdb
 * @param name File name
 * @returns File content or undefined if the file does not exist
 */
export function readSlugFile(slug: string, name: string): string | undefined {
    const filePath = path.join(process.cwd(), 'devicesdb', slug, name);
    return IO.existsSync(filePath) ? IO.readFileSync(filePath, {}).toString() : undefined
}

/** README of the device in the requested language, falling back to the English one */
export function readDeviceReadme(slug: string, lng: string): string | undefined {
    return (lng != fallbackLng ? readSlugFile(slug, `README-${lng.toUpperCase()}.md`) : undefined) ?? readSlugFile(slug, 'README.md');
}

export async function getDeviceDefinition(slug: string): Promise<DeviceDefinition> {
    return (await import(`@/devicesdb/${slug}/config.json`)).default;
}

/** Entries of devices.json sharing this slug */
export function getDeviceEntries(slug: string): DeviceEntry[] {
    return devices.filter(device => device.slug === slug);
}

/** Display name of a devices.json entry */
export function deviceName(device: DeviceEntry): string {
    return device.title ?? [device.manufacturer, device.model].filter(Boolean).join(' - ');
}

/** Distinct device slugs, in database order */
export function getDeviceSlugs(): string[] {
    return [...new Set(devices.map(device => device.slug))];
}

/**
 * Steps of the configuration guide of a device
 * @param t translation function of the `devices` namespace
 */
export function deviceConfigSections(config: DeviceDefinition['config'], t: TFunction): ConfigSection[] {
    /**
     * Return true if on of defined configs is present
     * @param configs
     */
    function stepNeed(configs: string[]): boolean {
        return configs.map(section => section in config).includes(true)
    }

    const sections: ConfigSection[] = [];

    sections.push({
        title: t('conf.step1.title'),
        paragraphs: [
            t('conf.step1.section'),
            ...(config.thermostat_type == 'thermostat_over_climate' ? [t('conf.step1.over_climate')] : []),
            ...(config.thermostat_type == 'thermostat_over_switch' ? [t('conf.step1.over_switch')] : []),
            ...(config.thermostat_type == 'thermostat_over_valve' ? [t('conf.step1.over_valve')] : []),
        ],
        items: [],
    });

    sections.push({
        title: t('conf.step2.title'),
        paragraphs: [t('conf.step2.section')],
        items: [
            t('conf.step2.task1'),
            t('conf.step2.task2'),
            t('conf.step2.task3'),
            ...(config.step_temperature !== undefined ? [
                t('conf.step2.no_central_main'),
                t('conf.step2.step_temperature', { step: config.step_temperature }),
            ] : []),
        ],
        outro: t('conf.finnaly'),
    });

    sections.push({
        title: t('conf.step3.title'),
        paragraphs: [t('conf.step3.section')],
        items: [
            ...(config.thermostat_type == 'thermostat_over_climate' ? [t('conf.step3.over_climate')] : []),
            ...(config.thermostat_type == 'thermostat_over_valve' ? [t('conf.step3.over_valve')] : []),
            ...(config.thermostat_type == 'thermostat_over_switch' ? [t('conf.step3.over_switch')] : []),
            ...(config.auto_regulation_mode == 'auto_regulation_valve' ? [t('conf.step3.use_regulation')] : []),
        ],
        outro: t('conf.finnaly'),
    });

    if (stepNeed(['minimal_activation_delay', 'minimal_deactivation_delay'])) {
        sections.push({
            title: t('conf.step4.title'),
            paragraphs: [t('conf.step4.section')],
            items: [
                ...(config.minimal_activation_delay ? [t('conf.step4.activation_delay', { delay: config.minimal_activation_delay })] : []),
                ...(config.minimal_deactivation_delay ? [t('conf.step4.deactivation_delay', { delay: config.minimal_deactivation_delay })] : []),
            ],
            outro: t('conf.finnaly'),
        });
    }

    return sections;
}
