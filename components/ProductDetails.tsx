
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, ShieldCheck, Activity, BarChart2, CheckCircle2 } from 'lucide-react';
import { Product, MarketPulseData } from '../types';
import { getMarketPulse } from '../services/geminiService';
import { Button } from './Button';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (price: number) => void;
  onNegotiate: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onAddToCart, onNegotiate }) => {
  const [pulse, setPulse] = useState<MarketPulseData | null>(null);

  useEffect(() => {
    getMarketPulse(product.name, product.price).then(setPulse);
  }, [product]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
       <div className="bg-slate-900 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden border border-slate-800 shadow-2xl relative">
          <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full hover:bg-white/10 text-white"><X className="w-5 h-5" /></button>
          
          {/* Left: Image & Trust */}
          <div className="w-full md:w-2/5 bg-black relative flex flex-col">
              <img src={product.image} className="h-2/3 w-full object-cover opacity-80" />
              <div className="flex-1 p-6 bg-slate-950 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                      <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">Seller Trust</p>
                          <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">{product.sellerTrustScore}%</span>
                              <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                      </div>
                      <div className="text-right">
                           <p className="text-xs text-slate-500 uppercase font-bold">Grade</p>
                           <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-white rounded font-bold">{product.condition}</span>
                      </div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-lg flex gap-3 items-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm text-emerald-200">Verified by TrustScan AI</p>
                  </div>
              </div>
          </div>

          {/* Right: MarketPulse & Actions */}
          <div className="w-full md:w-3/5 bg-slate-900 p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
              <p className="text-slate-400 mb-6">{product.description}</p>
              
              <div className="flex items-end gap-4 mb-8">
                  <h3 className="text-4xl font-bold text-white">₦{product.price.toLocaleString()}</h3>
                  {pulse && (
                      <span className={`text-sm font-bold flex items-center gap-1 ${pulse.priceTrend === 'rising' ? 'text-red-400' : 'text-emerald-400'}`}>
                          <TrendingUp className="w-4 h-4" /> Market Trend
                      </span>
                  )}
              </div>

              {/* MarketPulse AI Card */}
              {pulse ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-32 h-32" /></div>
                      <h4 className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                          <BarChart2 className="w-5 h-5" /> MarketPulse Analysis
                      </h4>
                      <div className="flex gap-6 items-center">
                          <div className="relative w-20 h-20 flex items-center justify-center border-4 border-slate-800 rounded-full">
                              <span className="text-xl font-bold text-white">{pulse.valueScore}</span>
                              <div className="absolute text-[8px] uppercase -bottom-4 text-slate-500">Value Score</div>
                          </div>
                          <p className="flex-1 text-sm text-slate-300 leading-relaxed">"{pulse.insight}"</p>
                      </div>
                  </div>
              ) : <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse mb-8"></div>}

              <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={onNegotiate} className="h-12 border-slate-600 text-slate-200 hover:bg-slate-800">Negotiate Price</Button>
                  <Button onClick={() => onAddToCart(product.price)} className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white">Secure Buy (Escrow)</Button>
              </div>
          </div>
       </div>
    </div>
  );
};
