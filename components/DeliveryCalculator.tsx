
import React, { useState } from 'react';
import { MapPin, Truck, Clock, Loader2, AlertCircle } from 'lucide-react';
import { calculateDeliveryQuotes } from '../services/geminiService';
import { AiDeliveryQuote } from '../types';

interface DeliveryCalculatorProps {
  sellerLocation: string;
  onFeeCalculated: (fee: number) => void;
}

export const DeliveryCalculator: React.FC<DeliveryCalculatorProps> = ({ sellerLocation, onFeeCalculated }) => {
  const [locationInput, setLocationInput] = useState('');
  const [quotes, setQuotes] = useState<AiDeliveryQuote[]>([]);
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetQuotes = async () => {
    if (locationInput.length < 3) {
        setError('Please enter a valid location (e.g. Lekki, Abuja)');
        return;
    }
    setLoading(true);
    setError('');
    setQuotes([]);
    setSelectedQuoteIndex(null);
    
    try {
        const results = await calculateDeliveryQuotes(sellerLocation, locationInput);
        if (results.length === 0) throw new Error("No routes found");
        setQuotes(results);
    } catch (e) {
        setError("Could not calculate rates. Try a major city name.");
    } finally {
        setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
      setSelectedQuoteIndex(index);
      onFeeCalculated(quotes[index].cost);
  };

  // Format currency professionally
  const formatNaira = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="mt-4 p-5 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      <h4 className="flex items-center gap-2 font-semibold text-slate-800 mb-4">
        <Truck className="w-5 h-5 text-indigo-600" />
        Logistics Estimate
      </h4>
      
      {/* Input Section */}
      <div className="flex gap-2 mb-4">
         <div className="relative flex-1 group">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Buyer Location (e.g. Gwarinpa)"
                value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); setError(''); }}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none ${error ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-indigo-500'}`}
                onKeyDown={(e) => e.key === 'Enter' && handleGetQuotes()}
            />
         </div>
         <button 
            onClick={handleGetQuotes}
            disabled={loading || locationInput.length < 3}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center transition-colors shadow-sm"
         >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Rates'}
         </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs mb-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
      
      {/* Results Section */}
      {quotes.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                  <span>Provider</span>
                  <span>Cost</span>
              </div>
              {quotes.map((quote, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`
                        cursor-pointer p-3 rounded-lg border transition-all duration-200 relative group
                        ${selectedQuoteIndex === idx 
                            ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500 shadow-sm' 
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                        }
                    `}
                  >
                      <div className="flex justify-between items-start mb-1">
                          <div>
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 text-sm">{quote.carrier}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                                      quote.cost < 2000 ? 'bg-emerald-100 text-emerald-700' : 
                                      quote.cost > 5000 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                      {quote.service}
                                  </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quote.estimatedDays}</span>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="block font-bold text-indigo-700 text-lg">{formatNaira(quote.cost)}</span>
                          </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{quote.reasoning}</p>
                      
                      {/* Selection Indicator */}
                      {selectedQuoteIndex === idx && (
                          <div className="absolute right-2 bottom-2 text-indigo-600 opacity-20">
                              <Truck className="w-8 h-8" />
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};
