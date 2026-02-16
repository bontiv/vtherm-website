import { languages } from '@/app/i18n/settings'
import { getT } from '@/app/i18n'
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GitHubAPI } from '@/lib/github';

export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }))
}

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params
    const { t } = await getT('common', { lng })
    return {
        title: t('title'),
        description: t('description'),
        keywords: ["home assistant", "thermostat", "climate control", "smart home", "automation"],
        authors: [{ name: "Remi BONNET" }],
        openGraph: {
            title: t('title'),
            description: t('description'),
            type: "website",
        },
    }
}

export default async function Layout({ children, params }: { children: React.ReactNode, params: Promise<{ lng: string }> }) {
    const githubapi = GitHubAPI.getInstance();
    const { lng } = await params;
    const release: string = (await githubapi.getReleases()).filter(x => !x.prerelease)[0].tag_name ?? '8.6.0';
    const filesDir = (await githubapi.getGitTreePath(`${release}/documentation/${lng}`))?.sha;
    const files = filesDir ? (await githubapi.getGitTree(filesDir))?.tree.filter(x => x.type === 'blob' && x.path.endsWith('.md')).map(item => item.path.split('/').pop()?.slice(0, -3)) : undefined;

    return <html lang="fr" className="">
        <body className="antialiased">
            {/* Layout principal: Sidebar fixe + Contenu principal */}
            <div className="flex min-h-screen">
                {/* Sidebar - 247px fixe sur desktop */}
                <Sidebar docfiles={files} docref={release} />

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
                    <Footer />
                </div>
            </div>
        </body>
    </html>
}
