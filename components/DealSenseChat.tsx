
import React, { useState, useEffect, useRef } from 'react';
import { Send, DollarSign, X, Bot, Globe, AlertCircle, Mic } from 'lucide-react';
import { Product, Message } from '../types';
import { getDealSenseReply } from '../services/geminiService';

interface DealSenseChatProps {
  product: Product;
  onClose: () => void;
  onSuccess: (finalPrice: number) => void;
}

export const DealSenseChat: React.FC<DealSenseChatProps> = ({ product, onClose, onSuccess }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'seller', text: `Welcome! I'm authorized to negotiate this ${product.name}. Make your best offer!`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
      if (!input.trim()) return;
      const userMsg: Message = { id: Date.now().toString(), sender: 'buyer', text: input, timestamp: Date.now() };
      
      // Parse offer
      const offerMatch = input.match(/\d+/);
      const offerAmount = offerMatch ? parseInt(offerMatch[0]) : 0;
      
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const history = messages.map(m => ({ role: m.sender === 'buyer' ? 'user' : 'model', text: m.text }));
      
      // Call DealSense AI
      const reply = await getDealSenseReply(history, offerAmount, product.price, language, 'professional');
      
      setLoading(false);
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          sender: 'seller', 
          text: reply.text, 
          timestamp: Date.now() 
      }]);

      if (reply.accepted && offerAmount > 0) {
          setTimeout(() => onSuccess(offerAmount), 2000);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
       <div className="bg-slate-900 w-full max-w-md h-[600px] rounded-2xl flex flex-col shadow-2xl border border-slate-800">
          
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <img src={product.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                      <h3 className="text-white font-bold text-sm">{product.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Bot className="w-3 h-3" /> DealSense AI Agent
                      </div>
                  </div>
              </div>
              <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
          </div>

          {/* Settings */}
          <div className="bg-slate-900 p-2 border-b border-slate-800 flex justify-end">
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none"
                  >
                      <option>English</option>
                      <option>Pidgin</option>
                      <option>Yoruba</option>
                      <option>Hausa</option>
                  </select>
              </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
              {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                          m.sender === 'buyer' 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                      }`}>
                          {m.text}
                      </div>
                  </div>
              ))}
              {loading && <div className="text-xs text-slate-500 animate-pulse ml-4">DealSense is thinking...</div>}
              <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                  type="text" 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Make an offer..." 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 text-white focus:outline-none focus:border-emerald-500"
              />
              <button onClick={handleSend} className="bg-emerald-600 p-2 rounded-lg text-white hover:bg-emerald-500"><Send className="w-5 h-5" /></button>
          </div>
       </div>
    </div>
  );
};
