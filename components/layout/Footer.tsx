import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

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
                            Contribute on GitHub
                        </Link>
                    </div>
                    <p className="text-xs block mx-auto">
                        This website is a community website. The only official source of information about Versatile Thermostat is the GitHub repository.
                    </p>
                </div>
            </div>
        </footer>
    );
};
