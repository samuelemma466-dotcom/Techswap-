
import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus, RefreshCcw, ShoppingCart, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { Product, AiMarketAnalysis } from '../types';
import { getProductMarketAnalysis } from '../services/geminiService';
import { Button } from './Button';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (price: number) => void;
  onSwap: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onAddToCart, onSwap }) => {
  const [analysis, setAnalysis] = useState<AiMarketAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
        const result = await getProductMarketAnalysis(product.name);
        setAnalysis(result);
        setLoading(false);
    };
    fetchAnalysis();
  }, [product.name]);

  // Mock Price History Data points for graph
  const generateHistory = () => {
     const points = [];
     let price = product.price * 1.1; // Start higher
     for(let i=0; i<6; i++) {
         price = price * (0.95 + Math.random() * 0.1); // Random flux
         points.push(price);
     }
     points[5] = product.price; // End at current
     return points;
  };

  const pricePoints = generateHistory();
  const maxPrice = Math.max(...pricePoints) * 1.05;
  const minPrice = Math.min(...pricePoints) * 0.95;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col md:flex-row overflow-hidden relative">
          
          <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
          </button>

          {/* Left: Visuals */}
          <div className="w-full md:w-1/2 bg-slate-100 relative group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 flex gap-2">
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Condition
                  </div>
                  <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold uppercase tracking-wider text-slate-900">
                      {product.condition}
                  </div>
              </div>
          </div>

          {/* Right: Data & Actions */}
          <div className="w-full md:w-1/2 bg-white flex flex-col">
              <div className="flex-1 overflow-y-auto p-8">
                  {/* Header */}
                  <div className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                          <h2 className="text-3xl font-bold text-slate-900">{product.name}</h2>
                          {analysis && (
                              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                  analysis.trend === 'up' ? 'bg-green-100 text-green-700' :
                                  analysis.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                  {analysis.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                                   analysis.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                  {analysis.trend} Trend
                              </div>
                          )}
                      </div>
                      <p className="text-slate-500 text-lg leading-relaxed">{product.description}</p>
                  </div>

                  {/* Price Chart Area */}
                  <div className="mb-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                      <div className="flex justify-between items-end mb-4">
                          <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Market Value</p>
                              <p className="text-3xl font-extrabold text-slate-900">₦{product.price.toLocaleString()}</p>
                          </div>
                          {loading ? (
                              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                          ) : (
                              <div className="text-right max-w-[200px]">
                                  <p className="text-xs font-medium text-slate-500 italic">"{analysis?.insight}"</p>
                              </div>
                          )}
                      </div>

                      {/* Simple SVG Line Chart */}
                      <div className="h-24 w-full flex items-end justify-between gap-1">
                          {pricePoints.map((p, i) => {
                              const height = ((p - minPrice) / (maxPrice - minPrice)) * 100;
                              return (
                                  <div key={i} className="w-full bg-indigo-100 rounded-t-sm relative group">
                                      <div 
                                        className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-500"
                                        style={{ height: `${height}%` }}
                                      ></div>
                                      {/* Tooltip */}
                                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                          ₦{Math.round(p).toLocaleString()}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">
                          <span>6 Months Ago</span>
                          <span>Today</span>
                      </div>
                  </div>

                  {/* Specs */}
                  <div className="mb-6">
                      <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
                          <Cpu className="w-4 h-4 text-indigo-600" /> Tech Specs
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                          {loading ? (
                              [1,2,3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse"></div>)
                          ) : (
                              analysis?.specs.map((spec, i) => (
                                  <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                      <span className="text-slate-500">{spec.label}</span>
                                      <span className="font-semibold text-slate-900">{spec.value}</span>
                                  </div>
                              ))
                          )}
                          {!loading && (!analysis?.specs || analysis.specs.length === 0) && (
                              <p className="text-sm text-slate-400 italic">Specs details unavailable.</p>
                          )}
                      </div>
                  </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-slate-100 bg-white flex gap-4">
                  <Button variant="secondary" onClick={onSwap} className="flex-1 py-4 text-base">
                      <RefreshCcw className="w-5 h-5 mr-2" /> Swap Your Device
                  </Button>
                  <Button onClick={() => onAddToCart(product.price)} className="flex-1 py-4 text-base">
                      <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                  </Button>
              </div>
          </div>
       </div>
    </div>
  );
};
