
import React from 'react';
import { Icons } from './ui/icons';

interface LandingPageProps {
    onSelectRole: (role: 'buyer' | 'seller') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-top-4">
                    <Icons.Shield className="w-4 h-4" /> AI-Powered Verification & Escrow
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight animate-in zoom-in-95 duration-700">
                    People don't fear used gadgets. <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">They fear being scammed.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-12 animate-in fade-in slide-in-from-bottom-4 delay-200">
                    GadgetTrust AI removes the risk. We use Gemini AI to verify device condition and hold payments in escrow until you are satisfied.
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 delay-300">
                    <div onClick={() => onSelectRole('buyer')} className="group bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-emerald-500/50 p-8 rounded-2xl cursor-pointer text-left transition-all hover:bg-slate-900">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400"><Icons.Search className="w-6 h-6" /></div>
                        <h3 className="text-xl font-bold text-white mb-2">Buy Verified Gadgets</h3>
                        <p className="text-slate-400 text-sm mb-6">Browse listings with AI Trust Scores. Your money stays safe in escrow.</p>
                        <div className="flex items-center text-emerald-400 font-bold text-sm group-hover:gap-2 transition-all">Enter Market <Icons.ArrowRight className="w-4 h-4 ml-1" /></div>
                    </div>

                    <div onClick={() => onSelectRole('seller')} className="group bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-indigo-500/50 p-8 rounded-2xl cursor-pointer text-left transition-all hover:bg-slate-900">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400"><Icons.Lock className="w-6 h-6" /></div>
                        <h3 className="text-xl font-bold text-white mb-2">Sell with Trust</h3>
                        <p className="text-slate-400 text-sm mb-6">Get your inventory verified by TrustScan AI and build a 5-star reputation.</p>
                        <div className="flex items-center text-indigo-400 font-bold text-sm group-hover:gap-2 transition-all">Seller Console <Icons.ArrowRight className="w-4 h-4 ml-1" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
