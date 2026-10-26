import React from 'react';
import Link from 'next/link';
import { getT } from '@/app/i18n';
import { VERSUS_PAGES } from '@/lib/pages';
import { LanguageLinks } from './LanguageLinks';

export const Footer: React.FC<{ lng: string }> = async ({ lng }) => {
    const currentYear = new Date().getFullYear();
    const { t } = await getT('common', { lng });

    return (
        <footer className="mt-auto w-full border-t border-[#3a3a3a] bg-blue-400">
            <div className="container px-6 py-6">
                <div className="flex flex-col gap-4 text-sm text-gray-900">
                    <nav aria-label={t('footer_versus')} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mx-auto">
                        <Link href={`/${lng}/versus/`} className="font-medium hover:text-[#7CFC00] transition-colors">
                            {t('footer_versus')}
                        </Link>
                        {VERSUS_PAGES.map(page => <React.Fragment key={page.slug}>
                            <span className="hidden sm:inline">•</span>
                            <Link href={`/${lng}/versus/${page.slug}/`} className="hover:text-[#7CFC00] transition-colors">
                                {t('footer_versus_link', { competitor: page.competitor })}
                            </Link>
                        </React.Fragment>)}
                    </nav>
                    <LanguageLinks lng={lng} label={t('footer_languages')} />
                    <div className="flex flex-wrap items-center gap-4 mx-auto">
                        © {currentYear} Remi BONNET
                        <span className="hidden sm:inline">•</span>
                        <Link
                            href="https://github.com/bontiv/vtherm-website/blob/master/LICENSE"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#7CFC00] transition-colors"
                        >
                            AGPL-3.0 License
                        </Link>
                        <span className="hidden sm:inline">•</span>
                        <Link
                            href="https://github.com/bontiv/vtherm-website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#7CFC00] transition-colors"
                        >
                            {t('contribute')}
                        </Link>
                    </div>
                    <p className="text-xs block mx-auto">
                        {t('footer')}
                    </p>
                </div>
            </div>
        </footer>
    );
};
