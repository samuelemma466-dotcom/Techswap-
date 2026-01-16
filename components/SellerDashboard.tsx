
import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, TrendingUp, Settings, Bell, 
    Search, Plus, Wallet, BarChart3, AlertCircle, Sparkles, Image as ImageIcon, 
    Store as StoreIcon, Eye, EyeOff, ShieldCheck, CheckCircle2, Lock, 
    RefreshCcw, ChevronRight, Filter, AlertTriangle, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Product, Order, AiSellerInsight, OrderStatus, StoreProfile, AiPricingAdvice, Transaction } from '../types';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS } from '../constants';
import { generateSellerInsights, getSmartPricingAdvice } from '../services/geminiService';
import { Button } from './Button';

// --- Local Types for Dashboard Internal Use ---
type DashboardTab = 'overview' | 'inventory' | 'trust' | 'orders' | 'wallet' | 'settings';

interface SellerDashboardProps {
    onBackToHome: () => void;
    orders: Order[];
    notify: (type: 'success' | 'error' | 'info', message: string) => void;
    onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ 
    onBackToHome, 
    orders = [], 
    notify, 
    onUpdateOrderStatus 
}) => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    const [isLoading, setIsLoading] = useState(false);
    
    // Data States (initialized with safe defaults)
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [storeProfile, setStoreProfile] = useState<StoreProfile>({
        storeName: "GadgetKing NG",
        description: "Premium UK Used iPhones & MacBooks",
        logoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100",
        bannerUrl: "",
        contactEmail: "sales@gadgetking.ng",
        pickupAddress: "Suite 15, Computer Village, Ikeja",
        sellerTrustGrade: 'A'
    });
    
    // AI States
    const [insight, setInsight] = useState<AiSellerInsight | null>(null);
    const [simulatingScan, setSimulatingScan] = useState<string | null>(null); // ID of product being scanned

    // Initialize Mock Data
    useEffect(() => {
        // Hydrate products with extra seller-specific fields
        setMyProducts(MOCK_PRODUCTS.slice(0, 8).map(p => ({
            ...p,
            stock: Math.floor(Math.random() * 8) + 1,
            sku: `GK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            views: Math.floor(Math.random() * 500) + 50,
            status: 'active',
            aiPricingSuggestion: {
                price: p.price * 1.05,
                confidence: 0.85
            }
        })));

        // Load Initial Insights
        generateSellerInsights({ revenue: 4500000, inventory: 12 }).then(setInsight);
    }, []);

    // --- Computed Metrics ---
    const totalRevenue = 4500000; // Mock total
    const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'escrow_locked').length;
    const activeListings = myProducts.filter(p => p.status === 'active').length;
    const trustScore = 98; // Calculated score

    // --- Actions ---
    const handleRunTrustScan = (productId: string) => {
        setSimulatingScan(productId);
        notify('info', 'TrustScan AI initialized...');
        
        setTimeout(() => {
            setMyProducts(prev => prev.map(p => {
                if (p.id === productId) {
                    return { ...p, isVerified: true, condition: 'Grade A', sellerTrustScore: 99 };
                }
                return p;
            }));
            setSimulatingScan(null);
            notify('success', 'Verification Complete: Device marked as Grade A');
        }, 3000);
    };

    const handleUpdatePrice = (productId: string, newPrice: number) => {
        setMyProducts(prev => prev.map(p => p.id === productId ? { ...p, price: newPrice } : p));
        notify('success', 'Price updated successfully');
    };

    // --- Render Helpers ---
    const TabButton = ({ id, label, icon: Icon, alertCount }: { id: DashboardTab, label: string, icon: any, alertCount?: number }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left">{label}</span>
            {alertCount !== undefined && alertCount > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {alertCount}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
            
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-slate-800 p-6 flex flex-col bg-slate-950/50 backdrop-blur-xl fixed h-full z-20 md:relative hidden md:flex">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                        GT
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">Seller Pro</span>
                        <span className="text-[10px] text-emerald-400 font-medium">VERIFIED MERCHANT</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                    <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
                    <TabButton id="inventory" label="Inventory" icon={Package} />
                    <TabButton id="trust" label="Trust Center" icon={ShieldCheck} alertCount={1} />
                    <TabButton id="orders" label="Orders" icon={ShoppingCart} alertCount={pendingOrders} />
                    <TabButton id="wallet" label="Wallet" icon={Wallet} />
                    <div className="my-4 border-t border-slate-800"></div>
                    <TabButton id="settings" label="Store Settings" icon={Settings} />
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button onClick={onBackToHome} className="w-full text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                        <ChevronRight className="w-4 h-4 rotate-180" /> Exit Dashboard
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                
                {/* Mobile Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
                    <h2 className="font-bold text-lg capitalize flex items-center gap-2 text-white">
                        {activeTab === 'overview' && <LayoutDashboard className="w-5 h-5 text-indigo-500" />}
                        {activeTab === 'inventory' && <Package className="w-5 h-5 text-emerald-500" />}
                        {activeTab === 'trust' && <ShieldCheck className="w-5 h-5 text-teal-500" />}
                        {activeTab === 'orders' && <ShoppingCart className="w-5 h-5 text-amber-500" />}
                        {activeTab === 'wallet' && <Wallet className="w-5 h-5 text-purple-500" />}
                        {activeTab === 'settings' && <Settings className="w-5 h-5 text-slate-500" />}
                        {activeTab.replace('-', ' ')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-950"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                            <img src={storeProfile.logoUrl} alt="Store" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
                    
                    {/* ================= OVERVIEW TAB ================= */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <OverviewCard 
                                    label="Total Revenue" 
                                    value={`₦${(totalRevenue/1000).toFixed(0)}k`} 
                                    icon={Wallet} 
                                    color="text-emerald-400"
                                    bg="bg-emerald-500/10"
                                />
                                <OverviewCard 
                                    label="Active Listings" 
                                    value={activeListings.toString()} 
                                    icon={Package} 
                                    color="text-indigo-400"
                                    bg="bg-indigo-500/10"
                                />
                                <OverviewCard 
                                    label="Pending Orders" 
                                    value={pendingOrders.toString()} 
                                    icon={ShoppingCart} 
                                    color="text-amber-400"
                                    bg="bg-amber-500/10"
                                />
                                <OverviewCard 
                                    label="Trust Score" 
                                    value={`${trustScore}%`} 
                                    icon={ShieldCheck} 
                                    color="text-teal-400"
                                    bg="bg-teal-500/10"
                                    subtext="Grade A Seller"
                                />
                            </div>

                            {/* AI Insight Section */}
                            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Sparkles className="w-32 h-32 text-indigo-400" />
                                </div>
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                        <Sparkles className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {insight?.headline || "AI Market Insight"}
                                        </h3>
                                        <p className="text-slate-300 text-sm max-w-2xl mb-4 leading-relaxed">
                                            {insight?.content || "Gathering market data to improve your sales performance..."}
                                        </p>
                                        {insight?.actionableTip && (
                                            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                                <AlertCircle className="w-3 h-3" /> TIP: {insight.actionableTip}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= INVENTORY TAB ================= */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search inventory..." 
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <Button className="bg-indigo-600 hover:bg-indigo-500">
                                    <Plus className="w-4 h-4 mr-2" /> Add Gadget
                                </Button>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-400">
                                        <thead className="bg-slate-950/50 text-slate-500 font-medium border-b border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4">Product</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Price</th>
                                                <th className="px-6 py-4">Stock</th>
                                                <th className="px-6 py-4">Trust Grade</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {myProducts.map(product => (
                                                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                                                                <img src={product.image} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-white line-clamp-1">{product.name}</p>
                                                                <p className="text-xs text-slate-500">{product.sku}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                                            product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                                                        }`}>
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-white">₦{product.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4">{product.stock}</td>
                                                    <td className="px-6 py-4">
                                                        {simulatingScan === product.id ? (
                                                            <span className="flex items-center gap-2 text-indigo-400 text-xs animate-pulse">
                                                                <Sparkles className="w-3 h-3" /> AI Scanning...
                                                            </span>
                                                        ) : (
                                                            <span className={`flex items-center gap-1.5 ${product.isVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                                <ShieldCheck className="w-4 h-4" />
                                                                {product.isVerified ? product.condition : 'Unverified'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!product.isVerified && (
                                                            <button 
                                                                onClick={() => handleRunTrustScan(product.id)}
                                                                disabled={!!simulatingScan}
                                                                className="text-xs bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-all"
                                                            >
                                                                Run TrustScan
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= TRUST CENTER TAB ================= */}
                    {activeTab === 'trust' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                        Verification Status
                                    </h3>
                                    <div className="space-y-4">
                                        {myProducts.slice(0, 3).map(p => (
                                            <div key={p.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} className="w-12 h-12 rounded object-cover" />
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{p.name}</p>
                                                        <p className="text-xs text-slate-500">ID: {p.id.slice(0,8)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {p.isVerified ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                                                                <CheckCircle2 className="w-4 h-4" /> Verified
                                                            </span>
                                                            <span className="text-xs text-slate-500">Trust Grade: {p.condition}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-end">
                                                            <span className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                                                <AlertTriangle className="w-4 h-4" /> Pending
                                                            </span>
                                                            <button 
                                                                onClick={() => handleRunTrustScan(p.id)}
                                                                className="text-xs text-indigo-400 underline mt-1"
                                                            >
                                                                Verify Now
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-emerald-400">A</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Grade A Seller</h3>
                                    <p className="text-slate-400 text-sm mt-2">
                                        You are in the top 5% of trusted merchants. This boosts your listings in search.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= ORDERS TAB ================= */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                             {orders.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                                    <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500">No active orders yet.</p>
                                </div>
                             ) : (
                                 <div className="space-y-4">
                                     {orders.map(order => (
                                         <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-slate-800 pb-4">
                                                 <div>
                                                     <p className="text-xs text-slate-500 uppercase font-bold mb-1">Order #{order.id.slice(0,8)}</p>
                                                     <div className="flex items-center gap-2">
                                                         <span className="text-white font-bold text-lg">₦{order.totalAmount.toLocaleString()}</span>
                                                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                                                             order.status === 'escrow_locked' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                                             order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                             'bg-slate-800 text-slate-400'
                                                         }`}>
                                                             {order.status.replace('_', ' ')}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 <div className="flex gap-2">
                                                     {order.status === 'processing' && (
                                                         <Button size="sm" onClick={() => onUpdateOrderStatus(order.id, 'pickup_scheduled')}>
                                                             Confirm Pickup
                                                         </Button>
                                                     )}
                                                     {order.status === 'pickup_scheduled' && (
                                                         <Button size="sm" onClick={() => onUpdateOrderStatus(order.id, 'out_for_delivery')}>
                                                             Mark Shipped
                                                         </Button>
                                                     )}
                                                 </div>
                                             </div>
                                             
                                             {/* Escrow Timeline */}
                                             <div className="relative pt-2 pb-2">
                                                <div className="h-1 bg-slate-800 rounded-full w-full absolute top-1/2 -translate-y-1/2"></div>
                                                <div className="flex justify-between relative z-10">
                                                    {['Payment', 'Verification', 'Delivery', 'Release'].map((step, i) => {
                                                        // Simple logic to show progress based on order status
                                                        const isCompleted = i === 0 || (i === 1 && order.status !== 'escrow_locked') || (i === 2 && order.status === 'delivered');
                                                        return (
                                                            <div key={step} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
                                                                <div className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900 border-slate-600'}`}></div>
                                                                <span className={`text-[10px] uppercase font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-600'}`}>{step}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}

                    {/* ================= WALLET TAB ================= */}
                    {activeTab === 'wallet' && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5">
                                    <Wallet className="w-64 h-64 -rotate-12" />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-indigo-300 text-sm font-medium mb-1 flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> Available Balance
                                    </p>
                                    <h2 className="text-5xl font-extrabold text-white tracking-tight mb-6">
                                        ₦4,520,000<span className="text-2xl text-indigo-300/50">.00</span>
                                    </h2>
                                    <div className="flex gap-4">
                                        <Button className="bg-white text-indigo-900 hover:bg-indigo-50 border-0 h-10 px-6 font-bold">
                                            Withdraw Funds
                                        </Button>
                                        <Button variant="outline" className="border-indigo-500/50 text-indigo-200 hover:bg-white/5 h-10 px-6">
                                            Transaction History
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">In Escrow</p>
                                        <p className="text-xl font-bold text-white">₦150,000</p>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-lg text-slate-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Pending Withdrawal</p>
                                        <p className="text-xl font-bold text-white">₦0.00</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                                    <h3 className="font-bold text-white">Recent Transactions</h3>
                                </div>
                                <div className="divide-y divide-slate-800">
                                    {MOCK_TRANSACTIONS.map(tx => (
                                        <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-800/20">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                                    {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{tx.description}</p>
                                                    <p className="text-xs text-slate-500">{tx.date}</p>
                                                </div>
                                            </div>
                                            <div className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* ================= SETTINGS TAB ================= */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                            <h3 className="text-xl font-bold text-white mb-6">Store Configuration</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Name</label>
                                    <input type="text" value={storeProfile.storeName} onChange={e => setStoreProfile({...storeProfile, storeName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pickup Address</label>
                                    <input type="text" value={storeProfile.pickupAddress} onChange={e => setStoreProfile({...storeProfile, pickupAddress: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support Email</label>
                                    <input type="email" value={storeProfile.contactEmail} onChange={e => setStoreProfile({...storeProfile, contactEmail: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Audit Log
                                </h4>
                                <div className="bg-slate-950 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Login from New Device</span>
                                        <span className="text-slate-600">Today, 10:42 AM</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Price Update: iPhone 13</span>
                                        <span className="text-slate-600">Yesterday, 4:20 PM</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Withdrawal Request</span>
                                        <span className="text-slate-600">Nov 20, 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

// Helper Component for Stats Cards
const OverviewCard = ({ label, value, icon: Icon, color, bg, subtext }: any) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 ${color}`}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {subtext && <p className="text-[10px] text-emerald-400 font-bold mt-1">{subtext}</p>}
        </div>
    </div>
);
