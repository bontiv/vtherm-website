'use client'

import { ArrowUpIcon } from "@heroicons/react/24/outline";

export const BackToTop = () => (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 text-sm text-[#71717a] hover:text-[#7CFC00] transition-colors" > <ArrowUpIcon className="w-4 h-4" /> Retour en haut </button>)

export default BackToTop;