'use client'

import React from 'react';
import { Trans } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useT } from '@/app/i18n/client';

const ISSUE_URL = 'https://github.com/hacs/integration/issues/5643';

/** Temporary warning: HACS fails to download GitHub release assets (hacs/integration#5643) */
export const HacsDownloadAlert: React.FC<{ className?: string }> = ({ className }) => {
    const { t } = useT('common');

    return (
        <div role="alert" className={`flex gap-4 p-5 rounded-xl text-left bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 ${className ?? ''}`}>
            <ExclamationTriangleIcon className="w-7 h-7 shrink-0 text-amber-500" aria-hidden="true" />
            <div className="space-y-2">
                <p className="m-0 font-semibold">{t('hacs_alert.title')}</p>
                <p className="m-0 leading-relaxed">
                    <Trans i18nKey="hacs_alert.text" t={t} components={[
                        <a key="0" href={ISSUE_URL} target="_blank" rel="noreferrer noopener" className="underline" />
                    ]} />
                </p>
            </div>
        </div>
    );
};
