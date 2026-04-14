import type { Metadata } from 'next';
import PluginTable from "./table";

export const metadata: Metadata = {
    title: "Plugins et intégrations",
};

const pluginPage: React.FC = () => {
    return (<PluginTable />);
}

export default pluginPage;
