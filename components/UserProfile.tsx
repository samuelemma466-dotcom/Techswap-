
import React, { useState } from 'react';
import { Package, MapPin, Heart, Settings, LogOut, Truck, CreditCard, ChevronRight, User, Bell } from 'lucide-react';
import { Order, Product } from '../types';
import { Button } from './Button';
import { MOCK_PRODUCTS } from '../constants';
import { OrderTracking } from './OrderTracking';

interface UserProfileProps {
    orders: Order[];
    onLogout?: () => void;
}

const MOCK_WISHLIST = MOCK_PRODUCTS.slice(2, 4); // Simulate saved items

export const UserProfile: React.FC<UserProfileProps> = ({ orders, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-10">
      
      {/* Buyer Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 h-24"></div>
        <div className="px-8 pb-6 flex flex-col md:flex-row justify-between items-end -mt-10 gap-4">
          <div className="flex items-end gap-4">
             <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-md">
                <img 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200" 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-xl"
                />
             </div>
             <div className="mb-1">
                <h1 className="text-2xl font-bold text-slate-900">Chinedu Tech</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Lekki Phase 1, Lagos
                </p>
             </div>
          </div>
          <div className="flex gap-2">
             {onLogout && (
               <Button variant="danger" onClick={onLogout} className="text-sm h-10 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none">
                 <LogOut className="w-4 h-4 mr-2" /> Log Out
               </Button>
             )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
           <button 
             onClick={() => setActiveTab('orders')}
             className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
           >
             <Package className="w-5 h-5" /> My Orders
           </button>
           <button 
             onClick={() => setActiveTab('wishlist')}
             className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === 'wishlist' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
           >
             <Heart className="w-5 h-5" /> Saved Items
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
           >
             <Settings className="w-5 h-5" /> Account Settings
           </button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3 space-y-6">
           
           {/* Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Spent" value="₦450k" icon={CreditCard} color="bg-emerald-500" />
              <StatCard label="Orders" value={orders.length.toString()} icon={Package} color="bg-indigo-500" />
              <StatCard label="Wishlist" value={MOCK_WISHLIST.length.toString()} icon={Heart} color="bg-pink-500" />
           </div>

           {/* ORDERS TAB */}
           {activeTab === 'orders' && (
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                   <h2 className="font-bold text-lg text-slate-800">Order History</h2>
                   {orders.length > 0 && <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{orders.length} orders</span>}
                </div>
                
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                     <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Package className="w-8 h-8 text-slate-300" />
                     </div>
                     <p className="text-slate-900 font-medium">No orders yet</p>
                     <p className="text-slate-500 text-sm">Start shopping to see your purchases here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                     {orders.map(order => (
                       <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                             <div>
                                <div className="flex items-center gap-3 mb-1">
                                   <span className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</span>
                                   <span className="text-xs text-slate-500">{order.date}</span>
                                </div>
                                <p className="text-sm text-slate-500">
                                   Total: <span className="font-bold text-slate-900">₦{order.totalAmount.toLocaleString()}</span>
                                </p>
                             </div>
                             <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                   order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                }`}>
                                   <Truck className="w-3 h-3" /> {order.status.replace(/_/g, ' ')}
                                </span>
                             </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-3">
                             {order.items.map((item, idx) => (
                               <div key={idx} className="flex gap-4 items-center bg-white border border-slate-200 p-2 rounded-lg">
                                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <div className="flex-1">
                                     <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</p>
                                     <p className="text-xs text-slate-500">{item.isSwap ? 'Trade-in Swap' : 'Direct Purchase'}</p>
                                  </div>
                               </div>
                             ))}
                          </div>

                          <div className="mt-4 flex gap-3">
                             <Button onClick={() => setTrackingOrder(order)} className="flex-1 md:flex-none text-sm h-9">Track Package</Button>
                             <Button variant="outline" className="flex-1 md:flex-none text-sm h-9 border-slate-300 text-slate-600">View Invoice</Button>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
             </div>
           )}

           {/* WISHLIST TAB */}
           {activeTab === 'wishlist' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] p-6">
                 <h2 className="font-bold text-lg text-slate-800 mb-6">Saved Items</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_WISHLIST.map(product => (
                       <div key={product.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-indigo-300 transition-colors cursor-pointer group">
                          <img src={product.image} className="w-24 h-24 rounded-lg object-cover" alt={product.name} />
                          <div className="flex flex-col justify-between flex-1">
                             <div>
                                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                <p className="text-green-600 font-bold">₦{product.price.toLocaleString()}</p>
                             </div>
                             <div className="flex gap-2">
                                <Button size="sm" className="w-full text-xs">Add to Cart</Button>
                                <button className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg">
                                   <X className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* SETTINGS TAB */}
           {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-8">
                 
                 {/* Shipping Address */}
                 <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-indigo-500" /> Shipping Addresses
                    </h3>
                    <div className="border border-indigo-100 bg-indigo-50/50 p-4 rounded-xl flex justify-between items-center mb-3">
                       <div>
                          <p className="font-bold text-slate-900 text-sm">Home (Default)</p>
                          <p className="text-sm text-slate-600">15 Admiralty Way, Lekki Phase 1, Lagos</p>
                          <p className="text-xs text-slate-500 mt-1">+234 801 234 5678</p>
                       </div>
                       <Button variant="outline" className="text-xs h-8 bg-white">Edit</Button>
                    </div>
                    <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                       <Plus className="w-4 h-4" /> Add New Address
                    </button>
                 </div>

                 <div className="h-px bg-slate-100"></div>

                 {/* Notifications */}
                 <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <Bell className="w-4 h-4 text-indigo-500" /> Notifications
                    </h3>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Order Updates</span>
                          <input type="checkbox" checked className="toggle-checkbox" readOnly />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">Promotions & Deals</span>
                          <input type="checkbox" className="toggle-checkbox" readOnly />
                       </div>
                    </div>
                 </div>

                 <div className="h-px bg-slate-100"></div>

                 {/* Security */}
                 <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <User className="w-4 h-4 text-indigo-500" /> Account Security
                    </h3>
                    <Button variant="outline" className="w-full justify-between text-slate-600">
                       Change Password <ChevronRight className="w-4 h-4" />
                    </Button>
                 </div>

                 <div className="pt-6">
                    {onLogout && (
                        <Button onClick={onLogout} variant="danger" className="w-full">Sign Out</Button>
                    )}
                 </div>
              </div>
           )}

        </div>
      </div>

      {trackingOrder && (
          <OrderTracking order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      )}
    </div>
  );
};

// Icon helper for Wishlist
function Plus(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
// Icon helper for Close (reusing logic from standard imports usually, but inline for brevity in sub-components if needed, though Lucide is imported)
import { X } from 'lucide-react';
