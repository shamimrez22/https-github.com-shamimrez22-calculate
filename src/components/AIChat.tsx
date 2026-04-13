import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Transaction, Budget } from '../types';
import { Sparkles, Send, Loader2, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import VoiceInput from './VoiceInput';

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
        
        IMPORTANT: All currency values are in Taka (৳).
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
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Advisor Interface</h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-1">Direct link to fiscal intelligence</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-4 text-black/40 hover:text-[#2FA084] hover:bg-red-50 border-2 border-transparent hover:border-[#2FA084] rounded-none transition-all"
          title="Clear Buffer"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 bg-white/10 border-2 border-black flex flex-col relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-10 scroll-smooth bg-white/5"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-30">
              <div className="w-24 h-24 bg-[#2FA084] text-white border-2 border-black rounded-none flex items-center justify-center">
                <Sparkles className="w-12 h-12" />
              </div>
              <div className="max-w-md">
                <p className="text-black font-black uppercase tracking-widest text-sm">Awaiting Instructions</p>
                <p className="text-[10px] text-black/60 font-black uppercase tracking-widest mt-4 leading-relaxed">
                  "Analyze expenditure vectors"<br/>
                  "Project savings potential"<br/>
                  "Identify fiscal anomalies"
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
              <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={cn(
                  "w-12 h-12 shrink-0 flex items-center justify-center border-2 rounded-none",
                  msg.role === 'user' ? "bg-[#2FA084] border-black text-white" : "bg-[#E2E8F0] border-black text-black"
                )}>
                  {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "p-8 text-base leading-relaxed border-2 font-black tracking-tight",
                  msg.role === 'user' ? "bg-[#2FA084] text-white border-black" : "bg-[#F0F9F6] text-black border-black"
                )}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-6 max-w-[85%]">
                <div className="w-12 h-12 shrink-0 bg-[#E2E8F0] border-2 border-black text-black flex items-center justify-center rounded-none">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="p-8 bg-[#F0F9F6] border-2 border-black flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-black" />
                  <span className="text-[10px] font-black text-black uppercase tracking-widest">Neural processing active...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-10 border-t-2 border-black bg-white/20">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER FISCAL QUERY..."
                className="excel-input pr-4"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="p-4 bg-[#2FA084] hover:bg-white hover:text-[#2FA084] text-white border-2 border-black rounded-none transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-6 h-6" />
              </button>
              <div className="flex flex-col gap-2">
                <VoiceInput onResult={(text) => setInput(prev => prev ? `${prev} ${text}` : text)} language="bn-BD" />
                <VoiceInput onResult={(text) => setInput(prev => prev ? `${prev} ${text}` : text)} language="en-US" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
