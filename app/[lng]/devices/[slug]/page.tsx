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

const DeviceConfig: React.FC<{ config: DeviceDefinition['config'] }> = ({ config }) => {
    return <section>
        <h2>Device configuration</h2>
        <h3>Etape 1</h3>
        <p>
            Allez dans vos paramètres puis intégration puis cliquez sur ajouter une nouvelle intégration. Cherchez Versatile Thermostat.</p>
        {config.thermostat_type == 'thermostat_over_climate' && <p>
            Cliquez sur Thermostat sur un autre thermostat.
        </p>}
        {config.thermostat_type == 'thermostat_over_switch' && <p>
            Cliquez sur Thermostat sur un switch.
        </p>}
        {config.thermostat_type == 'thermostat_over_valve' && <p>
            Cliquez sur Thermostat sur une valve.
        </p>}

        <h3>Etape 2</h3>
        <p>Rentrez dans la section &ldquo;Principaux attributs&rdquo;.</p>
        <ol>
            <li>Choississez un nom pour votre thermostat</li>
            <li>Mettez le capteur de température pour votre pièce</li>
            <li>Si vous utilisez le protocole Zigbee et vous avez une entité &ldquo;last_seen&rdquo; pour votre capteur de température, renseignez le.</li>
        </ol>
        <p>Vous pouvez valider et revenir au menu de configuration.</p>

        <h3>Etape 3</h3>
        <p>Rentrez dans la section sous-jacents.</p>
        <ol>
            {config.thermostat_type == 'thermostat_over_climate' && <li>Ajouter les thermostats qui seront contrôlés</li>}
            {config.thermostat_type == 'thermostat_over_valve' && <li>Ajouter les vannes qui seront contrôlés</li>}
            {config.thermostat_type == 'thermostat_over_switch' && <li>Ajouter les commutateurs qui seront contrôlés</li>}
            {config.auto_regulation_mode == 'auto_regulation_valve' && <li>Dans la section auto-régulation, choisissez &ldquo;controle direct de la vanne&rdquo;</li>}
        </ol>
    </section>
}

const DevicePage: React.FC<{ params: Promise<{ slug: string, lng: string }> }> = async ({ params }) => {
    const { slug, lng } = await params;
    const { t } = await getT('devices');

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
        <DeviceConfig config={config.config} />
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
