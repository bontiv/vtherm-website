import React from 'react';
import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

import type { Support } from '@/lib/pages';

export type { Support };

export interface ComparisonRow {
    feature: string;
    vtherm: Support;
    competitor: Support;
    note?: string;
}

interface ComparisonTableProps {
    rows: ComparisonRow[];
    featureLabel: string;
    competitorLabel: string;
    /** Accessible labels of each support level */
    supportLabels: Record<Support, string>;
}

const SupportCell: React.FC<{ support: Support, label: string }> = ({ support, label }) => {
    const Icon = support === 'yes' ? CheckCircleIcon : support === 'partial' ? MinusCircleIcon : XCircleIcon;
    const color = support === 'yes' ? 'text-green-600' : support === 'partial' ? 'text-amber-500' : 'text-red-500';
    return <td className="relative px-4 py-3 text-center">
        <Icon className={`w-6 h-6 inline-block ${color}`} aria-hidden="true" />
        <span className="sr-only">{label}</span>
    </td>
};

/** Feature comparison between Versatile Thermostat and a competitor */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({ rows, featureLabel, competitorLabel, supportLabels }) => (
    <div className="overflow-x-auto rounded-xl border border-blue-200 dark:border-vtherm-tertiary">
        <table className="w-full min-w-[480px] text-left">
            <thead className="bg-vtherm-quaternary/40 dark:bg-vtherm-tertiary/40">
                <tr>
                    <th scope="col" className="px-4 py-3 font-medium">{featureLabel}</th>
                    <th scope="col" className="px-4 py-3 font-medium text-center">Versatile Thermostat</th>
                    <th scope="col" className="px-4 py-3 font-medium text-center">{competitorLabel}</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => <tr key={i} className="border-t border-blue-100 dark:border-vtherm-tertiary/50">
                    <th scope="row" className="px-4 py-3 font-normal">
                        {row.feature}
                        {row.note && <span className="block text-sm opacity-70">{row.note}</span>}
                    </th>
                    <SupportCell support={row.vtherm} label={supportLabels[row.vtherm]} />
                    <SupportCell support={row.competitor} label={supportLabels[row.competitor]} />
                </tr>)}
            </tbody>
        </table>
    </div>
);
