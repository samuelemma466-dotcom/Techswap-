
import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from './Button';
import { createPaymentIntent, confirmSecurePayment } from '../services/geminiService';

interface PaymentModalProps {
    amount: number;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, onClose, onSuccess }) => {
    const [step, setStep] = useState<'init' | 'details' | 'processing' | 'success'>('init');
    const [loading, setLoading] = useState(true);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
    const [error, setError] = useState<string | null>(null);

    // Step 1: Initialize Payment Intent (Server handshake)
    useEffect(() => {
        const init = async () => {
            try {
                // Simulate creating intent on backend
                const intent = await createPaymentIntent(amount, 'user_curr_123');
                setClientSecret(intent.clientSecret);
                setLoading(false);
                setStep('details');
            } catch (e) {
                setError("Failed to initialize secure payment gateway.");
            }
        };
        init();
    }, [amount]);

    const handlePay = async () => {
        if (!cardDetails.number || !cardDetails.cvc || !clientSecret) return;
        
        setStep('processing');
        setError(null);

        try {
            // Simulate Tokenization (Stripe.js does this in real life)
            const mockPaymentMethodId = `pm_${Math.random().toString(36).substr(2, 10)}`;
            
            // Confirm Payment (Server handshake)
            const result = await confirmSecurePayment(mockPaymentMethodId, clientSecret);
            
            if (result.success) {
                setStep('success');
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }
        } catch (e) {
            setStep('details');
            setError("Payment declined. Please try another card.");
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95">
                
                {/* Security Badge Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-sm tracking-wide">Secure Checkout</span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6">
                    {/* Amount Display */}
                    <div className="text-center mb-8">
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Total to Pay</p>
                        <h2 className="text-4xl font-extrabold text-slate-900">₦{amount.toLocaleString()}</h2>
                    </div>

                    {step === 'init' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                            <p className="text-slate-500 text-sm">Securing connection to payment gateway...</p>
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-6 animate-in fade-in">
                            {/* Simulated Stripe Element (Iframe-like container) */}
                            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 shadow-inner relative group focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Details</label>
                                
                                <div className="space-y-3">
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none"
                                            value={cardDetails.number}
                                            onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                                            maxLength={19}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            placeholder="MM / YY"
                                            className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none"
                                            maxLength={5}
                                            value={cardDetails.expiry}
                                            onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="CVC"
                                            className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-mono focus:outline-none"
                                            maxLength={3}
                                            value={cardDetails.cvc}
                                            onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                {/* PCI Compliance Badge Simulation */}
                                <div className="absolute top-2 right-2 opacity-50">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg">
                                    <AlertTriangle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <Button onClick={handlePay} className="w-full h-12 text-base font-bold shadow-lg shadow-indigo-500/30">
                                Pay Now
                            </Button>
                            
                            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> Payments processed securely by Stripe. We do not store card details.
                            </p>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in">
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Processing Payment</h3>
                            <p className="text-slate-500 text-sm">Please do not close this window...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                            <p className="text-slate-500 text-sm">Redirecting to order confirmation...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
