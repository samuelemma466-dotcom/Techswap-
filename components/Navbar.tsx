
import React from 'react';
import { ShoppingBag, Repeat, MessageCircle, Store, RefreshCw, User as UserIcon, LogOut, Wallet, Bell } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  cartCount: number;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, cartCount, onLogout }) => {
  const navItems = [
    { id: 'market', label: 'Market', icon: Store },
    { id: 'sell', label: 'Trade-in / Sell', icon: RefreshCw },
    { id: 'negotiations', label: 'Negotiations', icon: MessageCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView('market')}>
            <div className="bg-indigo-600 p-2 rounded-lg mr-2 group-hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-500">
              TechSwap AI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`flex items-center px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    isActive 
                      ? 'text-indigo-600 bg-white shadow-sm' 
                      : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setView('wallet')}
                className={`relative p-2.5 transition-colors rounded-full hover:bg-slate-100 border border-transparent hidden sm:flex ${currentView === 'wallet' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-600'}`}
                title="My Wallet"
             >
                <Wallet className="w-5 h-5" />
             </button>

             <button 
                onClick={() => setView('notifications')}
                className={`relative p-2.5 transition-colors rounded-full hover:bg-slate-100 border border-transparent ${currentView === 'notifications' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-600'}`}
                title="Notifications"
             >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>

             <button 
                onClick={() => setView('cart')}
                className={`relative p-2.5 transition-colors rounded-full hover:bg-slate-100 border border-transparent ${currentView === 'cart' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-600'}`}
             >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white transform bg-red-500 rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
             </button>

             <button 
                onClick={() => setView('profile')}
                className={`relative p-2.5 transition-colors rounded-full hover:bg-slate-100 border border-transparent ${currentView === 'profile' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'text-slate-600'}`}
                title="My Profile"
             >
                <UserIcon className="w-5 h-5" />
             </button>

             {onLogout && (
                 <div className="hidden md:flex h-8 w-px bg-slate-200 mx-1"></div>
             )}

             {onLogout && (
                 <button 
                    onClick={onLogout}
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 >
                    <LogOut className="w-4 h-4" />
                    <span>Exit</span>
                 </button>
             )}
          </div>
        </div>
      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden flex justify-around border-t border-slate-200 bg-white py-3 fixed bottom-0 left-0 w-full z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
             <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
        <button
            onClick={() => setView('wallet')}
            className={`p-2 rounded-xl flex flex-col items-center gap-1 ${currentView === 'wallet' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}
        >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-medium">Wallet</span>
        </button>
      </div>
    </nav>
  );
};
