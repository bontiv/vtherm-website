import { Metadata } from "next";
import { ArrowRightIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { getT } from "@/app/i18n";
import Semantic from "@/components/Semantic";
import { LinkLocale } from "@/components/LinkLocale";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/metadata";
import { VERSUS_PAGES } from "@/lib/pages";
import { breadcrumb, pageUrl, SITE_ID } from "@/lib/semantic";

const PATH = '/versus/';

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('versus', { lng });
    return pageMetadata(PATH, lng, t('index.meta.title'), t('index.meta.description'),
        ['Home Assistant', 'thermostat', ...VERSUS_PAGES.map(page => page.competitor)], pageUrl(lng, '/versus/llms.txt'));
}

export default async function VersusIndexPage({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('versus', { lng });
    const { t: common_t } = await getT('common', { lng });

    return <div className="space-y-12" data-pagefind-body>
        <Semantic id={`versus-${lng}`} data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            inLanguage: lng,
            isPartOf: { "@id": SITE_ID },
            url: pageUrl(lng, PATH),
            name: t('index.meta.title'),
            description: t('index.meta.description'),
            breadcrumb: breadcrumb(lng, common_t('menu.home'), [{ name: common_t('menu.versus'), path: PATH }]),
            mainEntity: {
                "@type": "ItemList",
                itemListElement: VERSUS_PAGES.map((page, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    name: t(`${page.key}.title`),
                    url: pageUrl(lng, `${PATH}${page.slug}/`),
                })),
            },
        }} />

        <PageHeader
            icon={<ScaleIcon className="w-12 h-12" />}
            title={t('index.title')}
            intro={t('index.intro')}
        />

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VERSUS_PAGES.map(page => <LinkLocale
                key={page.slug}
                href={`${PATH}${page.slug}/`}
                className="group flex flex-col gap-3 p-6 rounded-xl bg-vtherm-quaternary/70 dark:bg-vtherm-tertiary/50 border border-transparent hover:border-vtherm-secondary/60 hover:shadow-lg transition-all duration-300"
            >
                <h2 className="text-xl font-medium text-vtherm-primary dark:text-vtherm-light">{t(`${page.key}.title`)}</h2>
                <p className="leading-relaxed dark:text-vtherm-light/70">{t(`${page.key}.meta.description`)}</p>
                <span className="mt-auto inline-flex items-center gap-2 text-vtherm-primary dark:text-vtherm-light">
                    {t('common.read')}
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
            </LinkLocale>)}
        </section>
    </div>
}
