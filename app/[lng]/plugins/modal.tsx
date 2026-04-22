import { VTPlugin } from "@/lib/plugindb";
import { CloseButton, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

type PluginModalProps = {
    plugin?: VTPlugin;
    onClose: () => void;
};

const MyHAIntegrationBadge: React.FC<{ slug: string }> = ({ slug }) => {
    const [owner, repo] = slug.split('/');

    return (
        <a href={`https://my.home-assistant.io/redirect/hacs_repository/?owner=${owner}&repository=${repo}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={200} src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." />
        </a>
    );
};

const MyHAAddonBadge: React.FC<{ slug: string }> = ({ slug }) => {
    return (
        <a href={`https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=${encodeURIComponent('https://github.com/' + slug)}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={30} src="https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg" alt="Open your Home Assistant instance and show the add app repository dialog with a specific repository URL pre-filled." />
        </a>
    );
}

const MyHABlueprintBadge: React.FC<{ url: string }> = ({ url }) => {
    return (
        <a href={`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={30} src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." />
        </a>
    );
};

const PluginModal: React.FC<PluginModalProps> = ({ plugin, onClose }) => {
    return (
        <Dialog open={!!plugin} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/70 duration-500 transition-all">
            {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-4">Plugin Details</h2>
                <p className="text-gray-600 dark:text-slate-300">
                    This is a simple modal for displaying plugin details.
                </p>
            </div> */}
            <div className="fixed flex w-screen items-center justify-center p-4">
                <DialogPanel className="max-w-lg space-y-4 border bg-white rounded-xl shadow-2xl shadow-blue-50 border-slate-500">
                    <DialogTitle className="font-bold bg-primary rounded-t-xl p-2 flex justify-between items-center">
                        <div className="px-2 text-white font-semibold text-lg">{plugin?.name}</div>
                        <CloseButton onClick={onClose} className="text-gray-300 hover:text-gray-700 cursor-pointer dark:text-gray-500 dark:hover:text-gray-700">
                            <XMarkIcon className="h-8" />
                        </CloseButton>
                    </DialogTitle>

                    <Description className="text-gray-600  px-4">
                        {plugin?.description}
                    </Description>
                    <div className="p-2 flex justify-between">

                        {plugin != undefined && ["integration", "interface"].includes(plugin.type) && <MyHAIntegrationBadge slug={plugin.slug} />}
                        {plugin != undefined && plugin.type == "addon" && <MyHAAddonBadge slug={plugin.slug} />}
                        {plugin != undefined && plugin.type == "blueprint" && <MyHABlueprintBadge url={plugin.url ?? ''} />}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default PluginModal;
