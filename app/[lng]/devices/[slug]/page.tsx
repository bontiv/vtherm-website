import { getT } from '@/app/i18n';
import { LinkLocale } from '@/components/LinkLocale';
import devices from '@/devicesdb/devices.json';
import { ArrowUturnLeftIcon } from '@heroicons/react/16/solid';
import type { DeviceDefinition } from '@/lib/devicedb';
import path from 'path';
import { fallbackLng } from '@/app/i18n/settings';
import IO from 'fs';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

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

const DevicePage: React.FC<{ params: Promise<{ slug: string, lng: string }> }> = async ({ params }) => {
    const { slug, lng } = await params;
    const { t } = await getT('devices', { lng });

    const config: DeviceDefinition = (await import(`@/devicesdb/${slug}/config.json`)).default;
    const readMePathLng = path.join(process.cwd(), 'devicesdb', slug, `README${lng != fallbackLng ? `-${lng.toUpperCase()}` : ''}.md`);
    const readMePathFallback = path.join(process.cwd(), 'devicesdb', slug, 'README.md');
    const readMePath = IO.existsSync(readMePathLng) ? readMePathLng : readMePathFallback

    const readme: string | undefined = IO.existsSync(readMePath) ? IO.readFileSync(readMePath, {}).toString() : undefined

    return <div className='main-content'>
        <div className='text-blue-900 flex flex-wrap items-start'>
            <LinkLocale href={'/devices'} className='rounded-full bg-sky-200 px-4 py-3 inline-block'>Retour <ArrowUturnLeftIcon className='h-lh inline' /></LinkLocale>
        </div>
        {readme ? <Markdown rehypePlugins={[rehypeSlug]} remarkPlugins={[remarkGfm]}>{readme}</Markdown> : <h1>{t('details.title', { device: config.title })}</h1>}
        <DeviceConfig config={config.config} lng={lng} />
    </div>
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
