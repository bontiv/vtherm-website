import ListDevices from "./ListDevices";
import devices_list from '@/devicesdb/devices.json';

const DevicesPage: React.FC = async () => {
    return <ListDevices devices={devices_list} />
}

export default DevicesPage;