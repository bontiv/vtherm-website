import { useT } from "@/app/i18n/client";
import { certConfig, typeConfig, VTPlugin } from "@/lib/plugindb";
import { CloseButton, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { HeartIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { HTMLProps, useCallback, useEffect, useState } from "react";
import { Trans } from "react-i18next";
import yaml from 'js-yaml';
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import remarkNotes from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';
import '@/app/[lng]/docs/[docFile]/markdown.css';
import { AnimatePresence, motion } from "motion/react";
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

type PluginModalProps = {
    plugin?: VTPlugin;
    onClose: () => void;
};

type FundingInfo = {
    community_bridge?: string;
    github?: string | string[];
    issuehunt?: string;
    ko_fi?: string;
    liberapay?: string;
    open_collective?: string;
    patreon?: string;
    tidelift?: string;
    polar?: string;
    buy_me_a_coffee?: string;
    thanks_dev?: string;
    custom?: string | string[];
}


function parseFundingData(data: string): FundingInfo {
    const funding: FundingInfo = {};
    try {
        const parsedData = yaml.load(data) as Record<string, string | string[]>;
        for (const key in parsedData) {
            if (parsedData.hasOwnProperty(key)) {
                funding[key as keyof FundingInfo] = parsedData[key] as (string & string[]) | undefined;
            }
        }
    } catch (e) {
        console.error("Error parsing funding data:", e);
    }
    return funding;
}

const LinkBlank: React.FC<HTMLProps<HTMLAnchorElement>> = (props) => <a {...props} target="_blank" rel="noreferrer noopener" />;

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

const GithubLogo: React.FC<HTMLProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M237.9 461.4C237.9 463.4 235.6 465 232.7 465C229.4 465.3 227.1 463.7 227.1 461.4C227.1 459.4 229.4 457.8 232.3 457.8C235.3 457.5 237.9 459.1 237.9 461.4zM206.8 456.9C206.1 458.9 208.1 461.2 211.1 461.8C213.7 462.8 216.7 461.8 217.3 459.8C217.9 457.8 216 455.5 213 454.6C210.4 453.9 207.5 454.9 206.8 456.9zM251 455.2C248.1 455.9 246.1 457.8 246.4 460.1C246.7 462.1 249.3 463.4 252.3 462.7C255.2 462 257.2 460.1 256.9 458.1C256.6 456.2 253.9 454.9 251 455.2zM316.8 72C178.1 72 72 177.3 72 316C72 426.9 141.8 521.8 241.5 555.2C254.3 557.5 258.8 549.6 258.8 543.1C258.8 536.9 258.5 502.7 258.5 481.7C258.5 481.7 188.5 496.7 173.8 451.9C173.8 451.9 162.4 422.8 146 415.3C146 415.3 123.1 399.6 147.6 399.9C147.6 399.9 172.5 401.9 186.2 425.7C208.1 464.3 244.8 453.2 259.1 446.6C261.4 430.6 267.9 419.5 275.1 412.9C219.2 406.7 162.8 398.6 162.8 302.4C162.8 274.9 170.4 261.1 186.4 243.5C183.8 237 175.3 210.2 189 175.6C209.9 169.1 258 202.6 258 202.6C278 197 299.5 194.1 320.8 194.1C342.1 194.1 363.6 197 383.6 202.6C383.6 202.6 431.7 169 452.6 175.6C466.3 210.3 457.8 237 455.2 243.5C471.2 261.2 481 275 481 302.4C481 398.9 422.1 406.6 366.2 412.9C375.4 420.8 383.2 435.8 383.2 459.3C383.2 493 382.9 534.7 382.9 542.9C382.9 549.4 387.5 557.3 400.2 555C500.2 521.8 568 426.9 568 316C568 177.3 455.5 72 316.8 72zM169.2 416.9C167.9 417.9 168.2 420.2 169.9 422.1C171.5 423.7 173.8 424.4 175.1 423.1C176.4 422.1 176.1 419.8 174.4 417.9C172.8 416.3 170.5 415.6 169.2 416.9zM158.4 408.8C157.7 410.1 158.7 411.7 160.7 412.7C162.3 413.7 164.3 413.4 165 412C165.7 410.7 164.7 409.1 162.7 408.1C160.7 407.5 159.1 407.8 158.4 408.8zM190.8 444.4C189.2 445.7 189.8 448.7 192.1 450.6C194.4 452.9 197.3 453.2 198.6 451.6C199.9 450.3 199.3 447.3 197.3 445.4C195.1 443.1 192.1 442.8 190.8 444.4zM179.4 429.7C177.8 430.7 177.8 433.3 179.4 435.6C181 437.9 183.7 438.9 185 437.9C186.6 436.6 186.6 434 185 431.7C183.6 429.4 181 428.4 179.4 429.7z" /></svg>

const FundingBadge: React.FC<{ funding: FundingInfo }> = ({ funding }) => {
    return (
        <div className="flex border align-middle items-center gap-2 px-2 py-1 rounded-2xl border-fuchsia-400 bg-fuchsia-50 text-red-500">
            <HeartIcon className="h-6 w-6" />
            {funding.github && (
                <a href={typeof funding.github === 'string' ? funding.github : funding.github[0]} target="_blank" rel="noreferrer noopener">
                    <GithubLogo />
                </a>
            )}
            {funding.buy_me_a_coffee && (
                <a href={'https://buymeacoffee.com/' + funding.buy_me_a_coffee} title="Buy Me a Coffee" className="" target="_blank" rel="noreferrer noopener">
                    <Image height="32" width="32" src="https://cdn.simpleicons.org/buymeacoffee/FFDD00" alt={"Buy me a Coffee"} />
                </a>
            )}
            {funding.custom && (
                <a href={typeof funding.custom === 'string' ? funding.custom : funding.custom[0]} target="_blank" rel="noreferrer noopener">
                    <HeartIcon className="h-6 w-6" />
                </a>
            )}
        </div>
    );
};

const PluginModal: React.FC<PluginModalProps> = ({ plugin, onClose }) => {
    const { t } = useT('plugins');
    const [funding, setFunding] = useState<FundingInfo>({});
    const [readme, setReadme] = useState<string>('');

    const typeStyle = plugin ? typeConfig[plugin.type] : typeConfig.integration;
    const certStyle = plugin ? certConfig[plugin.certification] : certConfig.community;

    useEffect(() => {
        if (plugin && plugin.slug) {
            fetch(`https://raw.githubusercontent.com/${plugin.slug}/HEAD/.github/FUNDING.yml`)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    return ''; // Return empty string if no funding file is found
                })
                .then(data => {
                    // Parse the YAML data and set the funding information
                    setFunding(parseFundingData(data));
                })
                .catch(error => {
                    console.warn("Error fetching funding data:", error);
                });
            fetch(`https://raw.githubusercontent.com/${plugin.slug}/HEAD/README.md`)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    return ''; // Return empty string if no README is found
                })
                .then(data => {
                    setReadme(data);
                })
                .catch(error => {
                    console.warn("Error fetching README data:", error);
                });
        }
        return () => {
            setFunding({}); // Clear funding info when plugin changes or modal closes
            setReadme(''); // Clear README info when plugin changes or modal closes
        }
    }, [plugin]);

    console.log("Funding info:", Object.keys(funding).length, funding);

    const link_formatting = useCallback((link_url: string) => {
        if (link_url.startsWith('http'))
            return link_url
        if (link_url.endsWith('.md'))
            return `https://www.github.com/${plugin?.slug || ''}/blob/HEAD/${link_url}`;
        return `https://raw.githubusercontent.com/${plugin?.slug || ''}/HEAD/${link_url}`;;
    }, [plugin]);

    return (
        <AnimatePresence>
            {!!plugin && (
                <Dialog
                    open={!!plugin}
                    onClose={onClose}
                    static
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-600/70 duration-300 transition-all"
                >
                    <div className="fixed w-screen items-center justify-center p-4">
                        <DialogPanel
                            className="container mx-auto max-h-lvh flex flex-col rounded-xl bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-600 shadow-2xl overflow-hidden"
                            style={{ '--card-color': typeStyle.color } as React.CSSProperties & { '--card-color': string }}
                        >
                            {/* Header — accent bar matching card type color */}
                            <DialogTitle
                                className=" px-5 py-4 border-b border-slate-200 dark:border-slate-700"
                                style={{ borderTopColor: typeStyle.color, borderTopWidth: 3 }}
                            >
                                {/* Name and type badge */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="m-0 p-1 truncate text-lg font-semibold text-gray-900 dark:text-white">
                                            {plugin?.name}
                                        </h2>

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
                                </div>


                            </DialogTitle>

                            {/* Body */}

                            <div className="flex items-center border-b border-slate-200 mx-5 p-2 justify-between gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                <div>
                                    <Trans
                                        t={t}
                                        i18nKey="from"
                                        values={{ author: plugin?.author ?? plugin?.slug?.split('/')[0] }}
                                        components={[<span key="0" className="font-medium text-slate-700 dark:text-slate-300"></span>]}
                                    />
                                </div>

                                {plugin?.slug && (<>

                                    <a
                                        href={"https://github.com/" + plugin.slug}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="text-blue-500 hover:underline shrink-0"
                                    >
                                        <GithubLogo className="h-8" alt="Github Repository" />
                                    </a>
                                    {Object.keys(funding).length > 0 && <FundingBadge funding={funding} />}
                                    <div className="flex-1" />
                                    <a
                                        href={"https://github.com/" + plugin.slug}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="text-blue-500 hover:underline"
                                    >
                                        <Image
                                            width={80} height={20}
                                            style={{ height: '1.4em', width: 'auto' }}
                                            alt="GitHub Repo stars"
                                            src={"https://img.shields.io/github/stars/" + plugin.slug}
                                        />
                                    </a>

                                </>
                                )}
                            </div>

                            <motion.div className="px-5 py-4 overflow-y-scroll" style={{ maxHeight: '70vh' }} initial={{ height: 0 }} animate={{ height: '70vh' }} exit={{ height: 0 }}>
                                <Description className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {readme.length > 0 ?
                                        <div className="markdown-body">
                                            <Markdown
                                                rehypePlugins={[rehypeSlug, rehypeRaw, rehypeSanitize]}
                                                remarkPlugins={[remarkGfm, remarkNotes]}
                                                components={{ a: LinkBlank }}
                                                urlTransform={link_formatting}
                                            >{readme}</Markdown>
                                        </div>
                                        : <div dangerouslySetInnerHTML={{ __html: plugin?.description ?? '' }} />}
                                </Description>
                            </motion.div>

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
            )}
        </AnimatePresence>
    );
};

export default PluginModal;
