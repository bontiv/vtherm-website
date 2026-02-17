'use client'

import { useT } from "@/app/i18n/client";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

export const BackToTop = () => {
    const { t } = useT('common')
    return (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-sm text-[#71717a] hover:text-blue-800 transition-colors" > <ArrowUpIcon className="w-4 h-4" /> {t('backtotop')} </button>
    )
}

export default BackToTop;