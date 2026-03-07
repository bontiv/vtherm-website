import { languages } from '@/app/i18n/settings'
import { getT } from '@/app/i18n'
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GitHubAPI } from '@/lib/github';
import Statistics from '@/components/Statisctics';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { opengraph_defaults } from '@/lib/opengraph';

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
    const githubapi = GitHubAPI.getInstance();
    const { lng } = await params;
    const filesDir = (await githubapi.getGitTreePath(`main/documentation/${lng}`))?.sha;
    const files = filesDir ? (await githubapi.getGitTree(filesDir))?.tree.filter((x) => x.type === 'blob' && x.path.endsWith('.md')).map((item) => item.path.split('/').pop()?.slice(0, -3)) : undefined;
    const { i18n } = await getT('common', { lng })

    const page_ordering: (string | undefined)[] = [
        'presentation',
        'installation',
        'quick-start',
        'creation',
        'base-attributes',
        'over-switch',
        'over-climate',
        'over-valve',
        'feature-presets',
        'feature-window',
        'feature-presence',
        'feature-motion',
        'feature-power',
        'feature-auto-start-stop',
        'feature-central-mode',
        'feature-central-boiler',
        'feature-advanced',
        'feature-heating-failure-detection',
        'self-regulation',
        'feature-autotpi',
        'feature-lock',
        'feature-sync_device_temp',
        'feature-timed-preset',
        'tuning-examples',
        'algorithms',
        'reference',
        'troubleshooting',
        'releases'
    ].filter(x => {
        if (files) {
            const idx = files.indexOf(x)
            if (idx >= 0) {
                files.splice(idx, 1);
                return true;
            }
        }
    })

    return <html className="" lang={i18n.resolvedLanguage}>
        <body className="antialiased">
            {/* Layout principal: Sidebar fixe + Contenu principal */}
            <div className="flex min-h-screen">
                {/* Sidebar - 247px fixe sur desktop */}
                <Sidebar docfiles={page_ordering.concat(files)} />

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
            </Suspense>
        </body>
    </html>
}
