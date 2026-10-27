import { Button } from "@/components/ui/Button";
import { BackToTop } from "@/components/ui/BackToTop";
import { CtaSection } from "@/components/ui/CtaSection";
import {
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    BoltIcon,
    ChevronDownIcon,
    FireIcon,
    PresentationChartLineIcon,
    PuzzlePieceIcon,
    ShieldCheckIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { WindowIcon } from "@/components/icons/WindowIcon";
import { HacsInstallBadge } from "@/components/HacsInstallBadge";
import { LinkLocale } from "@/components/LinkLocale";
import { getAlternatesMetadata, getT } from "../i18n";
import Image from "next/image";
import { Metadata } from "next";
import { opengraph_defaults } from "@/lib/opengraph";
import Semantic from "@/components/Semantic";
import { HeatingTypeCard } from "@/components/HeatingTypeCard";
import { HeatingIcon } from "@/components/icons/HeatingIcon";
import { QUICKSTART_PAGES } from "@/lib/pages";
import { breadcrumb } from "@/lib/semantic";
import { getPressReferences, PressReference } from "@/lib/press";
import { PressReferenceCard } from "@/components/PressReferenceCard";
import { languages } from "../i18n/settings";
import "flag-icons/css/flag-icons.min.css";

/// Last stable release pattern
const stable_release = "9.3.*";

type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/** Feature cards (`home.cards.<key>`), each linked to its documentation page */
const FEATURES: { key: string, icon: Icon, href: string }[] = [
    { key: 'tpi', icon: AdjustmentsHorizontalIcon, href: '/docs/algorithms/' },
    { key: 'window', icon: WindowIcon, href: '/docs/feature-window/' },
    { key: 'presence', icon: UserGroupIcon, href: '/docs/feature-presence/' },
    { key: 'power', icon: BoltIcon, href: '/docs/feature-power/' },
    { key: 'central', icon: FireIcon, href: '/docs/feature-central-boiler/' },
    { key: 'safety', icon: ShieldCheckIcon, href: '/docs/feature-heating-failure-detection/' },
];

/** Community tools (`home.tools.<key>`) */
const TOOLS: { key: string, icon: Icon, href: string }[] = [
    { key: 'debugger', icon: PresentationChartLineIcon, href: '/debugger/' },
    { key: 'plugins', icon: PuzzlePieceIcon, href: '/plugins/' },
];

/** Flag shown for each content language of the press references */
const FLAGS: Record<string, string> = { en: 'us', fr: 'fr', de: 'de' };

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('common', { lng });

    const alternates = getAlternatesMetadata('/', lng, { x_default: '/' });
    const title = 'Versatile Thermostat - ' + t('title');
    return {
        title: {
            absolute: title
        },
        alternates,
        openGraph: {
            title,
            url: `/${lng}/`,
            siteName: "Versatile Thermostat",
            ...opengraph_defaults,
        }
    }
}

