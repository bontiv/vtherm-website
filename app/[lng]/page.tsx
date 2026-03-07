import { Button } from "@/components/ui/Button";
import { BackToTop } from "@/components/ui/BackToTop";
import {
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
    FireIcon as Thermometer,
    Cog6ToothIcon as Settings,
    ChartBarIcon as Gauge,
    SignalIcon as Network,
    BoltIcon as Bolt,
    CpuChipIcon as Cpu
} from "@heroicons/react/24/outline";
import { LinkLocale } from "@/components/LinkLocale";
import { getAlternatesMetadata, getT } from "../i18n";
import Image from "next/image";
import { Metadata } from "next";
import { opengraph_defaults } from "@/lib/opengraph";

export async function generateMetadata({ params }: { params: Promise<{ lng: string }> }): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT('common', { lng });

    const alternates = getAlternatesMetadata('/', lng, { x_default: process.env.NEXT_PUBLIC_SITE_URL + '/' });
    const title = 'Versatile Thermostat - ' + t('title');
    return {
        title: {
            absolute: title
        },
        alternates,
        openGraph: {
            title,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lng}/`,
            siteName: "Versatile Thermostat",
            ...opengraph_defaults,
        }
    }
}

export default async function Home({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params
    const { t } = await getT('home', { lng })
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="pt-8 pb-12 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-light text-vtherm-dark dark:text-vtherm-light">
                        Versatile Thermostat
                    </h1>
                    <p className="text-xl md:text-2xl text-[#a1a1aa] leading-relaxed">
                        {t('subtitle')}
                    </p>
                    <a className="inline-block mx-auto"
                        href="https://my.home-assistant.io/redirect/hacs_repository/?owner=jmcollin78&repository=versatile_thermostat"
                        target="_blank"
                        rel="noreferrer noopener"
                    ><Image src="https://my.home-assistant.io/badges/hacs_repository.svg" height={40} width={297} alt="Open your Home Assistant instance and open a repository inside the Home Assistant Community Store." />
                    </a>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <LinkLocale href='/docs/installation/'>
                            <Button variant="primary" size="lg">
                                <span>{t('install-guide')}</span>
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </Button>
                        </LinkLocale>
                        <LinkLocale href='/docs/creation/'>
                            <Button size="lg" variant="secondary">
                                {t('start-guide')}
                            </Button>
                        </LinkLocale>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    icon={<Cpu className="w-8 h-8" />}
                    title={t('cards.algo.title')}
                    description={t('cards.algo.desc')}
                />
                <FeatureCard
                    icon={<Settings className="w-8 h-8" />}
                    title={t('cards.flex.title')}
                    description={t('cards.flex.desc')}
                />
                <FeatureCard
                    icon={<Gauge className="w-8 h-8" />}
                    title={t('cards.valve.title')}
                    description={t('cards.valve.desc')}
                />
                <FeatureCard
                    icon={<Network className="w-8 h-8" />}
                    title={t('cards.presence.title')}
                    description={t('cards.presence.desc')}
                />
                <FeatureCard
                    icon={<Thermometer className="w-8 h-8" />}
                    title={t('cards.boiler.title')}
                    description={t('cards.boiler.desc')}
                />
                <FeatureCard
                    icon={<Bolt className="w-8 h-8" />}
                    title={t('cards.power.title')}
                    description={t('cards.power.desc')}
                />
            </section>

            {/* About Section */}
            <section className="max-w-4xl mx-auto space-y-14">
                <div className="space-y-4">
                    <h2 className="text-4xl font-normal ">
                        {t('why')}
                    </h2>
                    <p className="text-lg  leading-relaxed">
                        {t('why-explain')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-2xl font-medium ">Caractéristiques principales</h3>
                        <ul className="space-y-2 ">
                            {[
                                'compatibility',
                                'algorithms',
                                'window',
                                'boiler',
                                'presence'
                            ].map((x, i) =>
                                <li className="flex items-start gap-2" key={i}>
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{t(`features.${x}`)}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-medium ">{t('easy-install')}</h3>
                        <p className=" leading-relaxed">
                            {t('easy-install-explain')}
                        </p>
                        <LinkLocale
                            href="/docs/creation/"
                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors"
                        >
                            {t('config-guide')}
                            <ArrowRightIcon className="w-4 h-4" />
                        </LinkLocale>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-linear-to-r from-blue-300 dark:from-vtherm-tertiary to-sky-200 dark:to-vtherm-quaternary/80 rounded-2xl p-8 md:p-12 text-center border border-blue-100 dark:border-vtherm-tertiary">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-normal text-blue-700 dark:text-vtherm-light">
                        {t('cta.title')}
                    </h2>
                    <p className="text-lg dark:text-blue-200">
                        {t('cta.desc')}
                    </p>
                    {/* <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button variant="primary" size="lg">
                            Commencer maintenant
                        </Button>
                        <Button variant="outline" size="lg">
                            Voir les exemples
                        </Button>
                    </div> */}
                </div>
            </section>

            {/* Back to Top */}
            <div className="flex justify-center pt-8">
                <BackToTop />
            </div>
        </div>
    );
}

// Composant Feature Card
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="group p-6 rounded-xl bg-vtherm-quaternary/70 dark:bg-vtherm-tertiary/50 hover:border-vtherm-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#7CFC00]/5">
            <div className="mb-4 text-vtherm-secondary">{icon}</div>
            <h3 className="text-xl font-medium dark:text-vtherm-light text-vtherm-primary mb-2 transition-colors">
                {title}
            </h3>
            <p className=" leading-relaxed dark:text-vtherm-light/70">
                {description}
            </p>
        </div>
    );
}
