
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { Product } from '../types';

interface TechSwapGuideProps {
  products: Product[];
}

export const TechSwapGuide: React.FC<TechSwapGuideProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'model', text: 'Hi! I\'m your TechSwap Guide. Ask me anything about buying, selling, or our listings!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const inventorySummary = products.map(p => p.name).join(', ');
    const responseText = await chatWithAssistant(
        messages.map(m => ({ role: m.role, text: m.text })), 
        input, 
        inventorySummary
    );

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 fade-in">
           <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-3 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                 <Bot className="w-5 h-5" />
                 <span className="font-bold">TechSwap Guide</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                 <X className="w-4 h-4" />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
              {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-xl text-sm ${
                          m.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                      }`}>
                          {m.text}
                      </div>
                  </div>
              ))}
              {isTyping && (
                  <div className="flex justify-start">
                     <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl rounded-bl-none shadow-sm flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                 type="text" 
                 className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 placeholder="How do I sell?"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                 <Send className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
         onClick={() => setIsOpen(!isOpen)}
         className={`pointer-events-auto p-4 rounded-full shadow-xl hover:scale-105 transition-transform ${
            isOpen ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
         }`}
      >
         {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};
