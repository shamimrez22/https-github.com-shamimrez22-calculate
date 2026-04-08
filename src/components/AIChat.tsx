import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Transaction, Budget } from '../types';
import { Sparkles, Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

export default function AIChat({ transactions, budgets }: { transactions: Transaction[], budgets: Budget[] }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const context = `
        You are a professional financial advisor AI for an app called FinTrack.
        User's current financial data:
        - Total Transactions: ${transactions.length}
        - Total Budgets: ${budgets.length}
        - Recent Transactions: ${JSON.stringify(transactions.slice(0, 5))}
        - Budgets: ${JSON.stringify(budgets)}
        
        Provide concise, actionable financial advice based on the user's query and data.
        Be encouraging but realistic. Use a professional yet friendly tone.
      `;

      const prompt = `${context}\n\nChat History:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text || "I'm sorry, I couldn't generate a response.";

      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">AI Advisor</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Chat with your personal financial expert</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-none flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </div>
              <div className="max-w-sm">
                <p className="text-white font-black uppercase tracking-widest">Ask me anything</p>
                <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                  "How can I save more this month?"<br/>
                  "Analyze my spending habits."<br/>
                  "What's my biggest expense category?"
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center border ${
                  msg.role === 'user' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-5 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'bg-indigo-500 text-white font-bold' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-10 h-10 shrink-0 bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-5 bg-white/5 border border-white/5 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Advisor is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-black/20">
          <div className="relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="TYPE YOUR FINANCIAL QUERY..."
              className="w-full pl-6 pr-16 py-5 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold uppercase tracking-widest text-xs"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-500 hover:bg-indigo-600 text-white transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
