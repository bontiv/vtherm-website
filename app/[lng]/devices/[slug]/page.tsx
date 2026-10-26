import { getAlternatesMetadata, getT } from '@/app/i18n';
import { ShoppingCartIcon } from '@heroicons/react/16/solid';
import type { DeviceDefinition } from '@/lib/devicedb';
import { deviceConfigSections, deviceName, getDeviceDefinition, getDeviceEntries, getDeviceSlugs, readDeviceReadme, readSlugFile } from '@/lib/devicecontent';
import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Metadata } from 'next';
import { opengraph_defaults } from '@/lib/opengraph';
import rehypeExternalLinks from 'rehype-external-links'
import Semantic from '@/components/Semantic';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { breadcrumb } from '@/lib/semantic';

import remarkNotes from 'remark-github-blockquote-alert';
import './markdown.css';
import '../state-color.css';
import 'remark-github-blockquote-alert/alert.css';

export async function generateMetadata({ params }: { params: Promise<{ lng: string, slug: string }> }): Promise<Metadata> {
    const { lng, slug } = await params
    const { t } = await getT('devices', { lng })
    const config = await getDeviceDefinition(slug);
    const path = `/devices/${slug}/`
    const alternates = getAlternatesMetadata(path, lng, { markdown: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}${path}index.md` });

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

    return <section>
        <h2>{t('conf.title')}</h2>
        {deviceConfigSections(config, t).map(section => <React.Fragment key={section.title}>
            <h3>{section.title}</h3>
            {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            {section.items.length > 0 && <ol>
                {section.items.map(item => <li key={item}>{item}</li>)}
            </ol>}
            {section.outro && <p>{section.outro}</p>}
        </React.Fragment>)}
    </section>
}

const DevicePage: React.FC<{ params: Promise<{ slug: string, lng: string }> }> = async ({ params }) => {
    const { slug, lng } = await params;
    const { t } = await getT('devices', { lng });
    const { t: commont } = await getT('common', { lng });

    const config = await getDeviceDefinition(slug);
    const readme = readDeviceReadme(slug, lng);
    // Community references are not translated
    const references = readSlugFile(slug, 'REFERENCES.md');
    const t_opts = { device: config.title ?? slug }

    const deviceEntries = getDeviceEntries(slug);
    const deviceStates = [...new Set(deviceEntries.map(device => device.state))];

    const crumbs = [
        { name: commont('menu.devices'), path: '/devices/' },
        { name: config.title ?? slug, path: `/devices/${slug}/` },
    ];

    return <>
        <Breadcrumbs lng={lng} items={crumbs} />
        <Semantic id={`devices-${lng}-${slug}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": "https://www.versatile-thermostat.org/#website" },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/${slug}/`,
            name: t('title_details', t_opts),
            description: t('description_details', t_opts),
            breadcrumb: breadcrumb(lng, commont('menu.home'), crumbs),
        }} />
        <div className='main-content device-doc' lang={lng} data-pagefind-body>
            <section className='mb-6 flex flex-col gap-3' aria-label={t('status.title')}>
                {deviceStates.map(state => {
                    const stateDevices = deviceEntries.filter(device => device.state === state);

                    return <div key={state} className={`alert-box ${state} flex flex-col items-start gap-1 rounded border-l-4 border-solid px-4 py-3`}>
                        <span className={`badge ${state} shrink-0 rounded px-3 py-1 font-semibold`}>{t('states.' + state)}</span>
                        <p className='m-0'>{t('status.descriptions.' + state)}</p>
                        <p className='m-0 text-sm italic'>
                            <strong className='font-bold not-italic'>{t('status.devices')} </strong>
                            {stateDevices.map((device, index) => {
                                const name = deviceName(device);
                                const affiliateUrl = device.affiliate?.[lng as 'fr' | 'de' | 'en'];

                                return <span key={`${device.manufacturer}-${device.model}-${index}`}>
                                    {index > 0 && ', '}
                                    {affiliateUrl ? <a href={affiliateUrl} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-1 hover:underline'>
                                        <ShoppingCartIcon className='h-4 w-4 shrink-0' aria-hidden='true' />
                                        {name}
                                    </a> : name}
                                </span>
                            })}
                        </p>
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
    return getDeviceSlugs().map(x => ({ slug: x, lng }))
}
