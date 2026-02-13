import { Button } from "@/components/ui/Button";
import { BackToTop } from "@/components/ui/BackToTop";
import {
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
    FireIcon as Thermometer,
    CalendarIcon as Calendar,
    Cog6ToothIcon as Settings,
    ChartBarIcon as Gauge,
    SignalIcon as Network
} from "@heroicons/react/24/outline";
import Link from "next/link";
import LinkLocale from "@/components/LinkLocale";

export default function Home() {
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="pt-8 pb-12 text-center">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-light text-white">
                        Versatile Thermostat
                    </h1>
                    <p className="text-xl md:text-2xl text-[#a1a1aa] leading-relaxed">
                        Une intégration climatique avancée pour Home Assistant qui fonctionne avec n'importe quelle entité de climat existante
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button variant="primary" size="lg">
                            <span>Ajouter l'intégration</span>
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Button>
                        <Button variant="secondary" size="lg">
                            Voir la documentation
                        </Button>
                        <LinkLocale href="/configuration">
                            Guide de configuration
                        </LinkLocale>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                    icon={<Thermometer className="text-[#00D9FF] w-8 h-8" />}
                    title="Calibration Intelligente"
                    description="Algorithmes de calibration avancés pour une précision de température optimale. Ajustement automatique basé sur les conditions réelles."
                />
                <FeatureCard
                    icon={<Settings className="text-[#7CFC00] w-8 h-8" />}
                    title="Configuration Flexible"
                    description="Interface de configuration intuitive avec de nombreuses options personnalisables pour s'adapter à tous les systèmes."
                />
                <FeatureCard
                    icon={<Gauge className="text-[#00BCD4] w-8 h-8" />}
                    title="Contrôle de Valve"
                    description="Contrôle précis de l'ouverture des valves TRV avec support du mode boost et anti-freeze."
                />
                <FeatureCard
                    icon={<Network className="text-[#4B9FD5] w-8 h-8" />}
                    title="Équilibrage Hydraulique"
                    description="Système décentralisé d'équilibrage hydraulique pour une distribution optimale de la chaleur."
                />
                <FeatureCard
                    icon={<Thermometer className="text-[#5BA8DC] w-8 h-8" />}
                    title="Multi-Capteurs"
                    description="Support de plusieurs capteurs de température pour une moyenne pondérée et une meilleure précision."
                />
            </section>

            {/* About Section */}
            <section className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h2 className="text-4xl font-normal text-white">
                        Pourquoi Better Thermostat ?
                    </h2>
                    <p className="text-lg text-[#a1a1aa] leading-relaxed">
                        Better Thermostat a été créé pour résoudre les limitations des thermostats standards dans Home Assistant.
                        Notre objectif est de fournir un contrôle climatique intelligent et efficace qui s'adapte à vos besoins spécifiques.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-2xl font-medium text-white">Caractéristiques principales</h3>
                        <ul className="space-y-2 text-[#a1a1aa]">
                            <li className="flex items-start gap-2">
                                <span className="text-[#7CFC00] mt-1">✓</span>
                                <span>Compatible avec tous les thermostats existants</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#7CFC00] mt-1">✓</span>
                                <span>Algorithmes de calibration avancés</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#7CFC00] mt-1">✓</span>
                                <span>Support des fenêtres ouvertes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#7CFC00] mt-1">✓</span>
                                <span>Mode éco et confort automatiques</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-2xl font-medium text-white">Installation facile</h3>
                        <p className="text-[#a1a1aa] leading-relaxed">
                            Better Thermostat s'installe facilement via HACS (Home Assistant Community Store).
                            Une fois installé, vous pouvez configurer votre premier thermostat en quelques minutes
                            grâce à notre interface intuitive.
                        </p>
                        <Link
                            href="/configuration"
                            className="inline-flex items-center gap-2 text-[#00D9FF] hover:text-[#00BCD4] transition-colors"
                        >
                            Guide de configuration
                            <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#1f1f23] to-[#2b2b2b] rounded-2xl p-8 md:p-12 text-center border border-[#3a3a3a]">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-normal text-white">
                        Prêt à améliorer votre système de chauffage ?
                    </h2>
                    <p className="text-lg text-[#a1a1aa]">
                        Rejoignez des milliers d'utilisateurs qui ont déjà optimisé leur confort et leur consommation énergétique
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button variant="primary" size="lg">
                            Commencer maintenant
                        </Button>
                        <Button variant="outline" size="lg">
                            Voir les exemples
                        </Button>
                    </div>
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
        <div className="group p-6 rounded-xl bg-[#1f1f23] border border-[#3a3a3a] hover:border-[#7CFC00]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#7CFC00]/5">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-medium text-white mb-2 group-hover:text-[#7CFC00] transition-colors">
                {title}
            </h3>
            <p className="text-[#a1a1aa] leading-relaxed">
                {description}
            </p>
        </div>
    );
}
