
import React, { useState, useRef } from 'react';
import { Camera, X, ShieldCheck, AlertTriangle, CheckCircle2, ScanLine } from 'lucide-react';
import { Product, TrustScanResult } from '../types';
import { runTrustScan } from '../services/geminiService';
import { Button } from './Button';

interface TrustScanModalProps {
  onClose: () => void;
  onVerified: (result: TrustScanResult) => void;
}

export const TrustScanModal: React.FC<TrustScanModalProps> = ({ onClose, onVerified }) => {
  const [image, setImage] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [result, setResult] = useState<TrustScanResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
      if (!image) return;
      setStatus('scanning');
      const base64 = image.split(',')[1];
      const data = await runTrustScan(base64, desc);
      setResult(data);
      setStatus('complete');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl">
          
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <ScanLine className="w-5 h-5 text-emerald-500" />
                 <h2 className="text-white font-bold">TrustScan AI Verification</h2>
             </div>
             <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
          </div>

          <div className="p-6">
             {status === 'idle' && (
                 <div className="space-y-6">
                     <div 
                        onClick={() => fileRef.current?.click()}
                        className="h-64 border-2 border-dashed border-slate-700 bg-slate-950 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                     >
                        {image ? (
                            <img src={image} className="h-full w-full object-contain rounded-xl" />
                        ) : (
                            <>
                                <Camera className="w-12 h-12 text-slate-600 mb-4" />
                                <p className="text-slate-400 font-medium">Upload Device Photo</p>
                                <p className="text-xs text-slate-600 mt-1">AI will analyze screen & body condition</p>
                            </>
                        )}
                        <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if(file) {
                                const reader = new FileReader();
                                reader.onload = () => setImage(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} />
                     </div>
                     <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                        placeholder="Describe any hidden faults (e.g. FaceID not working)..."
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                     />
                     <Button onClick={handleScan} disabled={!image} className="w-full bg-emerald-600 hover:bg-emerald-500">Run TrustScan</Button>
                 </div>
             )}

             {status === 'scanning' && (
                 <div className="py-20 flex flex-col items-center text-center">
                     <div className="relative w-20 h-20 mb-6">
                         <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">AI Analysis in Progress</h3>
                     <p className="text-slate-500">Checking for cracks, dents, and authenticity...</p>
                 </div>
             )}

             {status === 'complete' && result && (
                 <div className="space-y-6 animate-in fade-in">
                     <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                         <div>
                             <p className="text-xs text-slate-500 uppercase font-bold">Trust Grade</p>
                             <h1 className={`text-4xl font-extrabold ${result.conditionGrade === 'A' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                 {result.conditionGrade}
                             </h1>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-slate-500 uppercase font-bold">Confidence</p>
                             <p className="text-2xl font-bold text-white">{result.confidenceScore}%</p>
                         </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-3">
                         {Object.entries(result.visualAnalysis).map(([key, val]) => (
                             <div key={key} className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-800">
                                 <p className="text-xs text-slate-500 uppercase mb-1">{key}</p>
                                 <p className="text-sm font-bold text-white capitalize">{val}</p>
                             </div>
                         ))}
                     </div>

                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3">
                         <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                         <div>
                             <p className="text-sm font-bold text-emerald-400">Verification Successful</p>
                             <p className="text-xs text-emerald-200/70 mt-1">{result.verificationNotes}</p>
                         </div>
                     </div>

                     <Button onClick={() => onVerified(result)} className="w-full bg-emerald-600">List Item with Verified Badge</Button>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};
