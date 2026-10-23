import { Metadata } from "next";
import { ArrowRightIcon, ArrowTopRightOnSquareIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { getT } from "@/app/i18n";
import Semantic from "@/components/Semantic";
import { LinkLocale } from "@/components/LinkLocale";
import { Button } from "@/components/ui/Button";
import { CtaSection } from "@/components/ui/CtaSection";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComparisonTable, Support } from "@/components/versus/ComparisonTable";
import { StrengthList } from "@/components/versus/StrengthList";
import { pageMetadata } from "@/lib/metadata";
import { getVersusPage, VERSUS_SHARED_STRENGTHS } from "@/lib/pages";
import { breadcrumb, pageUrl, SITE_ID, SOFTWARE_ID } from "@/lib/semantic";

const PAGE = getVersusPage('smart-autotune-thermostat');
const PATH = `/versus/${PAGE.slug}/`;

/** Rows of the comparison table. Labels are `versus.features.<key>`, optional notes `versus.<page>.notes.<key>` */
const FEATURES: { key: string, vtherm: Support, competitor: Support }[] = [
    { key: 'opentherm', vtherm: 'no', competitor: 'yes' },
    { key: 'switch_devices', vtherm: 'yes', competitor: 'yes' },
    { key: 'climate_devices', vtherm: 'yes', competitor: 'partial' },
    { key: 'valve', vtherm: 'yes', competitor: 'no' },
    { key: 'outdoor', vtherm: 'yes', competitor: 'yes' },
    { key: 'learning', vtherm: 'yes', competitor: 'yes' },
    { key: 'presence', vtherm: 'yes', competitor: 'no' },
    { key: 'motion', vtherm: 'yes', competitor: 'no' },
    { key: 'window', vtherm: 'yes', competitor: 'yes' },
    { key: 'window_auto', vtherm: 'yes', competitor: 'no' },
    { key: 'power', vtherm: 'yes', competitor: 'no' },
    { key: 'central_mode', vtherm: 'yes', competitor: 'partial' },
    { key: 'auto_start_stop', vtherm: 'yes', competitor: 'no' },
    { key: 'heat_cool', vtherm: 'yes', competitor: 'no' },
    { key: 'failure', vtherm: 'yes', competitor: 'no' },
    { key: 'lock', vtherm: 'yes', competitor: 'no' },
    { key: 'ui_card', vtherm: 'yes', competitor: 'no' },
    { key: 'log_analyzer', vtherm: 'yes', competitor: 'no' },
    { key: 'plugins', vtherm: 'yes', competitor: 'no' },
];
/** Keys of `versus.<page>.strengths` */
const STRENGTHS = ['per_room', 'all_heating', 'cooling', 'presence', 'power', 'ecosystem'];
/** Keys of `versus.<page>.when_competitor` */
const WHEN_COMPETITOR = ['opentherm', 'dhw', 'complementary'];

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('versus', { lng, keyPrefix: PAGE.key });
    return pageMetadata(PATH, lng, t('meta.title'), t('meta.description'),
        ['Versatile Thermostat', PAGE.competitor, 'Home Assistant', 'thermostat']);
}

export default async function SmartAutotuneThermostatVersusPage({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params;
    const { t } = await getT('versus', { lng, keyPrefix: PAGE.key });
    const { t: vs_t } = await getT('versus', { lng });
    const { t: common_t } = await getT('common', { lng });
    const competitor = { competitor: PAGE.competitor };

    return <article className="space-y-14 max-w-5xl mx-auto" data-pagefind-body>
        <Semantic id={`versus-${PAGE.slug}-${lng}`} data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            inLanguage: lng,
            isPartOf: { "@id": SITE_ID },
            url: pageUrl(lng, PATH),
            name: t('meta.title'),
            description: t('meta.description'),
            breadcrumb: breadcrumb(lng, common_t('menu.home'), [
                { name: common_t('menu.versus'), path: '/versus/' },
                { name: t('title'), path: PATH },
            ]),
            about: [
                { "@id": SOFTWARE_ID },
                {
                    "@type": "SoftwareApplication",
                    name: PAGE.competitor,
                    url: PAGE.competitorUrl,
                    applicationCategory: "HomeAssistantApplication",
                    operatingSystem: "Home Assistant",
                },
            ],
        }} />

        <PageHeader
            eyebrow={common_t('menu.versus')}
            icon={<ScaleIcon className="w-12 h-12" />}
            title={t('title')}
            intro={t('intro')}
        />

        <section className="space-y-4">
            <h2 className="text-3xl font-normal">{vs_t('common.about', competitor)}</h2>
            <p className="text-lg leading-relaxed">{t('about')}</p>
            <a href={PAGE.competitorUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors">
                {vs_t('common.official', competitor)}
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
        </section>

        <section className="space-y-4">
            <h2 className="text-3xl font-normal">{vs_t('common.table_title')}</h2>
            <ComparisonTable
                featureLabel={vs_t('common.feature')}
                competitorLabel={PAGE.competitor}
                supportLabels={{ yes: vs_t('common.support.yes'), partial: vs_t('common.support.partial'), no: vs_t('common.support.no') }}
                rows={FEATURES.map(row => ({
                    feature: vs_t(`features.${row.key}`),
                    note: t(`notes.${row.key}`, { defaultValue: '' }) || undefined,
                    vtherm: row.vtherm,
                    competitor: row.competitor,
                }))}
            />
            <p className="text-sm opacity-70">{vs_t('common.disclaimer', { ...competitor, version: PAGE.checkedVersion, interpolation: { escapeValue: false } })}</p>
        </section>

        <section className="space-y-6">
            <h2 className="text-3xl font-normal">{vs_t('common.strengths_title')}</h2>
            <StrengthList moreLabel={vs_t('common.strengths.learn_more')} items={[
                ...STRENGTHS.map(key => ({
                    title: t(`strengths.${key}.title`),
                    description: t(`strengths.${key}.desc`),
                })),
                ...VERSUS_SHARED_STRENGTHS.map(({ key, href }) => ({
                    title: vs_t(`common.strengths.${key}.title`),
                    description: vs_t(`common.strengths.${key}.desc`),
                    href,
                })),
            ]} />
        </section>

        <section className="space-y-4">
            <h2 className="text-3xl font-normal">{vs_t('common.when_competitor', competitor)}</h2>
            <ul className="list-disc pl-6 space-y-2 text-lg leading-relaxed">
                {WHEN_COMPETITOR.map(key => <li key={key}>{t(`when_competitor.${key}`)}</li>)}
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-3xl font-normal">{vs_t('common.migration_title', competitor)}</h2>
            <p className="text-lg leading-relaxed whitespace-pre-line">{t('migration')}</p>
        </section>

        <CtaSection title={vs_t('common.cta.title')} description={vs_t('common.cta.desc')}>
            <LinkLocale href="/quick-start/">
                <Button variant="primary" size="lg">
                    <span>{vs_t('common.cta.quickstart')}</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </LinkLocale>
            <LinkLocale href="/docs/installation/">
                <Button variant="secondary" size="lg">{vs_t('common.cta.install')}</Button>
            </LinkLocale>
        </CtaSection>
    </article>
}
