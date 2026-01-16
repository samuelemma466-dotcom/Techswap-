
import React from 'react';
import { ShoppingBag, ShieldCheck, Wallet, Bell, Menu, Shield, LayoutDashboard } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
  onLogout?: () => void;
  userRole: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, onLogout, userRole }) => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Area */}
          <div className="flex items-center cursor-pointer gap-2" onClick={() => setView(userRole === 'seller' ? 'dashboard-overview' : 'landing')}>
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-slate-900" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              GadgetTrust <span className="text-emerald-400">AI</span>
            </span>
          </div>

          {/* Desktop Links (Buyer) */}
          {userRole === 'buyer' && (
            <div className="hidden md:flex items-center space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <NavBtn active={currentView === 'market'} onClick={() => setView('market')} icon={ShoppingBag} label="Marketplace" />
              <NavBtn active={currentView === 'trust-scan'} onClick={() => setView('trust-scan')} icon={ShieldCheck} label="TrustScan" />
            </div>
          )}

          {/* Right Icons */}
          <div className="flex items-center gap-3">
             {userRole !== 'guest' && (
                <>
                  <button onClick={() => setView('wallet')} className={`p-2 rounded-full transition-colors ${currentView === 'wallet' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
                    <Wallet className="w-5 h-5" />
                  </button>
                  <button onClick={() => setView('cart')} className="relative p-2 text-slate-400 hover:text-white transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
                    )}
                  </button>
                  {onLogout && (
                     <button onClick={onLogout} className="text-xs font-bold text-slate-400 hover:text-red-400 ml-2">
                        EXIT
                     </button>
                  )}
                </>
             )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavBtn = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium transition-all rounded-lg ${
      active ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`}
  >
    <Icon className={`w-4 h-4 mr-2 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
    {label}
  </button>
);
