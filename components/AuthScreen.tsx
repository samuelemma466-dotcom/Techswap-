
import React, { useState } from 'react';
import { Icons } from './ui/icons';
import { Button } from './Button';
import { logSecurityEvent, sanitizeInput } from '../services/geminiService';

interface AuthScreenProps {
    role: 'buyer' | 'seller';
    onComplete: (data: any) => void;
    onBack: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ role, onComplete, onBack }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('signup');
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '', storeName: '', location: '' });
    const isSeller = role === 'seller';
    const themeColor = isSeller ? 'text-indigo-600' : 'text-teal-600';
    const themeBg = isSeller ? 'bg-indigo-600' : 'bg-teal-600';
    const themeBorder = isSeller ? 'focus:ring-indigo-500' : 'focus:ring-teal-500';

    const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: sanitizeInput(value) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            logSecurityEvent(`${mode === 'login' ? 'Login' : 'Signup'} successful: ${formData.email}`, 'success');
            onComplete(formData);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex bg-slate-900 animate-in fade-in duration-300">
            <div className={`hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white ${isSeller ? 'bg-indigo-900' : 'bg-teal-900'}`}>
                <div className="absolute inset-0 z-0">
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${isSeller ? 'bg-purple-500' : 'bg-emerald-400'}`}></div>
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                        <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Role Selection
                    </button>
                    
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
                        {isSeller ? <Icons.Store className="w-8 h-8 text-indigo-300" /> : <Icons.User className="w-8 h-8 text-teal-300" />}
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">{mode === 'signup' ? 'Join TechSwap AI.' : 'Welcome Back.'}</h1>
                    <p className="text-lg text-white/70 max-w-md leading-relaxed">{isSeller ? "Access AI pricing and instant payouts." : "Discover verified gadgets."}</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center items-center p-6 relative">
                 <button onClick={onBack} className="lg:hidden absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100"><Icons.ArrowLeft className="w-5 h-5 text-slate-500" /></button>

                 <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className={`text-3xl font-bold ${isSeller ? 'text-indigo-900' : 'text-teal-900'}`}>{mode === 'login' ? 'Sign In' : 'Get Started'}</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl mt-4">
                            <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Create Account</button>
                            <button onClick={() => setMode('login')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Sign In</button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label><div className="relative"><Icons.User className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><input required type="text" placeholder="Chinedu Okeke" className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 ${themeBorder}`} value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} /></div></div>
                                {isSeller && <div><label className="block text-sm font-medium text-slate-700 mb-1">Store Name</label><div className="relative"><Icons.Store className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><input required type="text" placeholder="Emeka Gadgets" className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 ${themeBorder}`} value={formData.storeName} onChange={e => handleInputChange('storeName', e.target.value)} /></div></div>}
                            </>
                        )}

                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><div className="relative"><Icons.Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><input required type="email" placeholder="you@example.com" className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 ${themeBorder}`} value={formData.email} onChange={e => handleInputChange('email', e.target.value)} /></div></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label><div className="relative"><Icons.Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" /><input required type="password" placeholder="••••••••" className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 ${themeBorder}`} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} /></div></div>

                        <Button type="submit" disabled={isLoading} className={`w-full py-3 text-base ${themeBg} hover:opacity-90`}>
                            {isLoading ? <><Icons.Loader className="w-5 h-5 animate-spin mr-2" /> Processing...</> : <span className="flex items-center justify-center gap-2">{mode === 'login' ? 'Sign In' : 'Complete Setup'} <Icons.ArrowRight className="w-5 h-5" /></span>}
                        </Button>
                    </form>
                 </div>
            </div>
        </div>
    );
};
