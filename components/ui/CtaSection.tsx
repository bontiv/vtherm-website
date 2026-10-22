import React from 'react';

/** Gradient call-to-action block, same style as the home page CTA */
export const CtaSection: React.FC<{ title: string, description: string, children?: React.ReactNode }> = ({ title, description, children }) => (
    <section className="bg-linear-to-r from-blue-300 dark:from-vtherm-tertiary to-sky-200 dark:to-vtherm-quaternary/80 rounded-2xl p-8 md:p-12 text-center border border-blue-100 dark:border-vtherm-tertiary">
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-normal text-blue-700 dark:text-vtherm-light">{title}</h2>
            <p className="text-lg dark:text-blue-200">{description}</p>
            {children && <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">{children}</div>}
        </div>
    </section>
);
