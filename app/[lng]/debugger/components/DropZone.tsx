'use client';

import { DragEvent, useRef, useState } from "react";
import { ArrowUpTrayIcon, CheckIcon, ClipboardDocumentIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useAnalyzerT } from "./useAnalyzerT";

const LOGGER_YAML = `logger:
  logs:
    custom_components.versatile_thermostat: debug`;

const DropZone: React.FC<{ onFile: (file: File) => void }> = ({ onFile }) => {
    const { t } = useAnalyzerT();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [copied, setCopied] = useState(false);

    const onDrop = (evt: DragEvent<HTMLDivElement>) => {
        evt.preventDefault();
        setDragging(false);
        const file = evt.dataTransfer.files?.[0];
        if (file) onFile(file);
    };

    const copyYaml = () => {
        navigator.clipboard.writeText(LOGGER_YAML).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <div
                onDragOver={(evt) => { evt.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center gap-3 px-6 py-12 text-center rounded-2xl border-2 border-dashed transition-colors
                    ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}
            >
                <ArrowUpTrayIcon className="size-10 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <p className="m-0 text-lg font-semibold text-slate-900 dark:text-white">{t('empty.drop')}</p>
                <p className="m-0 text-sm text-slate-600 dark:text-slate-300">{t('empty.formats')}</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".log,.txt"
                    className="hidden"
                    onChange={(evt) => {
                        const file = evt.target.files?.[0];
                        if (file) onFile(file);
                        evt.target.value = '';
                    }}
                />
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="min-h-10 px-5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-slate-950 cursor-pointer transition-colors"
                >
                    {t('empty.browse')}
                </button>
                <p className="m-0 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <LockClosedIcon className="size-4" aria-hidden="true" />
                    {t('empty.privacy')}
                </p>
            </div>

            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                <div className="flex flex-col gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <span className="self-start px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200">{t('empty.guide.recommended')}</span>
                    <h3 className="m-0 p-0 text-base font-semibold text-slate-900 dark:text-white">{t('empty.guide.export_title')}</h3>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">{t('empty.guide.export_text')}</p>
                </div>
                <div className="flex flex-col gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <span className="self-start px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t('empty.guide.alternative')}</span>
                    <h3 className="m-0 p-0 text-base font-semibold text-slate-900 dark:text-white">{t('empty.guide.ha_title')}</h3>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">{t('empty.guide.ha_text')}</p>
                    <div className="relative">
                        <pre className="m-0 p-3 pr-10 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 overflow-x-auto">{LOGGER_YAML}</pre>
                        <button
                            type="button"
                            onClick={copyYaml}
                            aria-label={t('copy')}
                            title={t('copy')}
                            className="absolute top-1.5 right-1.5 p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-slate-100 cursor-pointer"
                        >
                            {copied ? <CheckIcon className="size-4" aria-hidden="true" /> : <ClipboardDocumentIcon className="size-4" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <span className="self-start px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{t('empty.guide.next')}</span>
                    <h3 className="m-0 p-0 text-base font-semibold text-slate-900 dark:text-white">{t('empty.guide.share_title')}</h3>
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">{t('empty.guide.share_text')}</p>
                </div>
            </div>
        </div>
    );
};

export default DropZone;
