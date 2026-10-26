import { Metadata } from "next";
import { ArrowRightIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
import { getT } from "@/app/i18n";
import Semantic from "@/components/Semantic";
import { HeatingTypeCard } from "@/components/HeatingTypeCard";
import { HeatingIcon } from "@/components/icons/HeatingIcon";
import { LinkLocale } from "@/components/LinkLocale";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMetadata } from "@/lib/metadata";
import { QUICKSTART_PAGES } from "@/lib/pages";
import { breadcrumb, pageUrl, SITE_ID } from "@/lib/semantic";

const PATH = '/quick-start/';

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('quickstart', { lng });
    return pageMetadata(PATH, lng, t('index.meta.title'), t('index.meta.description'),
        ['Home Assistant', 'thermostat', 'Versatile Thermostat', 'quick start']);
}

export default async function QuickStartIndexPage({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('quickstart', { lng });
    const { t: common_t } = await getT('common', { lng });

    const crumbs = [{ name: common_t('menu.quickstart'), path: PATH }];

    return <>
        <Breadcrumbs lng={lng} items={crumbs} />
        <div className="space-y-12" data-pagefind-body>
            <Semantic id={`quickstart-${lng}`} data={{
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                inLanguage: lng,
                isPartOf: { "@id": SITE_ID },
                url: pageUrl(lng, PATH),
                name: t('index.meta.title'),
                description: t('index.meta.description'),
                breadcrumb: breadcrumb(lng, common_t('menu.home'), crumbs),
                mainEntity: {
                    "@type": "ItemList",
                    itemListElement: QUICKSTART_PAGES.map((page, i) => ({
                        "@type": "ListItem",
                        position: i + 1,
                        name: t(`${page.key}.title`),
                        url: pageUrl(lng, `${PATH}${page.slug}/`),
                    })),
                },
            }} />

            <PageHeader
                icon={<RocketLaunchIcon className="w-12 h-12" />}
                title={t('index.title')}
                intro={t('index.intro')}
            />

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {QUICKSTART_PAGES.map(page => <HeatingTypeCard
                    key={page.slug}
                    href={`${PATH}${page.slug}/`}
                    icon={<HeatingIcon type={page.slug} className="w-12 h-12" />}
                    title={t(`${page.key}.name`)}
                    description={t(`${page.key}.tagline`)}
                />)}
            </section>

            <p className="text-center">
                {t('index.other')}{' '}
                <LinkLocale href="/docs/quick-start/" className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-400 transition-colors">
                    {t('common.docs_quickstart')}
                    <ArrowRightIcon className="w-4 h-4" />
                </LinkLocale>
            </p>
        </div>
    </>
}
