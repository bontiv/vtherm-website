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
import { LinkDocs } from "@/components/LinkLocale";
import { getT } from "../i18n";
import Image from "next/image";

export default async function Home({ params }: { params: Promise<{ lng: string }> }) {
    const { lng } = await params
    const { t } = await getT('home', { lng })
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="pt-8 pb-12 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-light">
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
                        <LinkDocs href='/installation/'>
                            <Button variant="primary" size="lg">
                                <span>{t('install-guide')}</span>
                                <ArrowRightIcon className="w-5 h-5 ml-2" />
                            </Button>
                        </LinkDocs>
                        <LinkDocs href='/creation/'>
                            <Button size="lg" variant="secondary">
                                {t('start-guide')}
                            </Button>
                        </LinkDocs>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    icon={<Cpu className="text-[#00D9FF] w-8 h-8" />}
                    title={t('cards.algo.title')}
                    description={t('cards.algo.desc')}
                />
                <FeatureCard
                    icon={<Settings className="text-[#00BCD4] w-8 h-8" />}
                    title={t('cards.flex.title')}
                    description={t('cards.flex.desc')}
                />
                <FeatureCard
                    icon={<Gauge className="text-[#00BCD4] w-8 h-8" />}
                    title={t('cards.valve.title')}
                    description={t('cards.valve.desc')}
                />
                <FeatureCard
                    icon={<Network className="text-[#4B9FD5] w-8 h-8" />}
                    title={t('cards.presence.title')}
                    description={t('cards.presence.desc')}
                />
                <FeatureCard
                    icon={<Thermometer className="text-[#5BA8DC] w-8 h-8" />}
                    title={t('cards.boiler.title')}
                    description={t('cards.boiler.desc')}
                />
                <FeatureCard
                    icon={<Bolt className="text-[#5BA8DC] w-8 h-8" />}
                    title={t('cards.power.title')}
                    description={t('cards.power.desc')}
                />
            </section>

            {/* About Section */}
            <section className="max-w-4xl mx-auto space-y-14">
                <div className="space-y-4">
                    <h2 className="text-4xl font-normal text-blue-800">
                        {t('why')}
                    </h2>
                    <p className="text-lg text-[#a1a1aa] leading-relaxed">
                        {t('why-explain')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-2xl font-medium text-blue-800">Caractéristiques principales</h3>
                        <ul className="space-y-2 text-[#a1a1aa]">
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
                        <h3 className="text-2xl font-medium text-blue-800">{t('easy-install')}</h3>
                        <p className="text-[#a1a1aa] leading-relaxed">
                            {t('easy-install-explain')}
                        </p>
                        <LinkDocs
                            href="/creation/"
                            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-400 transition-colors"
                        >
                            {t('config-guide')}
                            <ArrowRightIcon className="w-4 h-4" />
                        </LinkDocs>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-linear-to-r from-blue-300 to-sky-200 rounded-2xl p-8 md:p-12 text-center border border-blue-100">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-normal text-blue-800">
                        {t('cta.title')}
                    </h2>
                    <p className="text-lg text-grey-500">
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
        <div className="group p-6 rounded-xl bg-blue-900 border border-[#3a3a3a] hover:border-[#7CFC00]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#7CFC00]/5">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-medium text-white mb-2 transition-colors">
                {title}
            </h3>
            <p className="text-stone-300 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
