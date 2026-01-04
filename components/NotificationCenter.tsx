
import React from 'react';
import { Bell, Package, Tag, AlertCircle, Info, Check, Trash2 } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../constants';

export const NotificationCenter: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 pb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                    <p className="text-slate-400">Stay updated on your orders, swaps, and deals.</p>
                </div>
                <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                    Mark all as read
                </button>
            </div>

            <div className="space-y-4">
                {MOCK_NOTIFICATIONS.map((note) => {
                    const icons = {
                        order: <Package className="w-5 h-5 text-indigo-400" />,
                        promo: <Tag className="w-5 h-5 text-pink-400" />,
                        alert: <AlertCircle className="w-5 h-5 text-amber-400" />,
                        system: <Info className="w-5 h-5 text-teal-400" />
                    };
                    
                    const bgs = {
                        order: 'bg-indigo-500/10 border-indigo-500/20',
                        promo: 'bg-pink-500/10 border-pink-500/20',
                        alert: 'bg-amber-500/10 border-amber-500/20',
                        system: 'bg-teal-500/10 border-teal-500/20'
                    };

                    return (
                        <div key={note.id} className={`p-4 rounded-2xl border flex gap-4 transition-all hover:bg-white/5 ${note.read ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-800 border-slate-700'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgs[note.type]}`}>
                                {icons[note.type]}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-bold ${note.read ? 'text-slate-400' : 'text-white'}`}>{note.title}</h4>
                                    <span className="text-xs text-slate-500">{note.time}</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed">{note.message}</p>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white" title="Mark as Read">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 text-center">
                <button className="px-4 py-2 bg-slate-800 rounded-lg text-slate-400 text-sm hover:bg-slate-700 hover:text-white transition-colors">
                    Load earlier notifications
                </button>
            </div>
        </div>
    );
};
