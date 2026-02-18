import { LinkLocale } from '@/components/LinkLocale';
import devices from '@/devicesdb/devices.json';
import { ArrowUturnLeftIcon } from '@heroicons/react/16/solid';

const DevicePage: React.FC<{ params: Promise<{ slug: string }> }> = async ({ params }) => {
    const { slug } = await params;

    const config = await import(`@/devicesdb/${slug}/config.json`)
    console.log(config.default)

    return <div>
        <div className='text-blue-900 flex flex-row-reverse'>
            <LinkLocale href={'/devices'} className='rounded-full bg-sky-200 px-4 py-3'>Retour <ArrowUturnLeftIcon className='h-lh inline' /></LinkLocale>
        </div>
        Plese read the documentation.
        We work on this page to assist you.
    </div>
}

export default DevicePage;

export async function generateStaticParams({ params }: any) {
    const { lng } = params;
    const slugs = new Set<string>()
    for (const device of devices) {
        slugs.has(device.slug) || slugs.add(device.slug);
    }

    return [...slugs.values()].map(x => ({ slug: x, lng }))
}
