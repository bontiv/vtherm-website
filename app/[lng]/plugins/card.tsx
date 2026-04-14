type PluginType = 'blueprint' | 'integration' | 'interface';
type CertificationLevel = 'community' | 'recommended' | 'maintainer';

interface Plugin {
    id: string;
    slug: string,
    name: string;
    author: string;
    description: string;
    type: PluginType;
    certification: CertificationLevel;
}

interface PluginCardProps {
    plugin: Plugin;
    index: number;
}

const typeConfig = {
    blueprint: {
        label: 'Blueprint',
        color: '#306BE5',
        bgColor: 'rgba(48, 107, 229, 0.08)'
    },
    integration: {
        label: 'Intégration',
        color: '#E67249',
        bgColor: 'rgba(230, 114, 73, 0.08)'
    },
    interface: {
        label: 'Interface',
        color: '#3EB0F2',
        bgColor: 'rgba(62, 176, 242, 0.08)'
    }
};

const certConfig = {
    maintainer: {
        label: 'Officiel',
        color: 'var(--color-vtherm-tertiary)',
        icon: '★'
    },
    recommended: {
        label: 'Recommandé',
        color: 'var(--color-vtherm-quaternary)',
        icon: '◆'
    },
    community: {
        label: 'Communautaire',
        color: 'var(--color-vtherm-secondary)',
        icon: '●'
    }
};

export function PluginCard({ plugin }: PluginCardProps) {
    const typeStyle = typeConfig[plugin.type];
    const certStyle = certConfig[plugin.certification];

    return (
        <div
            className={`group relative rounded-xl
            bg-white dark:bg-gray-800
            transition-all duration-200
            cursor-pointer p-2
            border border-slate-300 dark:border-slate-600
            hover:border-(--card-color)/30
            hover:shadow-(color:--card-color)
            shadow-sm hover:shadow-xl/60
            hover:-translate-y-2
            flex flex-col
            `}
            style={{
                '--card-color': `${typeStyle.color}`
            } as React.CSSProperties & { '--card-color': string }}
        >
            {/* Header with name and type badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <h3
                        className="m-0 mb-1.5 truncate text-lg font-medium"
                    >
                        {plugin.name}
                    </h3>
                    <div
                        className="flex items-center gap-1.5 text-sm"
                    >
                        <span>par</span>
                        <span className="font-medium">{plugin.author}</span>
                    </div>
                </div>

                <div
                    className="px-2.5 py-1 rounded-md group-hover:scale-105 font-mono text-[0.6875rem] font-medium transition-all duration-200 uppercase shrink-0 text-nowrap"
                    style={{
                        background: typeStyle.bgColor,
                        color: typeStyle.color,
                        border: `1px solid ${typeStyle.color}20`,
                    }}
                >
                    {typeStyle.label}
                </div>
            </div>

            {/* Description */}
            <p
                className="m-0 mb-4 dark:text-slate-300 text-slate-600 text-sm flex-1"
            >
                {plugin.description}
            </p>

            {/* Footer with certification */}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(18, 18, 20, 0.06)' }}>
                <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                    style={{
                        background: `${certStyle.color}08`,
                        border: `1px solid ${certStyle.color}20`
                    }}
                >
                    <span
                        className="text-xs leading-none"
                        style={{
                            color: certStyle.color,
                        }}
                    >
                        {certStyle.icon}
                    </span>
                    <span
                        className="text-xs font-semibold"
                        style={{
                            color: certStyle.color,
                        }}
                    >
                        {certStyle.label}
                    </span>
                </div>

                {/* Hover indicator */}
                <div
                    className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 text-2xl pe-3"
                    style={{
                        color: typeStyle.color,
                    }}
                >
                    →
                </div>
            </div>
        </div>
    );
}
