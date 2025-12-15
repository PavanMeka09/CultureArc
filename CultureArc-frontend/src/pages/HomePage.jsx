import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Shield, Users, ArrowRight } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="flex flex-col flex-1">
            {/* HeroSection */}
            <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center px-4">
                <div className="flex flex-col gap-6 max-w-3xl items-center">
                    <h1 className="text-text-light dark:text-white text-5xl font-black leading-tight tracking-tighter sm:text-6xl lg:text-7xl">
                        The Archive of <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Our Shared Story</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-normal leading-relaxed sm:text-xl max-w-2xl">
                        CultureArc is a global platform dedicated to preserving, discovering, and connecting through the world's diverse cultural heritage.
                    </p>

                    <div className="mt-8">
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-lg font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/25"
                        >
                            Explore
                            <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Platform Explanation Section */}
            <div className="py-16 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-text-light dark:text-white sm:text-4xl">
                            What CultureArc Does
                        </h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                            Connecting the past with the future through three core pillars.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-white mb-3">Preserve History</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Digitally archive artifacts, stories, and traditions to ensure they are never lost to time. Safe, secure, and permanent preservation for future generations.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Globe size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-white mb-3">Discover Cultures</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Explore a vast, interactive map of global heritage. uncover hidden gems, learn about different eras, and broaden your cultural horizons.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Users size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-text-light dark:text-white mb-3">Share Culture</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Contribute your own threads to the human tapestry. Share artifacts, oral histories, and traditions to foster global understanding and appreciation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default HomePage;

