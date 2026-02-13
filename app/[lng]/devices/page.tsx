import React from 'react';
import { WrenchScrewdriverIcon, SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const UnderConstruction: React.FC = () => {
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '4s' }} />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '5s', animationDelay: '2s' }} />
                </div>

                {/* Main content */}
                <div className="relative z-10 max-w-4xl w-full animate-fadeInUp">

                    {/* Header with icons */}
                    <div className="flex justify-center gap-6 mb-12">
                        <div className="animate-fadeInRotate" style={{ animationDelay: '0.1s' }}>
                            <WrenchScrewdriverIcon className="w-16 h-16 text-blue-600 drop-shadow-lg animate-bounce"
                                style={{ animationDuration: '2s' }} />
                        </div>
                        <div className="animate-fadeInRotate" style={{ animationDelay: '0.3s' }}>
                            <SparklesIcon className="w-16 h-16 text-cyan-500 drop-shadow-lg animate-pulse"
                                style={{ animationDuration: '2.5s' }} />
                        </div>
                        <div className="animate-fadeInRotate" style={{ animationDelay: '0.5s' }}>
                            <RocketLaunchIcon className="w-16 h-16 text-sky-600 drop-shadow-lg animate-bounce"
                                style={{ animationDuration: '2.2s', animationDelay: '0.3s' }} />
                        </div>
                    </div>

                    {/* Main heading */}
                    <div className="text-center mb-8">
                        <h1 className="animate-fadeInScale text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-shadow-blue-900 tracking-tight leading-none"
                            style={{
                                fontFamily: '"Playfair Display", Georgia, serif',
                                // textShadow: '0 0 40px rgba(59, 130, 246, 0.3)',
                                animationDelay: '0.7s'
                            }}>
                            En Construction
                        </h1>

                        <p className="animate-fadeInUp text-xl md:text-2xl text-blue-900/80 font-light tracking-wide"
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                animationDelay: '1s'
                            }}>
                            Quelque chose d'extraordinaire arrive bientôt
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="animate-fadeInUp max-w-md mx-auto mb-12" style={{ animationDelay: '1.2s' }}>
                        <div className="relative h-3 bg-blue-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-300/50">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 rounded-full shadow-lg animate-progressBar"
                                style={{
                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                            </div>
                        </div>
                        <p className="text-center mt-3 text-sm text-blue-800/70 font-medium">
                            Chargement en cours...
                        </p>
                    </div>

                    {/* Footer note */}
                    <div className="animate-fadeIn text-center mt-16" style={{ animationDelay: '1.6s' }}>
                        <p className="text-sm text-blue-900/50 font-light italic">
                            Notre équipe travaille avec passion pour vous offrir une expérience unique
                        </p>
                    </div>
                </div>

                {/* Decorative corner elements */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-blue-300/30 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-cyan-300/30 rounded-br-3xl" />
            </div>
        </>
    );
};

export default UnderConstruction;