import { Metadata } from "next";
import { ArrowRightIcon, InformationCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { getT } from "@/app/i18n";
import Semantic from "@/components/Semantic";
import { LinkLocale } from "@/components/LinkLocale";
import { HeatingIcon } from "@/components/icons/HeatingIcon";
import { RelatedLinks } from "@/components/quickstart/RelatedLinks";
import { TutorialSteps } from "@/components/quickstart/TutorialSteps";
import { Button } from "@/components/ui/Button";
import { CtaSection } from "@/components/ui/CtaSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { StrengthList } from "@/components/versus/StrengthList";
import { pageMetadata } from "@/lib/metadata";
import { getQuickStartPage } from "@/lib/pages";
import { deviceLinks, docLinks } from "@/lib/quickstart";
import { breadcrumb, pageUrl, SITE_ID, SOFTWARE_ID } from "@/lib/semantic";

const PAGE = getQuickStartPage('heat-pump');
const PATH = `/quick-start/${PAGE.slug}/`;

/** Keys of `quickstart.<page>.strengths` */
const STRENGTHS = ['self_regulation', 'auto_start_stop', 'heat_cool', 'window', 'presence', 'power'];
/** Keys of `quickstart.<page>.tutorial.steps` */
const STEPS = ['integration', 'install', 'create', 'underlying', 'regulation', 'auto_start_stop', 'presets'];
const DOCS = ['over-climate', 'self-regulation', 'feature-auto-start-stop', 'feature-window', 'feature-presence'];
const DEVICES: string[] = ['MELCloud', 'smartir', 'tuya-wifi'];

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('quickstart', { lng, keyPrefix: PAGE.key });
    return pageMetadata(PATH, lng, t('meta.title'), t('meta.description'), t('meta.keywords').split(','));
}

export default async function HeatPumpQuickStartPage({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('quickstart', { lng, keyPrefix: PAGE.key });
    const { t: qs_t } = await getT('quickstart', { lng, keyPrefix: 'common' });
    const { t: common_t } = await getT('common', { lng });

    const steps = STEPS.map(key => ({ title: t(`tutorial.steps.${key}.title`), text: t(`tutorial.steps.${key}.text`) }));

    return <article className="space-y-14 max-w-5xl mx-auto" data-pagefind-body>
        <Semantic id={`quickstart-${PAGE.slug}-${lng}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": SITE_ID },
            url: pageUrl(lng, PATH),
            name: t('meta.title'),
            description: t('meta.description'),
            breadcrumb: breadcrumb(lng, common_t('menu.home'), [
                { name: common_t('menu.quickstart'), path: '/quick-start/' },
                { name: t('name'), path: PATH },
            ]),
            mainEntity: {
                "@type": "HowTo",
                name: t('title'),
                description: t('tutorial.example'),
                inLanguage: lng,
                tool: [{ "@id": SOFTWARE_ID }],
                step: steps.map((step, i) => ({
                    "@type": "HowToStep",
                    position: i + 1,
                    name: step.title,
                    text: step.text,
                })),
            },
        }} />

        <PageHeader
            eyebrow={common_t('menu.quickstart')}
            icon={<HeatingIcon type={PAGE.slug} className="w-16 h-16" />}
            title={t('title')}
            intro={t('intro')}
        />

        <aside className="flex gap-4 p-5 rounded-xl border border-vtherm-tertiary/40 bg-blue-50 dark:bg-sky-950/60">
            <InformationCircleIcon className="w-7 h-7 shrink-0 text-vtherm-tertiary" aria-hidden="true" />
            <div>
                <h2 className="py-0 text-lg leading-7 font-medium mb-1">{qs_t('vtherm_type')}</h2>
                <p className="leading-relaxed">{t('vtherm_type')}</p>
            </div>
        </aside>

        <section className="space-y-6">
            <h2 className="text-3xl font-normal">{qs_t('strengths_title')}</h2>
            <StrengthList items={STRENGTHS.map(key => ({
                title: t(`strengths.${key}.title`),
                description: t(`strengths.${key}.desc`),
            }))} />
        </section>

        <section className="space-y-6">
            <h2 className="text-3xl font-normal">{t('tutorial.title')}</h2>
            <p className="text-lg leading-relaxed">{t('tutorial.example')}</p>
            <TutorialSteps steps={steps} />
            <div className="flex gap-4 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <LightBulbIcon className="w-7 h-7 shrink-0 text-amber-500" aria-hidden="true" />
                <p className="leading-relaxed">{t('tutorial.tip')}</p>
            </div>
        </section>

        <section className="space-y-6">
            <h2 className="text-3xl font-normal">{qs_t('further_title')}</h2>
            <RelatedLinks
                docsTitle={qs_t('docs_title')}
                docs={docLinks(common_t, DOCS)}
                devicesTitle={qs_t('devices_title')}
                devices={deviceLinks(DEVICES)}
            />
        </section>

        <CtaSection title={qs_t('cta.title')} description={qs_t('cta.desc')}>
            <LinkLocale href="/docs/installation/">
                <Button variant="primary" size="lg">
                    <span>{qs_t('cta.install')}</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </LinkLocale>
            <LinkLocale href="/versus/">
                <Button variant="secondary" size="lg">{qs_t('cta.versus')}</Button>
            </LinkLocale>
        </CtaSection>
    </article>
}
