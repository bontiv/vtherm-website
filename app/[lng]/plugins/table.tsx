'use client';

import { useState } from 'react';
import { PluginCard } from './card';

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

const mockPlugins: Plugin[] = [
    {
        id: '1',
        slug: 'advanced-analytics-dashboard',
        name: 'Advanced Analytics Dashboard',
        author: 'jmcollin78',
        description: 'Graphiques de debugs avec Plotly. Permet de mieux comprendre le fonctionnement de Versatile.',
        type: 'interface',
        certification: 'maintainer'
    },
    {
        id: '2',
        slug: 'ha-entity-explorer',
        name: 'HA Entity Explorer',
        author: 'KipK',
        description: 'Tableau de bord avec tous les états de Home Assistant.',
        type: 'integration',
        certification: 'recommended'
    },
    {
        id: '3',
        slug: 'versatile-card-ui',
        name: 'Versatile Card UI',
        author: 'jmcollin78',
        description: 'Carte de tableau de bord pour la gestion des thermostat Versatile.',
        type: 'interface',
        certification: 'maintainer'
    },
    {
        id: '4',
        slug: 'auto-tpi-card',
        name: 'AutoTPI Card',
        author: 'KipK',
        description: 'Carte pour l\'apprentissage de Auto TPI. Permet de lancer l\'apprentissage et voir l\'évolution de Kint et Kext.',
        type: 'interface',
        certification: 'maintainer'
    },
    {
        id: '5',
        slug: 'versatile-store',
        name: 'Versatile Store',
        author: 'bontiv',
        description: 'Intégration permettant de parcourrir et installer facilement des compléments pour Versatile et définir les valeurs par défaut pour les sous-jacents.',
        type: 'integration',
        certification: 'community'
    },
    {
        id: '6',
        slug: 'sonoff-trvzb-linearité',
        name: 'Sonoff TRVZB linéarité',
        author: 'Caius',
        description: 'Blueprint pour la gestion fine des vannes TRVZB et d\'ajuster l\'ouverture à la linéarité de la vanne.',
        type: 'blueprint',
        certification: 'recommended'
    },
];

export default function PluginTable() {
    const [selectedType, setSelectedType] = useState<PluginType | 'all'>('all');
    const [selectedCert, setSelectedCert] = useState<CertificationLevel | 'all'>('all');

    const filteredPlugins = mockPlugins.filter(plugin => {
        const typeMatch = selectedType === 'all' || plugin.type === selectedType;
        const certMatch = selectedCert === 'all' || plugin.certification === selectedCert;
        return typeMatch && certMatch;
    });

    return (
        <div className="size-full min-h-screen overflow-auto">
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className='p-0 text-(--color-primary)'
                        >
                            Compléments disponibles
                        </h1>
                        <div
                            className="px-3 py-1 rounded-full self-start text-xs font-medium text-white bg-(--color-primary) tracking-wide"
                        >
                            {filteredPlugins.length}
                        </div>
                    </div>
                    <p className="m-0 max-w-3xl dark:text-slate-300 text-slate-800">
                        Étendez les fonctionnalités avec des intégrations, interfaces et blueprints créés par la communauté
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-slate-300">
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            active={selectedType === 'all'}
                            onClick={() => setSelectedType('all')}
                        >
                            Tous types
                        </FilterButton>
                        <FilterButton
                            active={selectedType === 'blueprint'}
                            onClick={() => setSelectedType('blueprint')}
                            color="var(--color-blue-500)"
                        >
                            Blueprints
                        </FilterButton>
                        <FilterButton
                            active={selectedType === 'integration'}
                            onClick={() => setSelectedType('integration')}
                            color="var(--color-orange-400)"
                        >
                            Intégrations
                        </FilterButton>
                        <FilterButton
                            active={selectedType === 'interface'}
                            onClick={() => setSelectedType('interface')}
                            color="var(--color-sky-500)"
                        >
                            Interfaces
                        </FilterButton>
                    </div>
                    <div className="w-px h-8 my-0 mx-2 bg-slate-300" />
                    <div className="flex flex-wrap gap-2">
                        <FilterButton
                            active={selectedCert === 'all'}
                            onClick={() => setSelectedCert('all')}
                        >
                            Toutes
                        </FilterButton>
                        <FilterButton
                            active={selectedCert === 'maintainer'}
                            onClick={() => setSelectedCert('maintainer')}
                            color="var(--color-vtherm-tertiary)"
                        >
                            ★ Officiel
                        </FilterButton>
                        <FilterButton
                            active={selectedCert === 'recommended'}
                            onClick={() => setSelectedCert('recommended')}
                            color="var(--color-vtherm-quaternary)"
                        >
                            ◆ Recommandé
                        </FilterButton>
                        <FilterButton
                            active={selectedCert === 'community'}
                            onClick={() => setSelectedCert('community')}
                            color="var(--color-vtherm-secondary)"
                        >
                            ● Communautaire
                        </FilterButton>
                    </div>
                </div>

                {/* Plugin Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredPlugins.map((plugin, index) => (
                        <PluginCard key={plugin.id} plugin={plugin} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-1.5 rounded-md transition-colors duration-200 font-medium text-sm cursor-pointer"
            style={{
                background: active ? (color || 'var(--color-primary)') : 'rgba(18, 18, 20, 0.03)',
                color: active ? 'white' : (color || 'var(--color-slate-500)'),
                border: active ? 'none' : `0.5px solid ${color ? `${color}` : 'var(--color-slate-500)'}`,
            }}
        >
            {children}
        </button>
    );
}