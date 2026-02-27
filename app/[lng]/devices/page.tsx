import ListDevices from "./ListDevices";
import devices_list from '@/devicesdb/devices.json';

import { getT } from "@/app/i18n";
export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params
    const { t } = await getT('devices', { lng })
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
        },
    }
}

const DevicesPage: React.FC = async () => {
    return <ListDevices devices={devices_list} />
}

export default DevicesPage;