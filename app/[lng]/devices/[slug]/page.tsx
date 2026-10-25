import { getAlternatesMetadata, getT } from '@/app/i18n';
import { LinkLocale } from '@/components/LinkLocale';
import devices from '@/devicesdb/devices.json';
import { ArrowUturnLeftIcon, ShoppingCartIcon } from '@heroicons/react/16/solid';
import type { DeviceDefinition } from '@/lib/devicedb';
import path from 'path';
import { fallbackLng } from '@/app/i18n/settings';
import IO from 'fs';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Metadata } from 'next';
import { opengraph_defaults } from '@/lib/opengraph';
import rehypeExternalLinks from 'rehype-external-links'
import Semantic from '@/components/Semantic';

import remarkNotes from 'remark-github-blockquote-alert';
import './markdown.css';
import '../state-color.css';
import 'remark-github-blockquote-alert/alert.css';

export async function generateMetadata({ params }: { params: Promise<{ lng: string, slug: string }> }): Promise<Metadata> {
    const { lng, slug } = await params
    const { t } = await getT('devices', { lng })
    const config: DeviceDefinition = (await import(`@/devicesdb/${slug}/config.json`)).default;
    const path = `/devices/${slug}/`
    const alternates = getAlternatesMetadata(path, lng);

    const t_opts = { device: config.title ?? slug }

    return {
        title: t('title_details', t_opts),
        description: t('description_details', t_opts),
        openGraph: {
            title: t('title_details', t_opts),
            description: t('description_details', t_opts),
            type: "website",
            siteName: "Versatile Thermostat",
            url: `/${lng}${path}`,
            ...opengraph_defaults,
        },
        alternates
    }
}

const DeviceConfig: React.FC<{ config: DeviceDefinition['config'], lng: string }> = async ({ config, lng }) => {
    const { t } = await getT('devices', { lng });

    /**
     * Return true if on of defined configs is present
     * @param configs 
     */
    function stepNeed(configs: string[]): boolean {
        return configs.map(section => section in config).includes(true)
    }

    return <section>
        <h2>{t('conf.title')}</h2>
        <h3>{t('conf.step1.title')}</h3>
        <p>{t('conf.step1.section')}</p>
        {config.thermostat_type == 'thermostat_over_climate' && <p>
            {t('conf.step1.over_climate')}
        </p>}
        {config.thermostat_type == 'thermostat_over_switch' && <p>
            {t('conf.step1.over_switch')}
        </p>}
        {config.thermostat_type == 'thermostat_over_valve' && <p>
            {t('conf.step1.over_valve')}
        </p>}

        <h3>{t('conf.step2.title')}</h3>
        <p>{t('conf.step2.section')}</p>
        <ol>
            <li>{t('conf.step2.task1')}</li>
            <li>{t('conf.step2.task2')}</li>
            <li>{t('conf.step2.task3')}</li>
            {config.step_temperature !== undefined && <>
                <li>{t('conf.step2.no_central_main')}</li>
                <li>{t('conf.step2.step_temperature', { step: config.step_temperature })}</li>
            </>}
        </ol>
        <p>{t('conf.finnaly')}</p>

        <h3>{t('conf.step3.title')}</h3>
        <p>{t('conf.step3.section')}</p>
        <ol>
            {config.thermostat_type == 'thermostat_over_climate' && <li>{t('conf.step3.over_climate')}</li>}
            {config.thermostat_type == 'thermostat_over_valve' && <li>{t('conf.step3.over_valve')}</li>}
            {config.thermostat_type == 'thermostat_over_switch' && <li>{t('conf.step3.over_switch')}</li>}
            {config.auto_regulation_mode == 'auto_regulation_valve' && <li>{t('conf.step3.use_regulation')}</li>}
        </ol>
        <p>{t('conf.finnaly')}</p>

        {stepNeed(['minimal_activation_delay', 'minimal_deactivation_delay']) && <>
            <h3>{t('conf.step4.title')}</h3>
            <p>{t('conf.step4.section')}</p>
            <ol>
                {config.minimal_activation_delay && <li>{t('conf.step4.activation_delay', { delay: config.minimal_activation_delay })}</li>}
                {config.minimal_deactivation_delay && <li>{t('conf.step4.deactivation_delay', { delay: config.minimal_deactivation_delay })}</li>}
            </ol>
            <p>{t('conf.finnaly')}</p>
        </>}
    </section>
}

