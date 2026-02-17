import React from 'react';
import Link from 'next/link';
import { getT } from '@/app/i18n';

export const Footer: React.FC = async () => {
    const currentYear = new Date().getFullYear();
    const { t } = await getT('common');

    return (
        <footer className="mt-auto w-full border-t border-[#3a3a3a] bg-blue-400">
            <div className="container px-6 py-6">
                <div className="flex flex-col gap-4 text-sm text-gray-900">
                    <div className="flex flex-wrap items-center gap-4 block mx-auto">
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
