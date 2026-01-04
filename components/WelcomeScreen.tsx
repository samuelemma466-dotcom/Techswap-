
import React, { useEffect, useState } from 'react';
import { Zap, Cpu, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Init, 1: Text Reveal, 2: Button Ready
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Stage 1: Reveal Text
    const timer1 = setTimeout(() => setStage(1), 800);
    // Stage 2: Show Button
    const timer2 = setTimeout(() => setStage(2), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800); // Wait for exit animation
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] transition-transform duration-[3000ms] ${stage >= 1 ? 'scale-150 translate-y-10' : 'scale-100'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] transition-transform duration-[3000ms] ${stage >= 1 ? 'scale-150 -translate-y-10' : 'scale-100'}`}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        
        {/* Animated Icon Container */}
        <div className={`relative mb-8 transition-all duration-1000 ${stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Zap className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400" fill="url(#gradient)" />
                    
                    {/* SVG Gradient Definition for Icon Fill */}
                    <svg width="0" height="0">
                      <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop stopColor="#818cf8" offset="0%" />
                        <stop stopColor="#2dd4bf" offset="100%" />
                      </linearGradient>
                    </svg>
                </div>
                
                {/* Orbiting Elements */}
                <div className={`absolute -right-4 -top-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg transition-all duration-700 delay-300 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <Cpu className="w-4 h-4 text-indigo-400" />
                </div>
                <div className={`absolute -left-4 -bottom-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-lg transition-all duration-700 delay-500 ${stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
            </div>
        </div>

        {/* Main Text Reveal */}
        <div className="space-y-4 max-w-2xl">
            <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight text-white transition-all duration-1000 ${stage >= 1 ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
                TechSwap <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">AI</span>
            </h1>
            
            <p className={`text-lg md:text-xl text-slate-400 transition-all duration-1000 delay-300 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                The Future of Device Trading in Nigeria.
            </p>
            
            <div className={`flex items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500 uppercase tracking-widest transition-all duration-1000 delay-500 ${stage >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Cross-Border Standard</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Gemini Powered</span>
            </div>
        </div>

        {/* Action Button */}
        <div className={`mt-12 transition-all duration-700 delay-100 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button 
                onClick={handleEnter}
                className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <span className="relative flex items-center gap-2">
                    Enter Marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>
        </div>

      </div>

      {/* Footer / Loading Bar */}
      <div className="absolute bottom-10 left-0 w-full flex flex-col items-center">
         <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
             <div className={`h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-[2000ms] ease-out ${stage >= 1 ? 'w-full' : 'w-0'}`}></div>
         </div>
         <p className="text-[10px] text-slate-600 mt-2 font-mono">INITIALIZING SYSTEM MODULES...</p>
      </div>
    </div>
  );
};
