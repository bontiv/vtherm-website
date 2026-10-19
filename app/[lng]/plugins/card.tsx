import { useT } from "@/app/i18n/client";
import { certConfig, typeConfig, VTPlugin } from "@/lib/plugindb";
import { ChevronRightIcon, StarIcon } from "@heroicons/react/24/outline";
import { Trans } from "react-i18next";

interface PluginCardProps {
    plugin: VTPlugin;
}

export function PluginCard({ plugin }: PluginCardProps) {
    const typeStyle = typeConfig[plugin.type];
    const certStyle = certConfig[plugin.certification];
    const TypeIcon = typeStyle.icon;
    const CertIcon = certStyle.Icon;
    const { t, i18n } = useT('plugins');

    const nameKey = `name_${i18n.language}` as keyof VTPlugin;
    const name = i18n.language != 'en' && nameKey in plugin ? plugin[nameKey] as string : plugin.name;
    const descriptionKey = `description_${i18n.language}` as keyof VTPlugin;
    const description = i18n.language != 'en' && descriptionKey in plugin ? plugin[descriptionKey] as string : plugin.description;

    return (
        <div
            className="group h-full flex flex-col gap-3 p-4 rounded-xl
            bg-white dark:bg-gray-800
            border border-slate-200 dark:border-slate-700
            shadow-sm hover:shadow-md hover:border-(--card-color)/50
            transition-all duration-200"
            style={{
                '--card-color': `${typeStyle.color}`
            } as React.CSSProperties & { '--card-color': string }}
        >
            {/* Header: type icon, name, author and certification */}
            <div className="flex items-start gap-3">
                <div
                    className="flex items-center justify-center size-10 rounded-lg shrink-0"
                    style={{ background: typeStyle.bgColor, color: typeStyle.color }}
                >
                    <TypeIcon className="size-5" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="m-0 p-0 line-clamp-2 text-base font-semibold text-slate-900 dark:text-white">
                        {name}
                    </h3>
                    <p className="m-0 p-0 truncate text-xs text-slate-500 dark:text-slate-400">
                        {t(`types.${plugin.type}`)} ·{' '}
                        <Trans t={t} i18nKey="from" values={{ author: plugin.author ?? plugin?.slug?.split('/')[0] }}
                            components={[
                                <span key="0" className="font-medium text-slate-600 dark:text-slate-300"></span>
                            ]}
                        />
                    </p>
                </div>

                {plugin.certification !== 'community' && (
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{
                            background: `color-mix(in srgb, ${certStyle.color}, transparent 88%)`,
                            color: certStyle.color,
                        }}
                    >
                        <CertIcon className="size-3.5" aria-hidden="true" />
                        {t(`certification.${plugin.certification}`)}
                    </span>
                )}
            </div>

            {/* Description, clamped so that every card keeps the same rhythm */}
            <div
                className="flex-1 m-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3
                [&_*]:inline [&_p+p]:before:content-['_'] [&_li+li]:before:content-['_·_']"
                dangerouslySetInnerHTML={{ __html: description }}
            >
            </div>

            {/* Footer: family, stars and details hint */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                {plugin.family && (
                    <span className="px-2 py-0.5 rounded-md text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {t(`families.${plugin.family}`)}
                    </span>
                )}
                <span className="flex-1" />
                {!!plugin.stars && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400" title={t('stars', { count: plugin.stars })}>
                        <StarIcon className="size-4" aria-hidden="true" />
                        {plugin.stars}
                    </span>
                )}
                <ChevronRightIcon
                    className="size-4 text-slate-400 group-hover:text-(--card-color) group-hover:translate-x-0.5 transition-all duration-200"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
}
