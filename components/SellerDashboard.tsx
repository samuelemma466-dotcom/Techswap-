
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/ui/icons'; // CENTRALIZED ICON IMPORT
import { Product, Order, AiSellerInsight, OrderStatus, StoreProfile } from '../types';
import { MOCK_PRODUCTS, MOCK_TRANSACTIONS } from '../constants';
import { generateSellerInsights, generateListingDetails } from '../services/geminiService';
import { Button } from './Button';

type DashboardTab = 'overview' | 'inventory' | 'trust' | 'orders' | 'wallet' | 'insights' | 'settings';

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
    const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
    
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
    const [insight, setInsight] = useState<AiSellerInsight | null>(null);
    const [simulatingScan, setSimulatingScan] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    
    // Form State
    const [productForm, setProductForm] = useState<Partial<Product>>({
        name: '', price: 0, stock: 1, category: 'Phone', condition: 'Grade A', description: ''
    });
    const [formImage, setFormImage] = useState<string | null>(null);
    const [aiFilling, setAiFilling] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Hydrate mock data
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
        
        generateSellerInsights({ revenue: 4500000, inventory: 12 }).then(setInsight);
    }, []);

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
        }, 2500);
    };

    const handleDeleteProduct = (id: string) => {
        setMyProducts(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
        notify('info', 'Product removed from inventory');
    };

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.price) {
            notify('error', 'Please fill in required fields');
            return;
        }

        if (editingProduct) {
            setMyProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productForm, image: formImage || p.image } as Product : p));
            notify('success', 'Product updated');
        } else {
            const newProduct: Product = {
                id: Date.now().toString(),
                ...productForm as any,
                image: formImage || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
                sellerId: 's1',
                sellerName: storeProfile.storeName,
                sellerTrustScore: 98,
                isVerified: false,
                status: 'active',
                views: 0,
                demandLevel: 'Medium',
                estimatedDaysToSell: 7
            };
            setMyProducts(prev => [newProduct, ...prev]);
            notify('success', 'Product added successfully');
        }
        closeModal();
    };

    const handleAiAutoFill = async () => {
        if (!formImage) return;
        setAiFilling(true);
        try {
            const base64 = formImage.split(',')[1];
            const details = await generateListingDetails(base64);
            setProductForm(prev => ({
                ...prev,
                name: details.name,
                price: details.price,
                category: details.category,
                condition: details.condition,
                description: details.description
            }));
            notify('success', 'AI Analysis Complete');
        } catch (e) {
            notify('error', 'AI Analysis failed, please enter details manually');
        } finally {
            setAiFilling(false);
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setProductForm(product);
        setFormImage(product.image);
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: 0, stock: 1, category: 'Phone', condition: 'Grade A', description: '' });
        setFormImage(null);
    };

    const totalRevenue = 4500000;
    const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'escrow_locked').length;
    const activeListings = myProducts.filter(p => p.status === 'active').length;

    const NavItem = ({ id, label, icon: Icon, alert }: { id: DashboardTab, label: string, icon: any, alert?: number }) => (
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
            {alert !== undefined && alert > 0 && (
                <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{alert}</span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
            <aside className="w-64 border-r border-slate-800 p-6 flex flex-col bg-slate-950/50 backdrop-blur-xl fixed h-full z-20 md:relative hidden md:flex">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">GT</div>
                    <div><span className="font-bold text-lg block leading-none">Seller Pro</span><span className="text-[10px] text-emerald-400 font-medium">VERIFIED</span></div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                    <NavItem id="overview" label="Overview" icon={Icons.Dashboard} />
                    <NavItem id="inventory" label="Inventory" icon={Icons.Package} />
                    <NavItem id="trust" label="Trust Center" icon={Icons.Shield} alert={1} />
                    <NavItem id="orders" label="Orders" icon={Icons.Cart} alert={pendingOrders} />
                    <NavItem id="wallet" label="Wallet" icon={Icons.Wallet} />
                    <NavItem id="insights" label="AI Insights" icon={Icons.Sparkles} />
                    <div className="my-4 border-t border-slate-800"></div>
                    <NavItem id="settings" label="Settings" icon={Icons.Settings} />
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                    <button onClick={onBackToHome} className="w-full text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                        <Icons.LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto relative h-screen">
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
                    <h2 className="font-bold text-lg capitalize flex items-center gap-2 text-white">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                            <img src={storeProfile.logoUrl} alt="Store" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Revenue" value={`₦${(totalRevenue/1000).toFixed(0)}k`} icon={Icons.Wallet} color="text-emerald-400" bg="bg-emerald-500/10" />
                                <StatCard label="Active Listings" value={activeListings.toString()} icon={Icons.Package} color="text-indigo-400" bg="bg-indigo-500/10" />
                                <StatCard label="Orders Pending" value={pendingOrders.toString()} icon={Icons.Cart} color="text-amber-400" bg="bg-amber-500/10" />
                                <StatCard label="Trust Rating" value="A" icon={Icons.Shield} color="text-teal-400" bg="bg-teal-500/10" sub="98% Score" />
                            </div>
                            
                            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Icons.Sparkles className="w-32 h-32 text-indigo-400" /></div>
                                <div className="flex gap-4 items-start relative z-10">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30"><Icons.Sparkles className="w-6 h-6 text-indigo-400" /></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{insight?.headline || "AI Market Insight"}</h3>
                                        <p className="text-slate-300 text-sm max-w-2xl mb-4">{insight?.content || "Analyzing market trends..."}</p>
                                        {insight?.actionableTip && (
                                            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                                <Icons.Alert className="w-3 h-3" /> TIP: {insight.actionableTip}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* INVENTORY */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <div className="relative w-64">
                                    <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <input type="text" placeholder="Search inventory..." className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                                </div>
                                <Button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-500"><Icons.Plus className="w-4 h-4 mr-2" /> Add Gadget</Button>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950/50 text-slate-500 font-medium border-b border-slate-800">
                                        <tr><th className="px-6 py-4">Product</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Trust Grade</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {myProducts.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-800/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={p.image} className="w-10 h-10 rounded bg-slate-800 object-cover" />
                                                        <div><p className="font-medium text-white">{p.name}</p><p className="text-xs text-slate-500">{p.sku}</p></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-white">₦{p.price.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    {simulatingScan === p.id ? (
                                                        <span className="text-indigo-400 text-xs animate-pulse flex items-center gap-1"><Icons.Sparkles className="w-3 h-3" /> Scanning...</span>
                                                    ) : (
                                                        <span className={`flex items-center gap-1.5 ${p.isVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                            <Icons.Shield className="w-4 h-4" /> {p.isVerified ? p.condition : 'Unverified'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {!p.isVerified && <button onClick={() => handleRunTrustScan(p.id)} className="p-2 hover:bg-slate-700 rounded text-emerald-400"><Icons.Shield className="w-4 h-4" /></button>}
                                                        <button onClick={() => openEditModal(p)} className="p-2 hover:bg-slate-700 rounded text-indigo-400"><Icons.Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 hover:bg-slate-700 rounded text-red-400"><Icons.Trash className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {/* MODALS */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-sm w-full text-center">
                                <Icons.Warning className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-800">Cancel</Button>
                                    <Button variant="danger" onClick={() => handleDeleteProduct(deleteConfirm)} className="flex-1">Delete</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showAddModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl p-6 shadow-2xl relative">
                                <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white"><Icons.X className="w-5 h-5" /></button>
                                <h3 className="font-bold text-white text-lg mb-6">{editingProduct ? 'Edit Gadget' : 'Add New Gadget'}</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/3 space-y-3">
                                        <div 
                                            className="aspect-square bg-slate-950 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center relative overflow-hidden group cursor-pointer"
                                            onClick={() => fileRef.current?.click()}
                                        >
                                            {formImage ? <img src={formImage} className="w-full h-full object-cover" /> : <Icons.Image className="w-8 h-8 text-slate-600" />}
                                            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => {
                                                const file = e.target.files?.[0];
                                                if(file) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => setFormImage(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                        </div>
                                        <Button onClick={handleAiAutoFill} disabled={!formImage || aiFilling} size="sm" className="w-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            {aiFilling ? 'Analyzing...' : <><Icons.Sparkles className="w-3 h-3 mr-2" /> AI Auto-Fill</>}
                                        </Button>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <input placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="Price" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                                            <input type="number" placeholder="Stock" value={productForm.stock || ''} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button variant="secondary" onClick={closeModal} className="bg-slate-800">Cancel</Button>
                                            <Button onClick={handleSaveProduct}>Save Gadget</Button>
                                        </div>
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

const StatCard = ({ label, value, icon: Icon, color, bg, sub }: any) => (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-32 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 ${color}`}><Icon className="w-16 h-16" /></div>
        <div className="relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {sub && <p className="text-[10px] text-emerald-400 font-bold mt-1">{sub}</p>}
        </div>
    </div>
);
