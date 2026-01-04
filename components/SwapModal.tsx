
import React, { useState, useRef } from 'react';
import { Camera, ArrowRight, RefreshCw, X, Check, Info, ArrowRightLeft } from 'lucide-react';
import { Product, SwapAssessment } from '../types';
import { analyzeSwapParams } from '../services/geminiService';
import { Button } from './Button';

interface SwapModalProps {
  targetProduct: Product;
  onClose: () => void;
  onAddToCart: (finalPrice: number, isSwap: boolean) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ targetProduct, onClose, onAddToCart }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Analyzing, 3: Result
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [assessment, setAssessment] = useState<SwapAssessment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setStep(2);
    
    // Remove data:image/...;base64, header for the API
    const base64Data = image.split(',')[1];
    
    try {
      const result = await analyzeSwapParams(base64Data, description, targetProduct.price);
      setAssessment(result);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Please try again.");
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            <h2 className="text-lg font-bold">AI FairTrade Engine</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          
          {/* Step 1: Input */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Target Product Indicator */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-100">
                <img 
                  src={targetProduct.image} 
                  alt={targetProduct.name} 
                  className="w-16 h-16 rounded-lg object-cover shadow-sm border border-white"
                />
                <div className="flex-1">
                  <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-0.5">Trading For</p>
                  <h3 className="font-bold text-slate-900 leading-tight">{targetProduct.name}</h3>
                  <p className="text-sm text-slate-500">₦{targetProduct.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Upload / Preview Area */}
                <div className="space-y-2">
                   <label className="block text-sm font-medium text-slate-700">Your Device Photo</label>
                   <div 
                      className={`relative group rounded-xl overflow-hidden transition-all ${
                        image 
                          ? 'h-64 border border-slate-200' 
                          : 'h-64 border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 cursor-pointer flex flex-col items-center justify-center'
                      }`}
                      onClick={() => !image && fileInputRef.current?.click()}
                    >
                      {image ? (
                        <>
                          <img src={image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                              className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                            >
                              Change Photo
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Camera className="w-12 h-12 text-slate-400 mb-2" />
                          <span className="text-slate-500 font-medium">Upload Photo</span>
                          <span className="text-xs text-slate-400 mt-1">Clear, well-lit image</span>
                        </>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                   </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Device Description</label>
                    <textarea 
                      className="w-full h-[calc(100%-2rem)] p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                      placeholder="e.g. iPhone 11, 128GB, UK Used, Screen clean..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  disabled={!image || !description} 
                  onClick={handleAnalyze}
                  className="w-full md:w-auto px-8"
                >
                  Analyze & Value <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <RefreshCw className="text-indigo-600 w-10 h-10 animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-3 max-w-sm mx-auto">
                <h3 className="text-2xl font-bold text-slate-800">Analyzing Device</h3>
                <p className="text-slate-500">Our AI is checking condition, comparing Nigerian market rates, and calculating the best trade-in value.</p>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && assessment && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Visual Swap Comparison */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 relative">
                 <div className="flex items-center justify-between relative z-10">
                    {/* User Item */}
                    <div className="flex flex-col items-center w-1/3 text-center">
                       <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-indigo-200 shadow-md relative mb-3 bg-white">
                          <img src={image!} className="w-full h-full object-cover" alt="Your Device" />
                          <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[10px] font-bold py-1 px-2 uppercase tracking-wide">
                            {assessment.estimatedCondition}
                          </div>
                       </div>
                       <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Your Device</p>
                       <p className="text-lg font-bold text-green-600">+₦{assessment.tradeInValue.toLocaleString()}</p>
                    </div>

                    {/* Swap Icon */}
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 mb-2">
                           <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Exchange</p>
                    </div>

                    {/* Target Item */}
                    <div className="flex flex-col items-center w-1/3 text-center">
                       <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md relative mb-3 bg-white">
                          <img src={targetProduct.image} className="w-full h-full object-cover" alt="Target" />
                       </div>
                       <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Target</p>
                       <p className="text-lg font-bold text-slate-900">-₦{targetProduct.price.toLocaleString()}</p>
                    </div>
                 </div>
              </div>

              {/* Analysis & Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-3 text-sm">AI Valuation Report</h4>
                    <div className="space-y-2 text-sm">
                       <div className="flex justify-between">
                          <span className="text-slate-500">Market Value</span>
                          <span className="text-slate-400 line-through decoration-red-400">₦{assessment.marketValue.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                             Trade-in Offer <Info className="w-3 h-3 text-slate-300" />
                          </span>
                          <span className="font-bold text-slate-800">₦{assessment.tradeInValue.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-50">
                       <p className="text-xs text-slate-500 italic leading-relaxed">"{assessment.reasoning}"</p>
                    </div>
                 </div>

                 <div className="bg-indigo-600 p-4 rounded-xl shadow-lg text-white flex flex-col justify-between">
                    <div>
                       <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider mb-1">Final to Pay</p>
                       <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold tracking-tight">₦{assessment.topUpAmount.toLocaleString()}</span>
                          <span className="text-sm text-indigo-200">NGN</span>
                       </div>
                    </div>
                    <div className="mt-4">
                       <Button 
                         onClick={() => onAddToCart(assessment.topUpAmount, true)}
                         className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-0"
                       >
                         Accept Deal
                       </Button>
                    </div>
                 </div>
              </div>

              <div className="text-center">
                 <button 
                   onClick={() => setStep(1)}
                   className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                 >
                   Decline & Try Different Photo
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
