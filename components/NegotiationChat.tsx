
import React, { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, X, User, Bot, Settings2, Mic, MicOff, Loader2, Globe, Check, AlertTriangle } from 'lucide-react';
import { Product, Message } from '../types';
import { generateNegotiationReply, transcribeAudio, translateText, sanitizeInput } from '../services/geminiService';

interface NegotiationChatProps {
  product: Product;
  onClose: () => void;
  onSuccess: (finalPrice: number) => void;
}

export const NegotiationChat: React.FC<NegotiationChatProps> = ({ product, onClose, onSuccess }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'seller',
      text: `Hi! I'm selling this ${product.name} for ₦${product.price.toLocaleString()}. Open to reasonable offers!`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiTone, setAiTone] = useState<'friendly' | 'firm' | 'neutral'>('friendly');
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState<string | null>(null); // New Error State
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, error]);

  // Translate initial message if language changes
  useEffect(() => {
     if (language !== 'English') {
         const translateHistory = async () => {
             const newMessages = await Promise.all(messages.map(async (msg) => {
                 const translated = await translateText(msg.text, language);
                 return { ...msg, text: translated };
             }));
             setMessages(newMessages);
         };
         translateHistory();
     }
  }, [language]);

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                
                setIsTranscribing(true);
                let text = await transcribeAudio(base64Data, 'audio/webm');
                setIsTranscribing(false);
                
                if (text) {
                    setInputText(prev => (prev ? prev + ' ' + text : text));
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("Could not access microphone.");
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    } else {
        startRecording();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setError(null); // Clear previous errors
    const sanitizedText = sanitizeInput(inputText); // SANITIZE INPUT

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'buyer',
      text: sanitizedText,
      timestamp: Date.now()
    };
    
    // Check for offer logic using Regex to find numbers
    const offerMatch = sanitizedText.replace(/,/g, '').match(/(\d+)/);
    if (offerMatch) {
        const amount = parseInt(offerMatch[0]);
        // Simple heuristic: if number is > 1000, assume it's an offer in Naira
        if (amount > 1000) {
             userMsg.isOffer = true;
             userMsg.offerAmount = amount;
        }
    }

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Logic
    const history = messages.map(m => ({
        role: m.sender === 'buyer' ? 'user' : 'model',
        text: m.text
    }));
    history.push({ role: 'user', text: userMsg.text });

    try {
        let replyText = "";
        let accepted = false;

        // Note: Actual logic happens in service, rate limit errors thrown there
        if (userMsg.isOffer && userMsg.offerAmount) {
             const result = await generateNegotiationReply(history, userMsg.offerAmount, product.price, aiTone);
             replyText = result.text;
             accepted = result.accepted;
        } else {
             const result = await generateNegotiationReply(history, 0, product.price, aiTone);
             replyText = result.text;
             accepted = false;
        }

        if (language !== 'English') {
            replyText = await translateText(replyText, language);
        }

        const sellerMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'seller',
            text: replyText,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, sellerMsg]);
        setIsTyping(false);

        if (accepted && userMsg.offerAmount) {
            // Visual success indicator before closing
            setTimeout(() => onSuccess(userMsg.offerAmount!), 2000);
        }

    } catch (err: any) {
        setIsTyping(false);
        if (err.message && err.message.includes("Rate limit")) {
            setError(err.message);
        } else {
            setError("Connection issue. Please try again.");
        }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[650px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Professional Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 p-4 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
               <DollarSign className="w-24 h-24 transform rotate-12" />
           </div>
           
           <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <img src={product.image} className="w-12 h-12 rounded-full border-2 border-indigo-300 object-cover" alt="Product" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-indigo-900"></div>
                 </div>
                 <div>
                     <h3 className="font-bold text-lg leading-tight">Negotiation</h3>
                     <p className="text-xs text-indigo-200 font-medium tracking-wide opacity-90">{product.name}</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm">
                <X className="w-5 h-5" />
              </button>
           </div>
           
           {/* Controls Bar */}
           <div className="flex gap-2 text-xs relative z-10">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex-1 transition-all hover:bg-black/30">
                 <Settings2 className="w-3.5 h-3.5 text-indigo-300" />
                 <select 
                     value={aiTone}
                     onChange={(e) => setAiTone(e.target.value as any)}
                     className="bg-transparent border-0 text-white p-0 text-xs focus:ring-0 cursor-pointer appearance-none w-full font-medium"
                 >
                     <option value="friendly" className="text-slate-900">Friendly Mode</option>
                     <option value="neutral" className="text-slate-900">Professional Mode</option>
                     <option value="firm" className="text-slate-900">Hard Bargain Mode</option>
                 </select>
              </div>
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex-1 transition-all hover:bg-black/30">
                 <Globe className="w-3.5 h-3.5 text-indigo-300" />
                 <select 
                     value={language}
                     onChange={(e) => setLanguage(e.target.value)}
                     className="bg-transparent border-0 text-white p-0 text-xs focus:ring-0 cursor-pointer appearance-none w-full font-medium"
                 >
                     <option className="text-slate-900">English</option>
                     <option className="text-slate-900">Pidgin</option>
                     <option className="text-slate-900">Hausa</option>
                     <option className="text-slate-900">Yoruba</option>
                     <option className="text-slate-900">Igbo</option>
                     <option className="text-slate-900">French</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
           {/* Watermark */}
           <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <DollarSign className="w-64 h-64" />
           </div>

          {messages.map((msg) => {
            const isBuyer = msg.sender === 'buyer';
            return (
              <div key={msg.id} className={`flex ${isBuyer ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                <div className={`flex items-end max-w-[85%] gap-2 ${isBuyer ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm border ${
                        isBuyer 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                        : 'bg-white text-emerald-600 border-slate-200'
                    }`}>
                        {isBuyer ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
                        isBuyer 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                    }`}>
                        {msg.text}
                        <div className={`text-[10px] mt-1 opacity-70 text-right ${isBuyer ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
             <div className="flex justify-start animate-in fade-in">
                 <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none text-slate-400 text-xs shadow-sm flex items-center gap-1.5 w-16">
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
             </div>
          )}

          {/* Rate Limit Error Message */}
          {error && (
              <div className="flex justify-center animate-in zoom-in-95">
                  <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-full border border-red-200 shadow-sm flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      {error}
                  </div>
              </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 relative z-20">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 group">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={error ? "Wait before sending..." : `Type your offer in ${language}...`}
                    disabled={isRecording || isTranscribing || !!error}
                    className={`w-full p-3 pr-10 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-60 ${
                        error 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'
                    }`}
                />
                <button
                    onClick={handleMicClick}
                    disabled={isTranscribing || !!error}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        isRecording 
                        ? 'bg-red-50 text-red-500 animate-pulse' 
                        : isTranscribing
                        ? 'bg-indigo-50 text-indigo-500 cursor-wait'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                >
                    {isTranscribing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isRecording ? (
                        <MicOff className="w-4 h-4" />
                    ) : (
                        <Mic className="w-4 h-4" />
                    )}
                </button>
            </div>
            
            <button 
                onClick={handleSend}
                disabled={!inputText.trim() || isRecording || isTranscribing || !!error}
                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {isTranscribing && (
              <div className="absolute -top-8 left-4 bg-indigo-900 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Transcribing...
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