/**
 * Read a markdown file from the device directory
 * @param slug Device directory in devicesdb
 * @param name File name
 * @returns File content or undefined if the file does not exist
 */
function readSlugFile(slug: string, name: string): string | undefined {
    const filePath = path.join(process.cwd(), 'devicesdb', slug, name);
    return IO.existsSync(filePath) ? IO.readFileSync(filePath, {}).toString() : undefined
}

const DevicePage: React.FC<{ params: Promise<{ slug: string, lng: string }> }> = async ({ params }) => {
    const { slug, lng } = await params;
    const { t } = await getT('devices', { lng });
    const { t: commont } = await getT('common', { lng });

    const config: DeviceDefinition = (await import(`@/devicesdb/${slug}/config.json`)).default;
    const readme = (lng != fallbackLng ? readSlugFile(slug, `README-${lng.toUpperCase()}.md`) : undefined) ?? readSlugFile(slug, 'README.md');
    // Community references are not translated
    const references = readSlugFile(slug, 'REFERENCES.md');
    const t_opts = { device: config.title ?? slug }

    const deviceEntries = devices.filter(device => device.slug === slug);
    const deviceStates = [...new Set(deviceEntries.map(device => device.state))];
    const deviceEntry = deviceEntries.find(device => device.affiliate);
    const affiliateUrl = deviceEntry?.affiliate?.[lng as 'fr' | 'de' | 'en'];

    return <>
        <Semantic id={`devices-${lng}-${slug}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": "https://www.versatile-thermostat.org/#website" },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/${slug}/`,
            name: t('title_details', t_opts),
            description: t('description_details', t_opts),
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
                    },
                    {
                        "@type": "ListItem",
                        "name": t('title_details', t_opts),
                        item: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/${slug}/`,
                        position: 3
                    }
                ]
            }
        }} />
        <div className='main-content device-doc' lang={lng} data-pagefind-body>
            <div className='text-blue-900 flex flex-wrap items-start gap-3'>
                <LinkLocale href={'/devices'} className='rounded-full bg-sky-200 px-4 py-3 inline-block'>Retour <ArrowUturnLeftIcon className='h-lh inline' /></LinkLocale>
                {affiliateUrl && <a href={affiliateUrl} target='_blank' rel='noopener noreferrer' className='rounded-full no-underline border-2 border-sky-600 text-sky-600 px-4 py-3 inline-block hover:bg-sky-600 hover:text-white transition-colors'>{t('buy')} <ShoppingCartIcon className='h-lh inline' /></a>}
            </div>
            <section className='my-6 flex flex-col gap-3' aria-label={t('status.title')}>
                {deviceStates.map(state => {
                    const stateReferences = deviceEntries
                        .filter(device => device.state === state)
                        .map(device => device.title ?? [device.manufacturer, device.model].filter(Boolean).join(' - '));

                    return <div key={state} className={`alert-box ${state} flex flex-col items-start gap-1 rounded border-l-4 border-solid px-4 py-3`}>
                        <span className={`badge ${state} shrink-0 rounded px-3 py-1 font-semibold`}>{t('states.' + state)}</span>
                        <p className='m-0'>{t('status.descriptions.' + state)}</p>
                        <p className='m-0 text-sm italic'><strong className='font-bold not-italic'>{t('status.devices')} </strong>{stateReferences.join(', ')}</p>
                    </div>
                })}
            </section>
            {readme ? <Markdown rehypePlugins={[rehypeSlug, rehypeExternalLinks]} remarkPlugins={[remarkGfm, remarkNotes]}>{readme}</Markdown> : <h1>{t('details.title', { device: config.title })}</h1>}
            {config.config.thermostat_type && <DeviceConfig config={config.config} lng={lng} />}
            {references && <section>
                <h2>{t('references')}</h2>
                <div className=''>
                    {t('references_disclaimer')}
                </div>
                <div lang='en'>
                    <Markdown rehypePlugins={[rehypeSlug, rehypeExternalLinks]} remarkPlugins={[remarkGfm, remarkNotes]}>{references}</Markdown>
                </div>
            </section>}
        </div>
    </>
}

export default DevicePage;

export async function generateStaticParams({ params }: { params: { lng: string } }) {
    const { lng } = params;
    const slugs = new Set<string>()
    for (const device of devices) {
        if (!slugs.has(device.slug))
            slugs.add(device.slug);
    }

    return [...slugs.values()].map(x => ({ slug: x, lng }))
}
