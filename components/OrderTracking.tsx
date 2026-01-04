
import React, { useEffect, useState } from 'react';
import { Package, Truck, CheckCircle2, MapPin, Warehouse, RefreshCcw, ArrowRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { generateHubVerificationReport } from '../services/geminiService';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [verificationReport, setVerificationReport] = useState<string | null>(order.verificationReport || null);

  // Simulate progress for demo purposes
  useEffect(() => {
    const steps = order.trackingSteps;
    const currentIdx = steps.findIndex(s => !s.completed);
    setActiveStep(currentIdx === -1 ? steps.length - 1 : currentIdx);

    // If active step is at Hub Verification and no report exists, generate one
    if (steps[activeStep]?.status === 'at_hub_verification' && !verificationReport) {
        const generateReport = async () => {
            const report = await generateHubVerificationReport(order.items[0].product.name);
            setVerificationReport(report);
        };
        generateReport();
    }
  }, [order, activeStep, verificationReport]);

  const getStepIcon = (status: OrderStatus) => {
      switch(status) {
          case 'processing': return <Package className="w-5 h-5" />;
          case 'pickup_scheduled': return <MapPin className="w-5 h-5" />;
          case 'in_transit_to_hub': return <Truck className="w-5 h-5" />;
          case 'at_hub_verification': return <Warehouse className="w-5 h-5" />;
          case 'verified': return <CheckCircle2 className="w-5 h-5" />;
          case 'out_for_delivery': return <Truck className="w-5 h-5" />;
          case 'delivered': return <Package className="w-5 h-5" />;
          default: return <Package className="w-5 h-5" />;
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex overflow-hidden">
          
          {/* Left Panel: Map & Status */}
          <div className="w-2/3 bg-slate-50 relative hidden md:block">
             {/* Simulated Map Background */}
             <div className="absolute inset-0 opacity-10" style={{ 
                 backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', 
                 backgroundSize: '20px 20px' 
             }}></div>
             
             {/* Map Animation */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative w-64 h-64 border-4 border-dashed border-indigo-200 rounded-full animate-[spin_20s_linear_infinite]">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 p-2 rounded-full shadow-lg">
                         <Warehouse className="w-6 h-6 text-white" />
                     </div>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-teal-500 p-2 rounded-full shadow-lg">
                         <MapPin className="w-6 h-6 text-white" />
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <div className="w-4 h-4 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                     </div>
                 </div>
             </div>

             <div className="absolute top-6 left-6 right-6 flex justify-between">
                 <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                     <p className="text-xs text-slate-500 font-bold uppercase">Estimated Arrival</p>
                     <p className="text-lg font-bold text-slate-900">{order.estimatedArrival}</p>
                 </div>
                 <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                     <p className="text-xs text-slate-500 font-bold uppercase">Order ID</p>
                     <p className="text-sm font-mono text-slate-900">#{order.id.slice(0,8)}</p>
                 </div>
             </div>

             {/* Live Status Card */}
             <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                     {getStepIcon(order.status)}
                 </div>
                 <div>
                     <p className="font-bold text-lg text-slate-900">
                         {order.trackingSteps[activeStep]?.label || 'Updating...'}
                     </p>
                     <p className="text-slate-500 text-sm">Latest update: Just now</p>
                 </div>
             </div>
          </div>

          {/* Right Panel: Timeline & Details */}
          <div className="w-full md:w-1/3 bg-white flex flex-col border-l border-slate-100">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div>
                     <h2 className="font-bold text-xl text-slate-900">Tracking</h2>
                     {order.items.some(i => i.isSwap) && (
                         <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-1">
                             <RefreshCcw className="w-3 h-3" /> Secure Swap
                         </span>
                     )}
                 </div>
                 <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                     <ArrowRight className="w-5 h-5 text-slate-500" />
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6">
                 {/* Timeline */}
                 <div className="space-y-0 relative">
                     {/* Vertical Line */}
                     <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>

                     {order.trackingSteps.map((step, idx) => {
                         const isActive = idx === activeStep;
                         const isCompleted = idx < activeStep;
                         
                         return (
                             <div key={idx} className={`relative flex gap-4 pb-8 last:pb-0 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'}`}>
                                 <div className={`relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0 bg-white transition-all ${
                                     isActive ? 'border-indigo-500 text-indigo-600 shadow-md scale-110' : 
                                     isCompleted ? 'border-teal-500 text-teal-600' : 'border-slate-200 text-slate-300'
                                 }`}>
                                     {getStepIcon(step.status)}
                                 </div>
                                 <div className="pt-2">
                                     <h4 className={`font-bold text-sm ${isActive ? 'text-indigo-700' : 'text-slate-900'}`}>{step.label}</h4>
                                     <p className="text-xs text-slate-500">{step.location || 'Pending...'}</p>
                                     
                                     {/* Special Verification Report Card */}
                                     {step.status === 'at_hub_verification' && isActive && verificationReport && (
                                         <div className="mt-3 bg-emerald-50 border border-emerald-100 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                                             <div className="flex items-center gap-2 mb-1">
                                                 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                 <span className="text-xs font-bold text-emerald-700">AI Inspection Passed</span>
                                             </div>
                                             <p className="text-xs text-emerald-800 leading-relaxed italic">
                                                 "{verificationReport}"
                                             </p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )
                     })}
                 </div>
             </div>

             {/* Items Summary */}
             <div className="p-4 border-t border-slate-100 bg-slate-50">
                 <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Items in Shipment</h4>
                 <div className="space-y-3">
                     {order.items.map((item, i) => (
                         <div key={i} className="flex gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                             <img src={item.product.image} className="w-10 h-10 rounded object-cover" alt="" />
                             <div className="flex-1">
                                 <p className="text-sm font-bold text-slate-800 truncate">{item.product.name}</p>
                                 <div className="flex justify-between items-center">
                                     <span className="text-xs text-slate-500">{item.isSwap ? 'Sent for Swap' : 'Purchased'}</span>
                                     <span className="text-xs font-medium text-slate-900">${item.price}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
};
