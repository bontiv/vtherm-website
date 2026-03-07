import ListDevices from "./ListDevices";
import devices_list from '@/devicesdb/devices.json';

import { getAlternatesMetadata, getT } from "@/app/i18n";
import { Metadata } from "next";
export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('devices', { lng });
    const alternates = getAlternatesMetadata('/devices/', lng);
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
            siteName: "Versatile Thermostat",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/devices/`,
        },
        alternates,
    }
}

const DevicesPage: React.FC = async () => {
    return <ListDevices devices={devices_list} />
}

export default DevicesPage;