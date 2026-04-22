import { useT } from "@/app/i18n/client";
import { certConfig, typeConfig, VTPlugin } from "@/lib/plugindb";
import { CloseButton, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Trans } from "react-i18next";

type PluginModalProps = {
    plugin?: VTPlugin;
    onClose: () => void;
};

const MyHAIntegrationBadge: React.FC<{ slug: string, category: "Integration" | "plugin" }> = ({ slug, category }) => {
    const [owner, repo] = slug.split('/');
    return (
        <a href={`https://my.home-assistant.io/redirect/hacs_repository/?owner=${owner}&repository=${repo}&category=${category}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={56} src="https://my.home-assistant.io/badges/hacs_repository.svg" alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." />
        </a>
    );
};

const MyHAAddonBadge: React.FC<{ slug: string }> = ({ slug }) => {
    return (
        <a href={`https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=${encodeURIComponent('https://github.com/' + slug)}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={56} src="https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg" alt="Open your Home Assistant instance and show the add app repository dialog with a specific repository URL pre-filled." />
        </a>
    );
};

const MyHABlueprintBadge: React.FC<{ url: string }> = ({ url }) => {
    return (
        <a href={`https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer noopener">
            <Image width={300} height={56} src="https://my.home-assistant.io/badges/blueprint_import.svg" alt="Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled." />
        </a>
    );
};

const PluginModal: React.FC<PluginModalProps> = ({ plugin, onClose }) => {
    const { t } = useT('plugins');

    const typeStyle = plugin ? typeConfig[plugin.type] : typeConfig.integration;
    const certStyle = plugin ? certConfig[plugin.certification] : certConfig.community;

    return (
        <Dialog
            open={!!plugin}
            onClose={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/70 duration-300 transition-all"
        >
            <div className="fixed flex w-screen items-center justify-center p-4">
                <DialogPanel
                    className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 shadow-2xl overflow-hidden"
                    style={{ '--card-color': typeStyle.color } as React.CSSProperties & { '--card-color': string }}
                >
                    {/* Header — accent bar matching card type color */}
                    <DialogTitle
                        className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700"
                        style={{ borderTopColor: typeStyle.color, borderTopWidth: 3 }}
                    >
                        <div className="flex-1 min-w-0">
                            <h2 className="m-0 truncate text-lg font-semibold text-gray-900 dark:text-white">
                                {plugin?.name}
                            </h2>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                <Trans
                                    t={t}
                                    i18nKey="from"
                                    values={{ author: plugin?.author ?? plugin?.slug?.split('/')[0] }}
                                    components={[<span key="0" className="font-medium text-slate-700 dark:text-slate-300"></span>]}
                                />
                                {plugin?.slug && (
                                    <a
                                        href={"https://github.com/" + plugin.slug}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="text-blue-500 hover:underline shrink-0"
                                    >
                                        <Image
                                            width={80} height={20}
                                            style={{ height: '1.4em', width: 'auto' }}
                                            alt="GitHub Repo stars"
                                            src={"https://img.shields.io/github/stars/" + plugin.slug}
                                        />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Type badge */}
                        <div
                            className="px-2.5 py-1 rounded-md font-mono text-[0.6875rem] font-medium uppercase shrink-0"
                            style={{
                                background: typeStyle.bgColor,
                                color: typeStyle.color,
                                border: `1px solid ${typeStyle.color}20`,
                            }}
                        >
                            {plugin && t(`types.${plugin.type}`)}
                        </div>

                        <CloseButton
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 cursor-pointer transition-colors shrink-0"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </CloseButton>
                    </DialogTitle>

                    {/* Body */}
                    <div className="px-5 py-4">
                        <Description className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {plugin?.description}
                        </Description>
                    </div>

                    {/* Footer */}
                    <div
                        className="flex items-center justify-between px-5 py-3 border-t dark:border-slate-700"
                        style={{ borderColor: 'rgba(18, 18, 20, 0.06)' }}
                    >
                        {/* Certification badge */}
                        <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                            style={{
                                background: `${certStyle.color}08`,
                                border: `1px solid ${certStyle.color}20`,
                            }}
                        >
                            <span className="text-xs leading-none" style={{ color: certStyle.color }}>
                                {certStyle.icon}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: certStyle.color }}>
                                {plugin && t(`certification.${plugin.certification}`)}
                            </span>
                        </div>

                        {/* HA install badges */}
                        <div className="flex items-center">
                            {plugin && ["integration", "interface"].includes(plugin.type) && (
                                <MyHAIntegrationBadge slug={plugin.slug} category={plugin.type === "integration" ? "Integration" : "plugin"} />
                            )}
                            {plugin?.type === "addon" && (
                                <MyHAAddonBadge slug={plugin.slug} />
                            )}
                            {plugin?.type === "blueprint" && (
                                <MyHABlueprintBadge url={plugin.url ?? ''} />
                            )}
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default PluginModal;
