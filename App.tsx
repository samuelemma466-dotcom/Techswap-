
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthScreen } from './components/AuthScreen';
import { SellerDashboard } from './components/SellerDashboard';
import { TrustScanModal } from './components/TrustScanModal';
import { ProductDetails } from './components/ProductDetails';
import { DealSenseChat } from './components/DealSenseChat';
import { WalletView } from './components/WalletView';
import { NotificationCenter } from './components/NotificationCenter';
import { ToastContainer } from './components/ToastContainer';
import { UserProfile } from './components/UserProfile';
import { MOCK_PRODUCTS } from './constants';
import { Product, ViewState, UserRole, ToastNotification, Order, TrustScanResult } from './types';
import { ShieldCheck, Search, Filter, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [authVisible, setAuthVisible] = useState(false);
  const [pendingRole, setPendingRole] = useState<'buyer' | 'seller' | null>(null);
  
  // Market State
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [negotiatingProduct, setNegotiatingProduct] = useState<Product | null>(null);
  const [showTrustScan, setShowTrustScan] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), type, message }]);
  };

  const handleLogout = () => {
      setUserRole('guest');
      setCurrentView('landing');
      setCart([]);
  };

  const handleAddToCart = (price: number) => {
      if (selectedProduct) {
          addToast('success', `Funds secured in Escrow for ${selectedProduct.name}`);
          // Create a mock order
          const newOrder: Order = {
              id: Date.now().toString(),
              items: [{ product: selectedProduct, price }],
              totalAmount: price,
              date: new Date().toLocaleDateString(),
              status: 'escrow_locked',
              trackingSteps: [
                  { status: 'processing', label: 'Payment Secured in Escrow', completed: true, timestamp: 'Just now' },
                  { status: 'pickup_scheduled', label: 'Waiting for Seller Pickup', completed: false }
              ]
          };
          setOrders(prev => [newOrder, ...prev]);
          setCart(prev => [...prev, selectedProduct]);
          setSelectedProduct(null);
      }
  };

  const handleNegotiationSuccess = (finalPrice: number) => {
      if (negotiatingProduct) {
          setNegotiatingProduct(null);
          addToast('success', `Deal accepted at ₦${finalPrice.toLocaleString()}! Proceeding to Escrow.`);
          
          const newOrder: Order = {
              id: Date.now().toString(),
              items: [{ product: negotiatingProduct, price: finalPrice }],
              totalAmount: finalPrice,
              date: new Date().toLocaleDateString(),
              status: 'escrow_locked',
              trackingSteps: [
                  { status: 'processing', label: 'Payment Secured (Negotiated)', completed: true, timestamp: 'Just now' },
                  { status: 'pickup_scheduled', label: 'Waiting for Seller Pickup', completed: false }
              ]
          };
          setOrders(prev => [newOrder, ...prev]);
          setCart(prev => [...prev, negotiatingProduct]);
      }
  };

  const handleTrustScanVerified = (result: TrustScanResult) => {
      setShowTrustScan(false);
      addToast('success', `Device verified as ${result.conditionGrade}! Listed on marketplace.`);
      // In a real app, this would add to seller inventory
  };

  // Views Logic
  if (authVisible && pendingRole) {
      return <AuthScreen role={pendingRole} onBack={() => setAuthVisible(false)} onComplete={() => {
          setAuthVisible(false);
          setUserRole(pendingRole);
          setCurrentView(pendingRole === 'buyer' ? 'market' : 'dashboard-overview');
          addToast('success', `Welcome to GadgetTrust AI, ${pendingRole === 'buyer' ? 'Buyer' : 'Partner'}!`);
      }} />;
  }

  if (currentView === 'landing') {
      return <LandingPage onSelectRole={(role) => { setPendingRole(role); setAuthVisible(true); }} />;
  }

  if (userRole === 'seller') {
      return <SellerDashboard orders={[]} notify={addToast} onUpdateOrderStatus={() => {}} onBackToHome={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white">
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />
      <Navbar currentView={currentView} setView={setCurrentView} cartCount={cart.length} onLogout={handleLogout} userRole={userRole} />
      
      <main className="pt-24 px-4 max-w-7xl mx-auto pb-12">
        
        {/* MARKETPLACE VIEW */}
        {currentView === 'market' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
               
               {/* Header & Filters */}
               <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-slate-800 pb-6">
                   <div>
                       <h2 className="text-3xl font-bold text-white mb-2">Verified Listings</h2>
                       <p className="text-slate-400 flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                           All devices verified by TrustScan AI
                       </p>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                       <div className="relative flex-1 md:w-64">
                           <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                           <input 
                                type="text" 
                                placeholder="Search gadgets..." 
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                           />
                       </div>
                       <button className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
                           <Filter className="w-4 h-4" /> Filter
                       </button>
                   </div>
               </div>

               {/* Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {MOCK_PRODUCTS.map(product => (
                       <div 
                           key={product.id} 
                           className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300 cursor-pointer flex flex-col"
                           onClick={() => setSelectedProduct(product)}
                       >
                           <div className="relative h-48 overflow-hidden">
                               <img 
                                   src={product.image} 
                                   alt={product.name} 
                                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                               />
                               <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700">
                                   {product.condition}
                               </div>
                               {product.isVerified && (
                                   <div className="absolute bottom-2 left-2 bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                       <ShieldCheck className="w-3 h-3" /> Verified
                                   </div>
                               )}
                           </div>
                           
                           <div className="p-4 flex-1 flex flex-col">
                               <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                               <p className="text-xs text-slate-400 mb-4 line-clamp-2">{product.description}</p>
                               
                               <div className="mt-auto flex items-center justify-between">
                                   <div>
                                       <p className="text-xs text-slate-500">Escrow Price</p>
                                       <p className="text-lg font-bold text-emerald-400">₦{product.price.toLocaleString()}</p>
                                   </div>
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); setNegotiatingProduct(product); }}
                                       className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                   >
                                       Negotiate
                                   </button>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
        )}

        {/* TRUST SCAN VIEW */}
        {currentView === 'trust-scan' && (
            <div className="flex flex-col items-center justify-center py-12 animate-in fade-in">
                <div className="text-center max-w-2xl mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">TrustScan AI Verification</h1>
                    <p className="text-slate-400 text-lg">
                        Upload a photo of your device. Our AI analyzes the screen, body, and condition to generate a Trust Grade instantly.
                    </p>
                </div>
                
                <button 
                    onClick={() => setShowTrustScan(true)}
                    className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-emerald-500 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-400 hover:text-white text-white focus:ring-4 focus:outline-none focus:ring-emerald-800"
                >
                    <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-slate-900 rounded-md group-hover:bg-opacity-0 font-bold text-lg flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" /> Start Verification Scan
                    </span>
                </button>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 font-bold text-xl">1</div>
                        <h3 className="text-white font-bold mb-2">Upload Photo</h3>
                        <p className="text-slate-400 text-sm">Take a clear picture of your gadget.</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 font-bold text-xl">2</div>
                        <h3 className="text-white font-bold mb-2">AI Analysis</h3>
                        <p className="text-slate-400 text-sm">Gemini detects scratches, dents, and model.</p>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 font-bold text-xl">3</div>
                        <h3 className="text-white font-bold mb-2">Get Certificate</h3>
                        <p className="text-slate-400 text-sm">Receive a Trust Grade badge for your listing.</p>
                    </div>
                </div>
            </div>
        )}

        {/* OTHER VIEWS */}
        {currentView === 'wallet' && <WalletView />}
        {currentView === 'profile' && <UserProfile orders={orders} onLogout={handleLogout} />}
        {currentView === 'cart' && (
             <div className="max-w-4xl mx-auto">
                 <h1 className="text-3xl font-bold text-white mb-8">My Cart (Escrow)</h1>
                 {cart.length === 0 ? (
                     <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                         <ShoppingBag className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                         <p className="text-slate-500">Your escrow cart is empty.</p>
                     </div>
                 ) : (
                     <div className="space-y-4">
                         {cart.map((item, idx) => (
                             <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
                                 <img src={item.image} className="w-20 h-20 rounded-lg object-cover" />
                                 <div className="flex-1">
                                     <h3 className="font-bold text-white">{item.name}</h3>
                                     <p className="text-emerald-400 font-bold">₦{item.price.toLocaleString()}</p>
                                 </div>
                                 <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                                     <ShieldCheck className="w-3 h-3" /> Escrow Secured
                                 </div>
                             </div>
                         ))}
                         <div className="flex justify-end pt-6">
                             <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                                 Proceed to Secure Checkout
                             </button>
                         </div>
                     </div>
                 )}
             </div>
        )}

      </main>

      {/* MODALS */}
      {selectedProduct && (
          <ProductDetails 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={handleAddToCart}
            onNegotiate={() => { setSelectedProduct(null); setNegotiatingProduct(selectedProduct); }}
          />
      )}

      {negotiatingProduct && (
          <DealSenseChat 
            product={negotiatingProduct}
            onClose={() => setNegotiatingProduct(null)}
            onSuccess={handleNegotiationSuccess}
          />
      )}

      {showTrustScan && (
          <TrustScanModal 
            onClose={() => setShowTrustScan(false)}
            onVerified={handleTrustScanVerified}
          />
      )}

    </div>
  );
};

export default App;
