
import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, ShieldCheck, Plus, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { MOCK_TRANSACTIONS } from '../constants';

export const WalletView: React.FC = () => {
    const [balanceVisible, setBalanceVisible] = useState(false);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-12">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
                <p className="text-slate-400">Manage your funds, trade-in credits, and transactions.</p>
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-2xl mb-10">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Wallet className="w-64 h-64 transform -rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <p className="text-indigo-200 font-medium flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> TechSwap Secure Balance
                            </p>
                            <button 
                                onClick={() => setBalanceVisible(!balanceVisible)}
                                className="text-indigo-200 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                            >
                                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <h2 className="text-5xl font-extrabold tracking-tight mb-2">
                            {balanceVisible ? '₦84,500.00' : '••••••••'}
                        </h2>
                        <p className="text-sm opacity-80 font-mono">**** **** **** 4289</p>
                    </div>

                    <div className="flex gap-4">
                        <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 h-12 px-6">
                            <Plus className="w-4 h-4 mr-2" /> Top Up
                        </Button>
                        <Button variant="outline" className="border-indigo-300 text-indigo-100 hover:bg-white/10 h-12 px-6">
                            <ExternalLink className="w-4 h-4 mr-2" /> Withdraw
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <ArrowDownLeft className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Total In (Credits)</p>
                        <p className="text-2xl font-bold text-white">
                            {balanceVisible ? '₦145,000' : '••••••'}
                        </p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                    <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Total Out (Spent)</p>
                        <p className="text-2xl font-bold text-white">
                            {balanceVisible ? '₦60,500' : '••••••'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" /> Recent Transactions
                    </h3>
                    <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                </div>

                <div className="divide-y divide-slate-100">
                    {MOCK_TRANSACTIONS.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{tx.description}</p>
                                    <p className="text-xs text-slate-500">{tx.date} • {tx.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">{tx.reference}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
