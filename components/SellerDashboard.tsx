
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Settings, Bell, Search, Plus, MoreVertical, DollarSign, Users, BarChart3, AlertCircle, RefreshCw, Upload, X, Check, Loader2, Sparkles, Image as ImageIcon, Wallet, CreditCard, ChevronRight, Truck, MapPin, Printer, Tag, Store as StoreIcon, Filter, Copy, Download } from 'lucide-react';
import { Product, Order, AiSellerInsight, OrderStatus, Promotion, StoreProfile } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { generateSellerInsights, generateListingDetails } from '../services/geminiService';
import { Button } from './Button';

interface SellerDashboardProps {
    onBackToHome: () => void;
    orders: Order[];
    notify: (type: 'success' | 'error' | 'info', message: string) => void;
    onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ onBackToHome, orders, notify, onUpdateOrderStatus }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'analytics' | 'wallet' | 'promotions' | 'settings'>('overview');
    const [insight, setInsight] = useState<AiSellerInsight | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);
    
    // --- Enhanced State Management ---
    const [storeProfile, setStoreProfile] = useState<StoreProfile>({
        storeName: "Emeka Gadgets Pro",
        description: "Your #1 plug for UK used iPhones and Laptops in Ikeja.",
        logoUrl: "",
        bannerUrl: "",
        contactEmail: "emeka@techswap.ng",
        pickupAddress: "Suite 12, Computer Village, Ikeja, Lagos"
    });

    const [promotions, setPromotions] = useState<Promotion[]>([
        { id: '1', code: 'WELCOME10', discountType: 'percentage', value: 10, usageCount: 45, status: 'active' },
        { id: '2', code: 'FLASH5000', discountType: 'fixed', value: 5000, usageCount: 12, status: 'expired' }
    ]);

    // Inventory State with extended fields
    const [myProducts, setMyProducts] = useState<Product[]>(MOCK_PRODUCTS.slice(0, 5).map(p => ({
        ...p,
        stock: Math.floor(Math.random() * 10) + 1,
        sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'active'
    })));
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'low_stock'>('all');

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // New Listing Form State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [newProductImage, setNewProductImage] = useState<string | null>(null);
    const [newProductForm, setNewProductForm] = useState({
        name: '',
        price: '',
        stock: '1',
        category: 'Phone',
        condition: 'Good',
        description: '',
        sku: ''
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Metrics Calculation
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 1250000); 
    const availableBalance = totalRevenue * 0.85; 
    const pendingBalance = totalRevenue * 0.15;
    const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
    const pendingShipmentCount = orders.filter(o => o.status === 'processing' || o.status === 'pickup_scheduled').length;

    useEffect(() => {
        const fetchInsight = async () => {
            setLoadingInsight(true);
            const data = await generateSellerInsights({ revenue: totalRevenue, inventoryCount: myProducts.length });
            setInsight(data);
            setLoadingInsight(false);
        };
        fetchInsight();
    }, [totalRevenue, myProducts.length]);

    // --- Handlers ---

    const handlePrintInvoice = (order: Order) => {
        const invoiceWindow = window.open('', 'PRINT', 'height=600,width=800');
        if (invoiceWindow) {
            invoiceWindow.document.write(`
                <html>
                <head>
                    <title>Invoice #${order.id.slice(0,8)}</title>
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
                        .meta { text-align: right; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; background: #f9fafb; }
                        td { padding: 10px; border-bottom: 1px solid #eee; }
                        .total { text-align: right; font-size: 20px; font-weight: bold; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="logo">${storeProfile.storeName}</div>
                            <div>${storeProfile.pickupAddress}</div>
                            <div>${storeProfile.contactEmail}</div>
                        </div>
                        <div class="meta">
                            <h1>INVOICE</h1>
                            <p>Order: #${order.id.slice(0,8)}</p>
                            <p>Date: ${order.date}</p>
                            <p>Status: ${order.status.toUpperCase()}</p>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.product.name} <br/><small>${item.product.condition}</small></td>
                                    <td>1</td>
                                    <td>₦${item.product.price.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Total Paid: ₦${order.totalAmount.toLocaleString()}
                    </div>
                    <div class="footer">
                        Thank you for your business. For support, contact support@techswap.ng
                    </div>
                </body>
                </html>
            `);
            invoiceWindow.document.close();
            invoiceWindow.focus();
            invoiceWindow.print();
            invoiceWindow.close();
            notify('success', 'Invoice generated');
        }
    };

    const handleCreatePromotion = () => {
        const code = `PROMO${Math.floor(Math.random() * 1000)}`;
        setPromotions([...promotions, {
            id: Date.now().toString(),
            code,
            discountType: 'percentage',
            value: 10,
            usageCount: 0,
            status: 'active'
        }]);
        notify('success', `Coupon ${code} created!`);
    };

    const handlePublishProduct = () => {
        const newProduct: Product = {
            id: Date.now().toString(),
            name: newProductForm.name,
            price: parseFloat(newProductForm.price) || 0,
            category: newProductForm.category as any,
            condition: newProductForm.condition as any,
            description: newProductForm.description,
            image: newProductImage || 'https://via.placeholder.com/400',
            location: storeProfile.pickupAddress,
            sellerId: 'current_seller',
            sellerName: storeProfile.storeName,
            sellerReputation: 5.0,
            stock: parseInt(newProductForm.stock) || 1,
            sku: newProductForm.sku || `SKU-${Date.now().toString().slice(-6)}`,
            status: 'active'
        };
        setMyProducts([newProduct, ...myProducts]);
        setShowAddModal(false);
        setNewProductImage(null);
        setNewProductForm({ name: '', price: '', stock: '1', category: 'Phone', condition: 'Good', description: '', sku: '' });
        notify('success', `${newProduct.name} listed successfully!`);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewProductImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAiAutoFill = async () => {
        if (!newProductImage) return;
        setIsAnalyzing(true);
        const base64 = newProductImage.split(',')[1];
        try {
            const details = await generateListingDetails(base64);
            setNewProductForm(prev => ({
                ...prev,
                name: details.name,
                price: details.price.toString(),
                category: details.category,
                condition: details.condition,
                description: details.description
            }));
            notify('success', 'AI details populated!');
        } catch (e) {
            notify('error', 'AI analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- Components ---

    const NavItem = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <Icon className="w-5 h-5" />
            {label}
            {id === 'orders' && activeOrdersCount > 0 && (
                 <span className="ml-auto bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeOrdersCount}</span>
            )}
        </button>
    );

    // Filter Logic
    const filteredInventory = myProducts.filter(p => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') return p.status === 'active';
        if (filterStatus === 'draft') return p.status === 'draft';
        if (filterStatus === 'low_stock') return p.stock < 3;
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-6 flex flex-col bg-slate-900/50 backdrop-blur-xl fixed h-full z-20 md:relative hidden md:flex">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">TS</div>
                    <span className="font-bold text-xl tracking-tight">Seller Pro</span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                    <NavItem id="overview" label="Overview" icon={LayoutDashboard} />
                    <NavItem id="orders" label="Orders" icon={ShoppingCart} />
                    <NavItem id="inventory" label="Inventory" icon={Package} />
                    <NavItem id="wallet" label="Wallet" icon={Wallet} />
                    <NavItem id="promotions" label="Promotions" icon={Tag} />
                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <NavItem id="analytics" label="Analytics" icon={BarChart3} />
                        <NavItem id="settings" label="Store Settings" icon={StoreIcon} />
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">EO</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{storeProfile.storeName}</p>
                            <p className="text-xs text-slate-400">Verified Merchant</p>
                        </div>
                    </div>
                    <button onClick={onBackToHome} className="w-full text-xs text-slate-400 hover:text-red-400 text-left flex items-center gap-2 transition-colors">
                        <Settings className="w-3 h-3" /> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative bg-slate-950">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
                    <h2 className="font-bold text-lg capitalize flex items-center gap-2">
                        {activeTab === 'overview' && <LayoutDashboard className="w-5 h-5 text-indigo-500" />}
                        {activeTab === 'inventory' && <Package className="w-5 h-5 text-emerald-500" />}
                        {activeTab === 'orders' && <ShoppingCart className="w-5 h-5 text-teal-500" />}
                        {activeTab === 'wallet' && <Wallet className="w-5 h-5 text-amber-500" />}
                        {activeTab === 'promotions' && <Tag className="w-5 h-5 text-pink-500" />}
                        {activeTab === 'settings' && <StoreIcon className="w-5 h-5 text-blue-500" />}
                        {activeTab.replace('-', ' ')}
                    </h2>
                    <div className="flex items-center gap-4">
                         <div className="text-xs text-slate-500 hidden sm:block">
                             {storeProfile.pickupAddress}
                         </div>
                        <button className="p-2 text-slate-400 hover:text-white relative bg-slate-900 rounded-full border border-slate-800">
                            <Bell className="w-5 h-5" />
                            {activeOrdersCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                            )}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                    
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Wallet className="w-24 h-24 transform rotate-12" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium mb-2">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-white">₦{(totalRevenue / 1000).toFixed(0)}k</h3>
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2 font-bold">
                                        <TrendingUp className="w-3 h-3" /> +12% this week
                                    </div>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                    <p className="text-slate-400 text-sm font-medium mb-2">Pending Orders</p>
                                    <h3 className="text-3xl font-bold text-white">{activeOrdersCount}</h3>
                                    <p className="text-xs text-indigo-400 mt-2 font-bold">Needs Attention</p>
                                </div>
                                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                                    <p className="text-slate-400 text-sm font-medium mb-2">Total Stock</p>
                                    <h3 className="text-3xl font-bold text-white">{myProducts.reduce((a,b) => a + b.stock, 0)}</h3>
                                    <p className="text-xs text-slate-400 mt-2">Across {myProducts.length} SKUs</p>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl border border-white/10 text-white shadow-lg">
                                    <p className="text-indigo-100 text-sm font-medium mb-2">Store Health</p>
                                    <h3 className="text-3xl font-bold">Excellent</h3>
                                    <div className="flex items-center gap-1 text-indigo-100 text-xs mt-2 font-bold opacity-80">
                                        Top 5% of Sellers
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                        <Sparkles className={`w-6 h-6 text-indigo-400 ${loadingInsight ? 'animate-pulse' : ''}`} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">
                                            {loadingInsight ? 'AI Analyzing...' : insight?.headline || 'AI Business Insight'}
                                        </h4>
                                        <p className="text-slate-400 text-sm max-w-3xl leading-relaxed mb-4">
                                            {loadingInsight ? 'Calculating market trends...' : insight?.content}
                                        </p>
                                        {!loadingInsight && insight && (
                                            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg text-indigo-300 text-sm font-medium">
                                                <AlertCircle className="w-4 h-4" /> Tip: {insight.actionableTip}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* PROMOTIONS TAB */}
                    {activeTab === 'promotions' && (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden animate-in fade-in">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Marketing Hub</h3>
                                    <p className="text-slate-500 text-sm">Create coupons and track performance</p>
                                </div>
                                <Button onClick={handleCreatePromotion} className="gap-2 bg-pink-600 hover:bg-pink-500">
                                    <Plus className="w-4 h-4" /> Create Coupon
                                </Button>
                            </div>
                            <div className="p-6 grid gap-4">
                                {promotions.map(promo => (
                                    <div key={promo.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-pink-500/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${promo.status === 'active' ? 'bg-pink-500/10 text-pink-500' : 'bg-slate-800 text-slate-500'}`}>
                                                <Tag className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{promo.code}</h4>
                                                <p className="text-slate-400 text-sm">
                                                    {promo.discountType === 'percentage' ? `${promo.value}% Off` : `₦${promo.value} Off`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold">{promo.usageCount} Used</p>
                                            <span className={`text-xs px-2 py-0.5 rounded ${promo.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                {promo.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="md:col-span-2 space-y-6">
                                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                    <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                                        <StoreIcon className="w-5 h-5 text-blue-500" /> Store Profile
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-1">Store Name</label>
                                            <input type="text" value={storeProfile.storeName} onChange={e => setStoreProfile({...storeProfile, storeName: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-1">Description</label>
                                            <textarea value={storeProfile.description} onChange={e => setStoreProfile({...storeProfile, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 h-24" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-1">Contact Email</label>
                                                <input type="email" value={storeProfile.contactEmail} onChange={e => setStoreProfile({...storeProfile, contactEmail: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-1">Pickup Address (Logistics)</label>
                                                <input type="text" value={storeProfile.pickupAddress} onChange={e => setStoreProfile({...storeProfile, pickupAddress: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <Button className="bg-blue-600 hover:bg-blue-500">Save Changes</Button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             <div className="space-y-6">
                                 <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                                     <h3 className="font-bold text-white mb-4">Branding</h3>
                                     <div className="space-y-4">
                                         <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer">
                                             <Upload className="w-8 h-8 mb-2" />
                                             <span className="text-xs">Upload Logo</span>
                                         </div>
                                         <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer h-32">
                                             <Upload className="w-8 h-8 mb-2" />
                                             <span className="text-xs">Upload Banner</span>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    )}

                    {/* INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                         <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden animate-in fade-in">
                            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/50">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Inventory Manager</h3>
                                    <p className="text-slate-500 text-sm">Track stock, edit prices, and manage SKUs</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                        <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 text-xs rounded font-medium ${filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>All</button>
                                        <button onClick={() => setFilterStatus('active')} className={`px-3 py-1.5 text-xs rounded font-medium ${filterStatus === 'active' ? 'bg-emerald-900/30 text-emerald-400' : 'text-slate-400'}`}>Active</button>
                                        <button onClick={() => setFilterStatus('low_stock')} className={`px-3 py-1.5 text-xs rounded font-medium ${filterStatus === 'low_stock' ? 'bg-amber-900/30 text-amber-400' : 'text-slate-400'}`}>Low Stock</button>
                                    </div>
                                    <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-sm px-3"> 
                                        <Plus className="w-4 h-4" /> Add Item
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">SKU</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredInventory.map(product => (
                                            <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.image} className="w-10 h-10 rounded bg-slate-800 object-cover" alt="" />
                                                        <div>
                                                            <p className="font-bold text-white">{product.name}</p>
                                                            <p className="text-xs">{product.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">{product.sku}</td>
                                                <td className="px-6 py-4">
                                                    {product.stock < 3 ? (
                                                        <span className="text-amber-500 font-bold flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" /> {product.stock}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300">{product.stock}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === product.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-20 bg-slate-800 border border-slate-600 rounded p-1 text-white text-xs" />
                                                            <button onClick={() => { /* Logic to update price in parent */ setEditingId(null); notify('success', 'Price Updated'); }} className="text-green-500"><Check className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <span onClick={() => { setEditingId(product.id); setEditPrice(product.price.toString()); }} className="text-white hover:text-indigo-400 cursor-pointer border-b border-dashed border-slate-700 pb-0.5">
                                                            ₦{product.price.toLocaleString()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                                                        {product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden animate-in fade-in">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                                <div>
                                    <h3 className="font-bold text-white text-lg">Order Management</h3>
                                    <p className="text-slate-500 text-sm">Fulfillment, invoicing, and logistics</p>
                                </div>
                            </div>
                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-white">No Orders Yet</h3>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Items</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                                <td className="px-6 py-4 font-mono text-xs">#{order.id.slice(0,6)}</td>
                                                <td className="px-6 py-4 text-white">
                                                    {order.items[0].product.name}
                                                    {order.items.length > 1 && <span className="text-slate-500 text-xs ml-1">+{order.items.length-1} more</span>}
                                                </td>
                                                <td className="px-6 py-4">Chinedu Tech</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                                                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                        order.status === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                    }`}>
                                                        {order.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-bold">₦{order.totalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handlePrintInvoice(order)}
                                                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white border border-slate-700" 
                                                            title="Print Invoice"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    
                    {/* WALLET TAB (Simplified for brevity as focused on updates above) */}
                    {activeTab === 'wallet' && (
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center">
                            <Wallet className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white">Wallet System</h3>
                            <p className="text-slate-500">Total Balance: ₦{totalRevenue.toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* ADD PRODUCT MODAL (Enhanced) */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                <h3 className="font-bold text-white">Add New Inventory</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                                <div className="flex gap-4 items-start">
                                    <div 
                                        onClick={() => !newProductImage && fileInputRef.current?.click()}
                                        className="w-32 h-32 border-2 border-dashed border-slate-700 bg-slate-950/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 shrink-0 relative overflow-hidden group"
                                    >
                                        {newProductImage ? (
                                            <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-slate-500" />
                                        )}
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <input 
                                            type="text" 
                                            placeholder="Product Name (e.g. MacBook Pro M1)" 
                                            value={newProductForm.name}
                                            onChange={e => setNewProductForm({...newProductForm, name: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input 
                                                type="number" 
                                                placeholder="Price (₦)" 
                                                value={newProductForm.price}
                                                onChange={e => setNewProductForm({...newProductForm, price: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                            />
                                            <input 
                                                type="number" 
                                                placeholder="Stock Qty" 
                                                value={newProductForm.stock}
                                                onChange={e => setNewProductForm({...newProductForm, stock: e.target.value})}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {newProductImage && (
                                    <button onClick={handleAiAutoFill} disabled={isAnalyzing} className="text-sm text-indigo-400 flex items-center gap-1 hover:text-indigo-300">
                                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Auto-fill details with AI
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <select 
                                        value={newProductForm.category}
                                        onChange={e => setNewProductForm({...newProductForm, category: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    >
                                        <option>Phone</option><option>Laptop</option><option>Audio</option><option>Gaming</option>
                                    </select>
                                    <select 
                                        value={newProductForm.condition}
                                        onChange={e => setNewProductForm({...newProductForm, condition: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    >
                                        <option>Mint</option><option>Good</option><option>Fair</option>
                                    </select>
                                </div>

                                <textarea 
                                    rows={3}
                                    value={newProductForm.description}
                                    onChange={e => setNewProductForm({...newProductForm, description: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    placeholder="Detailed description..."
                                />
                            </div>

                            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="bg-slate-800 hover:bg-slate-700 text-white border-0">Cancel</Button>
                                <Button onClick={handlePublishProduct} disabled={!newProductForm.name}>Publish</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ORDER DETAIL DRAWER */}
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                        <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Order #{selectedOrder.id.slice(0,6)}</h3>
                                    <p className="text-slate-500 text-sm">{selectedOrder.date}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Customer Info */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Customer Details</h4>
                                    <p className="text-slate-300 font-medium">Chinedu Tech</p>
                                    <p className="text-slate-500 text-sm">{storeProfile.pickupAddress} (Delivery Loc)</p>
                                    <div className="mt-2 flex gap-2">
                                        <button className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">Email</button>
                                        <button className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">Call</button>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-indigo-400" /> Items</h4>
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 mb-3 last:mb-0">
                                            <img src={item.product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-900" alt="" />
                                            <div>
                                                <p className="text-white text-sm font-medium">{item.product.name}</p>
                                                <p className="text-slate-500 text-xs">SKU: {item.product.sku || 'N/A'} • ₦{item.product.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between text-sm">
                                        <span className="text-slate-400">Total</span>
                                        <span className="font-bold text-white">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button 
                                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500"
                                        onClick={() => {
                                            const nextStatus = selectedOrder.status === 'processing' ? 'pickup_scheduled' : 'out_for_delivery';
                                            onUpdateOrderStatus(selectedOrder.id, nextStatus);
                                            setSelectedOrder({...selectedOrder, status: nextStatus});
                                            notify('success', `Order moved to ${nextStatus}`);
                                        }}
                                    >
                                        <Truck className="w-4 h-4" /> Advance Order Status
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full gap-2 bg-slate-800 text-white border-0 hover:bg-slate-700"
                                        onClick={() => handlePrintInvoice(selectedOrder)}
                                    >
                                        <Printer className="w-4 h-4" /> Print Invoice / Receipt
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
