
import React from 'react';
import { ShoppingBag, Store, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './Button';

interface LandingPageProps {
    onSelectRole: (role: 'buyer' | 'seller') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-full h-64 bg-emerald-900/20 blur-3xl"></div>
            </div>

            {/* Navbar Placeholder */}
            <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2">
                     <div className="bg-gradient-to-r from-indigo-500 to-teal-400 p-2 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                     </div>
                     <span className="text-xl font-bold tracking-tight">TechSwap AI</span>
                </div>
                <div className="text-sm text-slate-400">Nigeria's #1 Tech Marketplace</div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pb-20">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-teal-300 mb-8 animate-in fade-in slide-in-from-top-4">
                    <ShieldCheck className="w-3.5 h-3.5" /> Trusted by 50,000+ Nigerians
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in zoom-in-95 duration-700">
                    The Smart Way to <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400">
                        Trade Tech.
                    </span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    Buy clean UK Used gadgets, sell your old devices for instant cash, or swap for an upgrade. Powered by AI pricing.
                </p>

                <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    
                    {/* Buyer Card */}
                    <div 
                        onClick={() => onSelectRole('buyer')}
                        className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/20 text-left"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingBag className="w-32 h-32 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4 text-teal-400 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">I want to Buy</h3>
                            <p className="text-slate-400 text-sm mb-6">Browse verified UK used & brand new devices. Get the best deals in Naira.</p>
                            <div className="flex items-center text-teal-400 font-bold text-sm group-hover:gap-2 transition-all">
                                Enter Market <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div 
                        onClick={() => onSelectRole('seller')}
                        className="group relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 text-left"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Store className="w-32 h-32 transform -rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                                <Store className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">I want to Sell</h3>
                            <p className="text-slate-400 text-sm mb-6">List your inventory, manage orders, and get AI insights to grow your business.</p>
                            <div className="flex items-center text-indigo-400 font-bold text-sm group-hover:gap-2 transition-all">
                                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <footer className="relative z-10 py-6 text-center text-slate-500 text-sm">
                &copy; 2024 TechSwap Nigeria. All rights reserved.
            </footer>
        </div>
    );
};