export default async function Home({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params
    const { t } = await getT('home', { lng })
    const { t: common_t } = await getT('common', { lng })

    const press = getPressReferences(lng);
    const otherPress: { lang: string, references: PressReference[] }[] = languages
        .filter(lang => lang !== lng)
        .map(lang => ({ lang, references: getPressReferences(lang) }))
        .filter(group => group.references.length > 0);
    const pressCard = (reference: PressReference) => <PressReferenceCard
        key={reference.url}
        reference={reference}
        typeLabel={t(`press.types.${reference.type}`)}
        lng={lng}
    />;

    return (
        <div className="space-y-16">
            {/* Hero badges are loaded from shields.io: open the connection early (hoisted to <head>, no crossOrigin for plain <img>) */}
            <link rel="preconnect" href="https://img.shields.io" />
            <Semantic id={`home-${lng}`} data={{
                "@context": "https://schema.org",
                "@type": "WebPage",
                inLanguage: lng,
                isPartOf: { "@id": "https://www.versatile-thermostat.org/#website" },
                name: common_t('title'),
                description: common_t('description'),
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/`,
                breadcrumb: breadcrumb(lng, common_t('menu.home'), []),
            }} />
            {/* Hero Section */}
            <section className="pt-8 pb-12 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-light text-vtherm-dark dark:text-vtherm-light mb-0">
                        Versatile Thermostat
                    </h1>
                    <div className="flex justify-center items-center gap-x-3 gap-y-2 flex-wrap">
                        <a href="https://github.com/jmcollin78/versatile_thermostat">
                            <Image height={20} width={90} alt="GitHub Repo stars" src="https://img.shields.io/github/stars/jmcollin78/versatile_thermostat" />
                        </a>
                        <Image height={20} width={162} alt="Home Assistant install count" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fanalytics.home-assistant.io%2Fcustom_integrations.json&query=%24.versatile_thermostat.total&style=plastic&logo=homeassistantcommunitystore&label=Current%20instances&cacheSeconds=3600" />
                        {/*<Image height={20} width={145} alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads/jmcollin78/versatile_thermostat/latest/total?style=plastic" />*/}
                        <Image height={20} width={108} alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/jmcollin78/versatile_thermostat/total?style=plastic&cacheSeconds=3600" />
                        <Image height={20} width={95} alt="GitHub Release" src="https://img.shields.io/github/v/release/jmcollin78/versatile_thermostat?style=plastic&cacheSeconds=3600" />
                        <Image height={20} width={139} alt="GitHub Stable Release" src={`https://img.shields.io/github/v/release/jmcollin78/versatile_thermostat?filter=${stable_release}&style=plastic&label=release%40stable&color=green&cacheSeconds=3600`} />

                    </div>
                    <p className="text-xl md:text-2xl text-[#52525b] dark:text-[#a1a1aa] leading-relaxed py-5">
                        {t('subtitle')}
                    </p>
                    <HacsInstallBadge className="inline-block mx-auto" />
                </div>
            </section>

            {/* Heating types */}
            <section className="space-y-6 rounded-2xl p-6 md:p-10 bg-blue-50 dark:bg-sky-950/60 border border-blue-200 dark:border-vtherm-tertiary/60">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-normal py-0">{t('heating.title')}</h2>
                    <p className="text-lg text-[#52525b] dark:text-[#a1a1aa]">{t('heating.desc')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {QUICKSTART_PAGES.map(page => <HeatingTypeCard
                        key={page.slug}
                        href={`/quick-start/${page.slug}/`}
                        icon={<HeatingIcon type={page.slug} className="w-12 h-12" />}
                        title={t(`heating.${page.key}.title`)}
                        description={t(`heating.${page.key}.desc`)}
                    />)}
                </div>
            </section>

            {/* Features Grid */}
            <section className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-normal py-0">{t('main-features')}</h2>
                    <p className="text-lg text-[#52525b] dark:text-[#a1a1aa]">{t('main-features-desc')}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map(feature => <FeatureCard
                        key={feature.key}
                        href={feature.href}
                        icon={<feature.icon className="w-6 h-6" />}
                        title={t(`cards.${feature.key}.title`)}
                        description={t(`cards.${feature.key}.desc`)}
                        more={t('learn-more')}
                    />)}
                </div>
                <div className="text-center">
                    <LinkLocale
                        href="/versus/"
                        className="inline-flex items-center gap-2 text-lg text-cyan-700 hover:text-cyan-500 transition-colors"
                    >
                        {t('versus-link')}
                        <ArrowRightIcon className="w-4 h-4" />
                    </LinkLocale>
                </div>
            </section>

            {/* About Section */}
            <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-normal py-0">{t('why')}</h2>
                    <p className="text-lg leading-relaxed">{t('why-explain')}</p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-normal py-0">{t('easy-install')}</h2>
                    <p className="text-lg leading-relaxed">{t('easy-install-explain')}</p>
                    <LinkLocale
                        href="/docs/creation/"
                        className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-500 transition-colors"
                    >
                        {t('config-guide')}
                        <ArrowRightIcon className="w-4 h-4" />
                    </LinkLocale>
                </div>
            </section>

            {/* Community tools */}
            <section className="space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-normal py-0">{t('tools.title')}</h2>
                    <p className="text-lg text-[#52525b] dark:text-[#a1a1aa]">{t('tools.desc')}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {TOOLS.map(tool => <LinkLocale
                        key={tool.key}
                        href={tool.href}
                        className="group flex gap-4 p-5 rounded-xl bg-vtherm-quaternary/30 dark:bg-vtherm-tertiary/30 hover:shadow-lg transition-all duration-300"
                    >
                        <tool.icon className="w-8 h-8 shrink-0 text-vtherm-secondary group-hover:scale-110 transition-transform" aria-hidden="true" />
                        <span className="space-y-1">
                            <span className="flex items-center gap-2 text-lg font-medium text-vtherm-primary dark:text-vtherm-light">
                                {t(`tools.${tool.key}.title`)}
                                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <span className="block leading-relaxed dark:text-vtherm-light/70">{t(`tools.${tool.key}.desc`)}</span>
                        </span>
                    </LinkLocale>)}
                </div>
            </section>

            {/* Press references */}
            <section className="space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl md:text-4xl font-normal py-0">{t('press.title')}</h2>
                    <p className="text-lg text-[#52525b] dark:text-[#a1a1aa]">{t('press.desc')}</p>
                </div>
                {press.length > 0 && <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                    {press.map(pressCard)}
                </div>}
                {otherPress.length > 0 && <details className="group/press max-w-5xl mx-auto">
                    <summary className="cursor-pointer list-none flex items-center justify-center gap-2 text-lg text-cyan-700 hover:text-cyan-500 transition-colors">
                        {t('press.other-languages')}
                        <ChevronDownIcon className="w-4 h-4 group-open/press:rotate-180 transition-transform" aria-hidden="true" />
                    </summary>
                    <div className="space-y-6 pt-6">
                        {otherPress.map(group => <div key={group.lang} className="space-y-3">
                            <h3 className="flex items-center gap-2 py-0 text-xl font-medium">
                                <span className={`fi fi-${FLAGS[group.lang]}`} aria-hidden="true"></span>
                                {t(`press.languages.${group.lang}`)}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {group.references.map(pressCard)}
                            </div>
                        </div>)}
                    </div>
                </details>}
            </section>

            <CtaSection title={t('cta.title')} description={t('cta.desc')}>
                <LinkLocale href="/quick-start/">
                    <Button variant="primary" size="lg">
                        <span>{t('cta.quickstart')}</span>
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                </LinkLocale>
                <LinkLocale href="/docs/installation/">
                    <Button variant="secondary" size="lg">{t('install-guide')}</Button>
                </LinkLocale>
            </CtaSection>

            {/* Back to Top */}
            <div className="flex justify-center pt-8">
                <BackToTop />
            </div>
        </div>
    );
}

interface FeatureCardProps {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    /** Label of the "learn more" link */
    more: string;
}

/** Feature tile linking to its documentation page */
function FeatureCard({ href, icon, title, description, more }: FeatureCardProps) {
    return (
        <LinkLocale
            href={href}
            className="group flex flex-col gap-3 p-6 rounded-xl bg-white dark:bg-vtherm-dark/40 border border-zinc-200 dark:border-vtherm-tertiary/60 hover:border-vtherm-secondary/60 hover:shadow-lg transition-all duration-300"
        >
            <span className="inline-flex w-11 h-11 items-center justify-center rounded-lg bg-vtherm-secondary/10 text-vtherm-secondary">{icon}</span>
            <h3 className="py-0 text-xl font-medium text-vtherm-primary dark:text-vtherm-light">{title}</h3>
            <p className="leading-relaxed dark:text-vtherm-light/70">{description}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm text-cyan-700 group-hover:text-cyan-500 transition-colors">
                {more}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
        </LinkLocale>
    );
}
