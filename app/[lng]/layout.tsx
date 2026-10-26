import { languages } from '@/app/i18n/settings'
import { getT } from '@/app/i18n'
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getOrderedDocFiles } from '@/lib/docs';
import Statistics from '@/components/Statisctics';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { opengraph_defaults } from '@/lib/opengraph';
import Semantic from '@/components/Semantic';
import Buymeacoffee from '@/components/CoffeeWidget';

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params
    const { t } = await getT('common', { lng })



    return {
        title: {
            template: "%s - Versatile Thermostat",
            default: t('title')
        },
        description: t('description'),
        keywords: ["home assistant", "thermostat", "climate control", "smart home", "automation"],
        authors: [{ name: "Remi BONNET" }],
        metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
            siteName: "Versatile Thermostat",
            ...opengraph_defaults,
        },
    }
}

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const docFiles = await getOrderedDocFiles(lng);
    const { i18n } = await getT('common', { lng })

    return <html className="" lang={i18n.resolvedLanguage} data-scroll-behavior="smooth">
        <body className="antialiased">
            <Semantic id={`layout`} />
            {/* Layout principal: Sidebar fixe + Contenu principal */}
            <div className="flex min-h-screen">
                {/* Sidebar - 247px fixe sur desktop */}
                <Sidebar docfiles={docFiles} />

                {/* Contenu principal */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Header sticky */}
                    <Header />

                    {/* Contenu de la page */}
                    <main className="flex-1 w-full">
                        <div className="container mx-auto px-6 py-8">
                            {children}
                        </div>
                    </main>

                    {/* Footer */}
                    <Footer lng={lng} />
                </div>
            </div>
            <Suspense fallback={null}>
                <Statistics />
                <Buymeacoffee />
            </Suspense>
        </body>
    </html>
}
