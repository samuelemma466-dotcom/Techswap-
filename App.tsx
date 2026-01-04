
import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Button } from './components/Button';
import { SwapModal } from './components/SwapModal';
import { NegotiationChat } from './components/NegotiationChat';
import { DeliveryCalculator } from './components/DeliveryCalculator';
import { UserProfile } from './components/UserProfile';
import { TechSwapGuide } from './components/TechSwapGuide';
import { ProductDetails } from './components/ProductDetails';
import { LandingPage } from './components/LandingPage';
import { SellerDashboard } from './components/SellerDashboard';
import { ToastContainer } from './components/ToastContainer';
import { MOCK_PRODUCTS, MOCK_USER_HISTORY } from './constants';
import { Product, ViewState, Order, UserRole, ComparisonResult, ToastNotification, OrderStatus } from './types';
import { semanticSearchProducts, compareProducts, getPersonalizedRecommendations, visualSearchProducts, getMarketBadges } from './services/geminiService';
import { Plus, Tag, RefreshCcw, MapPin, DollarSign, CheckCircle, Search, Trash2, Upload, X, Sparkles, Loader2, Filter, Scale, Trophy, Bot, Star, Camera } from 'lucide-react';

// Utility for Fuzzy Search
const getLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
};

const App: React.FC = () => {
  // State for User Role & View
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  // Market/Buyer State
  const [activeSwapProduct, setActiveSwapProduct] = useState<Product | null>(null);
  const [activeNegotiationProduct, setActiveNegotiationProduct] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [cart, setCart] = useState<{product: Product, price: number, isSwap: boolean, deliveryFee?: number}[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // AI & Search State
  const [isAiSearchMode, setIsAiSearchMode] = useState(false);
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);
  const [isVisualSearching, setIsVisualSearching] = useState(false);
  const visualSearchInputRef = useRef<HTMLInputElement>(null);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [productBadges, setProductBadges] = useState<Record<string, string>>({});

  // Comparison State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load recommendations on mount if role is buyer
  useEffect(() => {
    if (userRole === 'buyer') {
        const initData = async () => {
            setLoadingRecommendations(true);
            const [recIds, badges] = await Promise.all([
                getPersonalizedRecommendations(MOCK_USER_HISTORY, MOCK_PRODUCTS),
                getMarketBadges(MOCK_PRODUCTS)
            ]);
            setRecommendedIds(recIds);
            setProductBadges(badges);
            setLoadingRecommendations(false);
        };
        initData();
    }
  }, [userRole]);

  // --- Handlers ---

  const handleRoleSelection = (role: 'buyer' | 'seller') => {
      setUserRole(role);
      setCurrentView(role === 'buyer' ? 'market' : 'dashboard-overview');
      addToast('success', `Welcome to TechSwap ${role === 'buyer' ? 'Market' : 'Dashboard'}`);
  };

  const handleLogout = () => {
      setUserRole('guest');
      setCurrentView('landing');
      setCart([]);
      addToast('info', "Logged out successfully");
  };

  const handleSearch = async () => {
    if (isAiSearchMode && searchTerm.trim().length > 2) {
        setIsSearchingAi(true);
        const ids = await semanticSearchProducts(searchTerm, MOCK_PRODUCTS);
        setAiSearchResults(ids);
        setIsSearchingAi(false);
    } else {
        setAiSearchResults(null);
    }
  };

  const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVisualSearching(true);
    setSearchTerm("Analyzing image...");
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const ids = await visualSearchProducts(base64, MOCK_PRODUCTS);
        setAiSearchResults(ids);
        setIsAiSearchMode(true);
        setSearchTerm("📸 Visual Search Results");
        setIsVisualSearching(false);
        addToast('success', 'Visual search complete');
    };
    reader.readAsDataURL(file);
  };

  // Filter Logic
  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    if (isAiSearchMode && aiSearchResults) return aiSearchResults.includes(p.id);
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (!searchTerm || isAiSearchMode) return true;
    
    const term = searchTerm.toLowerCase();
    const name = p.name.toLowerCase();
    const desc = p.description.toLowerCase();
    
    if (name.includes(term) || desc.includes(term)) return true;
    if (term.length > 2) {
        const words = name.split(' ');
        return words.some(word => Math.abs(word.length - term.length) <= 2 && getLevenshteinDistance(word, term) <= 2);
    }
    return false;
  }).sort((a, b) => {
     if (isAiSearchMode && aiSearchResults) return aiSearchResults.indexOf(a.id) - aiSearchResults.indexOf(b.id);
     return 0;
  });

  // Comparison Logic
  const toggleCompare = (productId: string) => {
      setSelectedForCompare(prev => {
          if (prev.includes(productId)) {
            return prev.filter(id => id !== productId);
          }
          if (prev.length >= 2) {
            addToast('info', 'Comparison replaced with new item');
            return [prev[1], productId];
          }
          return [...prev, productId];
      });
  };

  const runComparison = async () => {
      if (selectedForCompare.length !== 2) return;
      setIsComparing(true);
      setShowComparisonModal(true);
      const p1 = MOCK_PRODUCTS.find(p => p.id === selectedForCompare[0]);
      const p2 = MOCK_PRODUCTS.find(p => p.id === selectedForCompare[1]);
      if (p1 && p2) setComparisonResult(await compareProducts(p1, p2));
      setIsComparing(false);
  };

  // Cart Logic
  const handleAddToCart = (product: Product, finalPrice: number, isSwap: boolean = false) => {
    setCart([...cart, { product, price: finalPrice, isSwap }]);
    setActiveSwapProduct(null);
    setActiveNegotiationProduct(null);
    setSelectedProductDetails(null);
    if(currentView === 'sell') setCurrentView('market'); // Return to market after sell initiation
    addToast('success', 'Item added to cart');
  };

  const handleCheckout = () => {
    addToast('info', 'Processing payment...');
    setTimeout(() => {
        const newOrder: Order = {
            id: Date.now().toString(),
            items: cart.map(c => ({ product: c.product, isSwap: c.isSwap })),
            totalAmount: cart.reduce((acc, c) => acc + c.price + (c.deliveryFee || 0), 0),
            date: new Date().toLocaleDateString(),
            status: 'processing', // Initial status
            estimatedArrival: '3-5 Days',
            trackingSteps: [
                { status: 'processing', label: 'Order Placed', completed: true, timestamp: new Date().toLocaleTimeString() },
                { status: 'pickup_scheduled', label: 'Ready for Courier', completed: false },
                { status: 'in_transit_to_hub', label: 'In Transit', completed: false },
                { status: 'at_hub_verification', label: 'Hub Verification', completed: false },
                { status: 'verified', label: 'Verified', completed: false },
                { status: 'out_for_delivery', label: 'Out for Delivery', completed: false },
                { status: 'delivered', label: 'Delivered', completed: false }
            ]
        };
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        addToast('success', 'Order Placed Successfully!');
        setCurrentView('profile');
    }, 1500);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
     setOrders(prev => prev.map(order => {
         if (order.id !== orderId) return order;
         
         const stepIndexMap: Record<OrderStatus, number> = {
            'processing': 0,
            'pickup_scheduled': 1,
            'in_transit_to_hub': 2,
            'at_hub_verification': 3,
            'verified': 4,
            'out_for_delivery': 5,
            'delivered': 6
         };

         const targetIndex = stepIndexMap[newStatus];
         
         const updatedSteps = order.trackingSteps.map((step, idx) => ({
             ...step,
             completed: idx <= targetIndex,
             timestamp: idx === targetIndex ? new Date().toLocaleTimeString() : step.timestamp
         }));

         return { ...order, status: newStatus, trackingSteps: updatedSteps };
     }));
     addToast('success', 'Order status updated successfully');
  };

  // --- RENDER LOGIC ---

  // 1. Landing Page
  if (userRole === 'guest' || currentView === 'landing') {
      return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <LandingPage onSelectRole={handleRoleSelection} />
        </>
      );
  }

  // 2. Seller Dashboard
  if (userRole === 'seller') {
      return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <SellerDashboard 
                onBackToHome={handleLogout}
                orders={orders}
                notify={addToast}
                onUpdateOrderStatus={handleUpdateOrderStatus}
            />
        </>
      );
  }

  // 3. Buyer Layout (Marketplace)
  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-slate-900 to-black text-slate-100 font-sans pb-20 selection:bg-green-500 selection:text-white">
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Buyer Navbar with Logout */}
      <Navbar 
          currentView={currentView} 
          setView={setCurrentView} 
          cartCount={cart.length} 
          onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        
        {/* MARKET VIEW */}
        {currentView === 'market' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">TechSwap NG</h1>
                  <p className="text-slate-400 mt-1">Certified used gadgets. Best prices in Nigeria.</p>
               </div>
               
               <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-end md:items-center">
                   <div className="relative min-w-[160px]">
                      <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent backdrop-blur-sm appearance-none cursor-pointer hover:bg-slate-800"
                      >
                        <option value="All">All Categories</option>
                        <option value="Phone">Phones</option>
                        <option value="Laptop">Laptops</option>
                        <option value="Tablet">Tablets</option>
                        <option value="Watch">Watches</option>
                        <option value="Gaming">Gaming</option>
                      </select>
                   </div>

                   <div className="relative w-full md:w-96 group flex gap-2">
                      <div className="relative flex-1">
                        <div className={`absolute -inset-0.5 rounded-xl blur opacity-25 transition duration-1000 ${isAiSearchMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 opacity-50' : 'bg-gradient-to-r from-green-500 to-teal-500'}`}></div>
                        <div className="relative">
                            {isAiSearchMode ? (
                                <Sparkles className="absolute left-3 top-3 w-5 h-5 text-purple-400 animate-pulse" />
                            ) : (
                                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            )}
                            <input 
                                type="text" 
                                placeholder={isAiSearchMode ? "Ask AI: 'Cheap UK Used iPhone under 300k'..." : "Search devices..."} 
                                className={`w-full pl-10 pr-24 py-2.5 rounded-xl border text-white focus:ring-2 focus:outline-none focus:border-transparent backdrop-blur-sm transition-all ${isAiSearchMode ? 'bg-purple-900/40 border-purple-500/50 focus:ring-purple-500 placeholder-purple-300' : 'bg-slate-800/80 border-slate-700 placeholder-slate-400 focus:ring-green-500'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute right-2 top-1.5 flex gap-1">
                                <button 
                                    onClick={() => visualSearchInputRef.current?.click()}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                    {isVisualSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                </button>
                                <input type="file" ref={visualSearchInputRef} className="hidden" accept="image/*" onChange={handleVisualSearch} />
                                <button 
                                    onClick={() => { setIsAiSearchMode(!isAiSearchMode); setAiSearchResults(null); }}
                                    className={`p-1.5 rounded-lg transition-all ${isAiSearchMode ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                      </div>
                      
                      {isAiSearchMode && (
                          <Button onClick={handleSearch} disabled={isSearchingAi || searchTerm.length < 3} className="bg-purple-600 hover:bg-purple-700">
                              {isSearchingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
                          </Button>
                      )}
                   </div>
               </div>
            </div>

            {/* Recommendations (Only on clean search) */}
            {!searchTerm && selectedCategory === 'All' && !isAiSearchMode && (
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-white/5 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" /> 
                        Recommended for You
                    </h3>
                    
                    {loadingRecommendations ? (
                        <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                             <Loader2 className="w-5 h-5 animate-spin" /> AI is personalizing your feed...
                        </div>
                    ) : recommendedIds.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_PRODUCTS.filter(p => recommendedIds.includes(p.id)).map(product => (
                                <div 
                                  key={product.id} 
                                  onClick={() => setSelectedProductDetails(product)}
                                  className="bg-white/10 rounded-xl p-4 flex gap-4 hover:bg-white/15 transition-colors cursor-pointer border border-white/5"
                                >
                                    <img src={product.image} className="w-20 h-20 object-cover rounded-lg" alt={product.name} />
                                    <div>
                                        <div className="text-xs font-bold text-green-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-green-300" /> Best Match
                                        </div>
                                        <h4 className="font-bold text-white">{product.name}</h4>
                                        <p className="text-green-300 font-bold">₦{product.price.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400">Browse more items to see personalized recommendations!</p>
                    )}
                </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white">No matches found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <div 
                        key={product.id} 
                        onClick={() => setSelectedProductDetails(product)}
                        className={`bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border relative cursor-pointer ${selectedForCompare.includes(product.id) ? 'ring-2 ring-green-500 border-green-500 transform scale-[1.02]' : 'border-white/5 hover:shadow-green-500/10'}`}
                    >
                    
                    {productBadges[product.id] && (
                        <div className="absolute top-3 left-3 z-10">
                            <span className="bg-amber-400 text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                                <Tag className="w-3 h-3" /> {productBadges[product.id]}
                            </span>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${selectedForCompare.includes(product.id) ? 'bg-green-600 text-white shadow-lg' : 'bg-white/30 text-slate-800 hover:bg-white'}`}
                        >
                            <Scale className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative h-64 overflow-hidden bg-slate-100">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold text-slate-900 shadow-sm">
                            {product.condition}
                        </div>
                    </div>
                    
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{product.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> {product.location}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="block text-xl font-bold text-green-600">₦{product.price.toLocaleString()}</span>
                        </div>
                        </div>
                        
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button 
                            variant="secondary" 
                            onClick={(e) => { e.stopPropagation(); setActiveSwapProduct(product); }}
                            className="flex items-center justify-center text-sm"
                        >
                            <RefreshCcw className="w-4 h-4 mr-1.5" /> Swap
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product, product.price); }}
                            className="flex items-center justify-center text-sm"
                        >
                            Buy Now
                        </Button>
                        </div>
                        
                        <div className="mt-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setActiveNegotiationProduct(product); }}
                            className="w-full py-2 text-xs font-medium text-slate-500 hover:text-green-600 transition-colors flex items-center justify-center gap-1"
                        >
                            <DollarSign className="w-3 h-3" /> Negotiate
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        )}

        {/* CART VIEW */}
        {currentView === 'cart' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
             <h1 className="text-3xl font-bold mb-8 text-white">Your Cart</h1>
             {cart.length === 0 ? (
               <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                 <p className="text-slate-400 mb-4">Your cart is empty.</p>
                 <Button onClick={() => setCurrentView('market')}>Continue Shopping</Button>
               </div>
             ) : (
               <div className="grid md:grid-cols-3 gap-8">
                 <div className="md:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex flex-col gap-4 relative">
                        <button 
                            onClick={() => setCart(prev => prev.filter((_, i) => i !== index))}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex gap-4">
                            <img src={item.product.image} className="w-24 h-24 object-cover rounded-lg" alt={item.product.name} />
                            <div className="flex-1 pr-8">
                                <h3 className="font-bold text-lg text-slate-900">{item.product.name}</h3>
                                <div className="mt-2 font-bold text-xl text-slate-900">₦{item.price.toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-3">
                            <DeliveryCalculator 
                                sellerLocation={item.product.location} 
                                onFeeCalculated={(fee) => {
                                    setCart(prev => {
                                        const newCart = [...prev];
                                        newCart[index].deliveryFee = fee;
                                        return newCart;
                                    })
                                }} 
                            />
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 h-fit sticky top-24 text-white">
                    <h3 className="font-bold text-lg mb-4">Summary</h3>
                    <div className="space-y-2 mb-4 text-sm">
                       <div className="flex justify-between">
                         <span className="text-slate-300">Subtotal</span>
                         <span className="font-medium">₦{cart.reduce((a,c) => a + c.price, 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-slate-300">Delivery</span>
                         <span className="font-medium">₦{cart.reduce((a,c) => a + (c.deliveryFee || 0), 0).toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="border-t border-white/10 pt-4 mb-6">
                       <div className="flex justify-between font-bold text-lg">
                         <span>Total</span>
                         <span>₦{cart.reduce((a,c) => a + c.price + (c.deliveryFee || 0), 0).toLocaleString()}</span>
                       </div>
                    </div>
                    <Button onClick={handleCheckout} className="w-full bg-emerald-500 hover:bg-emerald-600 border-0">
                        Proceed to Checkout
                    </Button>
                 </div>
               </div>
             )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === 'profile' && <UserProfile orders={orders} onLogout={handleLogout} />}

      </main>

      {/* Comparison Modal */}
      {showComparisonModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                      <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-green-400" />
                          <h2 className="font-bold text-lg">AI Device Comparison</h2>
                      </div>
                      <button onClick={() => {setShowComparisonModal(false); setComparisonResult(null);}} className="p-1 hover:bg-slate-700 rounded-full">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      {isComparing || !comparisonResult ? (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                              <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
                              <p>AI is analyzing specs and value...</p>
                          </div>
                      ) : (
                          <div className="space-y-8">
                              <div className="grid grid-cols-2 gap-8 text-center">
                                  {[selectedForCompare[0], selectedForCompare[1]].map((id) => {
                                      const p = MOCK_PRODUCTS.find(i => i.id === id);
                                      if (!p) return null;
                                      const isWinner = comparisonResult.winnerId === p.id;
                                      return (
                                          <div key={id} className={`p-4 rounded-xl border ${isWinner ? 'border-green-500 bg-green-50/50' : 'border-slate-200'}`}>
                                              {isWinner && (
                                                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3">
                                                      <Trophy className="w-3 h-3" /> Best Value
                                                  </div>
                                              )}
                                              <img src={p.image} className="w-32 h-32 object-cover rounded-lg mx-auto mb-3 shadow-sm" alt={p.name} />
                                              <h3 className="font-bold text-slate-900">{p.name}</h3>
                                              <p className="text-lg font-bold text-slate-600">₦{p.price.toLocaleString()}</p>
                                          </div>
                                      )
                                  })}
                              </div>
                              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                      <Bot className="w-4 h-4 text-green-600" /> AI Summary
                                  </h4>
                                  <p className="text-slate-600 leading-relaxed text-sm">{comparisonResult.summary}</p>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Floating Compare Button */}
      {selectedForCompare.length > 0 && currentView === 'market' && (
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4">
                <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700">
                    <span className="text-sm font-medium">{selectedForCompare.length} selected</span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    {selectedForCompare.length === 2 ? (
                        <button 
                            onClick={runComparison}
                            className="flex items-center gap-2 font-bold text-green-400 hover:text-green-300 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" /> Compare with AI
                        </button>
                    ) : (
                        <span className="text-xs text-slate-400">Select 2 to compare</span>
                    )}
                    <button onClick={() => setSelectedForCompare([])} className="ml-2 hover:bg-slate-800 p-1 rounded-full">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
      )}

      {/* Handle 'Sell' view from navbar by reusing SwapModal */}
      {currentView === 'sell' && (
         <SwapModal
            targetProduct={{...MOCK_PRODUCTS[0], name: "Cash / Bank Transfer", price: 0, image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=400"}} // Dummy target for direct sell
            onClose={() => setCurrentView('market')}
            onAddToCart={(price) => {
                addToast('success', `Trade-in initiated for ₦${price.toLocaleString()}`);
                setCurrentView('market');
            }}
         />
      )}

      <TechSwapGuide products={MOCK_PRODUCTS} />

      {selectedProductDetails && (
        <ProductDetails 
            product={selectedProductDetails}
            onClose={() => setSelectedProductDetails(null)}
            onAddToCart={(price) => handleAddToCart(selectedProductDetails, price)}
            onSwap={() => {
                setActiveSwapProduct(selectedProductDetails);
                setSelectedProductDetails(null);
            }}
        />
      )}

      {activeSwapProduct && (
        <SwapModal 
          targetProduct={activeSwapProduct} 
          onClose={() => setActiveSwapProduct(null)} 
          onAddToCart={(finalPrice, isSwap) => handleAddToCart(activeSwapProduct, finalPrice, isSwap)}
        />
      )}

      {activeNegotiationProduct && (
        <NegotiationChat 
          product={activeNegotiationProduct}
          onClose={() => setActiveNegotiationProduct(null)}
          onSuccess={(finalPrice) => {
             addToast('success', `Offer accepted! Added to cart at ₦${finalPrice.toLocaleString()}`);
             handleAddToCart(activeNegotiationProduct, finalPrice);
          }}
        />
      )}
    </div>
  );
};

export default App;
