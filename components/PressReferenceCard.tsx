import React from 'react';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon, MicrophoneIcon, NewspaperIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { PressReference, PressType } from '@/lib/press';

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const TYPE_ICONS: Record<PressType, Icon> = {
    video: PlayCircleIcon,
    article: NewspaperIcon,
    podcast: MicrophoneIcon,
};

interface PressReferenceCardProps {
    reference: PressReference;
    /** Translated label of the reference type */
    typeLabel: string;
    /** Page language, used to format the date */
    lng: string;
}

/** External link to an article, video or podcast about Versatile Thermostat */
export function PressReferenceCard({ reference, typeLabel, lng }: PressReferenceCardProps) {
    const TypeIcon = TYPE_ICONS[reference.type];
    const date = new Intl.DateTimeFormat(lng, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(reference.date));

    return (
        <a
            href={reference.url}
            target="_blank"
            rel="noopener"
            hrefLang={reference.lang}
            className="group flex gap-4 p-5 rounded-xl bg-white dark:bg-vtherm-dark/40 border border-zinc-200 dark:border-vtherm-tertiary/60 hover:border-vtherm-secondary/60 hover:shadow-lg transition-all duration-300"
        >
            <span className="relative shrink-0 w-12 h-12">
                <Image src={reference.logo} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover bg-white border border-zinc-200 dark:border-vtherm-tertiary/60" />
                <span className="absolute -bottom-1.5 -right-1.5 inline-flex w-6 h-6 items-center justify-center rounded-full bg-white dark:bg-vtherm-dark border border-zinc-200 dark:border-vtherm-tertiary/60">
                    <TypeIcon className="w-4 h-4 text-vtherm-secondary" aria-hidden="true" />
                </span>
            </span>
            <span className="flex flex-col gap-1 min-w-0">
                <span lang={reference.lang} className="font-medium leading-snug text-vtherm-primary dark:text-vtherm-light group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                    {reference.title}
                    <ArrowTopRightOnSquareIcon className="inline w-4 h-4 ml-1 align-text-top opacity-60" aria-hidden="true" />
                </span>
                <span className="text-sm text-[#52525b] dark:text-[#a1a1aa]">
                    {reference.source} · {typeLabel} · <time dateTime={reference.date}>{date}</time>
                </span>
            </span>
        </a>
    );
}
