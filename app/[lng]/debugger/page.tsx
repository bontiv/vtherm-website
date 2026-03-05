
import { getT } from "@/app/i18n";
import DynamicDebugger from './debugger';
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params
    const { t } = await getT('analyzer', { lng })
    return {
        title: t('title'),
        description: t('description'),
        openGraph: {
            title: t('title'),
            siteName: "Versatile Thermostat",
            type: "website"
        }
    }
}

const DebuggerPage: React.FC = () => {
    return (
        <DynamicDebugger />
    );
}

export default DebuggerPage;
