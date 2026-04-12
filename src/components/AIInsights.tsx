import React, { useState, useEffect } from 'react';
import { Transaction, Budget } from '../types';
import { getFinancialInsights, predictNextMonthExpenses } from '../services/geminiService';
import { Sparkles, Brain, TrendingUp, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AIInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export default function AIInsights({ transactions, budgets }: AIInsightsProps) {
  const [insights, setInsights] = useState<string>('');
  const [prediction, setPrediction] = useState<{ predictedAmount: number, confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAIContent = async () => {
    setLoading(true);
    try {
      const [insightText, pred] = await Promise.all([
        getFinancialInsights(transactions, budgets),
        predictNextMonthExpenses(transactions)
      ]);
      setInsights(insightText);
      setPrediction(pred);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      fetchAIContent();
    }
  }, [transactions.length]);

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase flex items-center gap-6">
            <div className="p-4 bg-[#8B0000] text-white border-2 border-black">
              <Sparkles className="w-10 h-10" />
            </div>
            AI Fiscal Intelligence
          </h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-2">Predictive analytics powered by Gemini Neural Engine</p>
        </div>
        <button 
          onClick={fetchAIContent}
          disabled={loading}
          className="neo-button neo-button-primary px-8 py-4 flex items-center gap-4"
        >
          <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
          Re-Analyze Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Prediction Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 relative overflow-hidden bg-[#8B0000] p-12 text-white border-2 border-black"
        >
          <Brain className="absolute -right-12 -top-12 w-64 h-64 text-white/5 blur-2xl" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-6">Projected Expenditure (Next Cycle)</p>
            {loading ? (
              <div className="flex flex-col gap-6 py-12">
                <Loader2 className="w-12 h-12 animate-spin text-white" />
                <span className="text-xl font-black uppercase tracking-widest">Processing Neural Patterns...</span>
              </div>
            ) : prediction ? (
              <>
                <div className="text-6xl font-black tracking-tighter mb-8">৳{prediction.predictedAmount.toLocaleString()}</div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest bg-white/10 w-fit px-6 py-3 border-2 border-white/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>{Math.round(prediction.confidence * 100)}% Confidence Rating</span>
                </div>
                <p className="mt-12 text-xs font-black uppercase tracking-widest text-white/60 leading-relaxed">
                  Historical pattern analysis indicates a high probability of this expenditure volume in the upcoming fiscal period.
                </p>
              </>
            ) : (
              <div className="py-12">
                <p className="text-white/60 font-black uppercase tracking-widest">Insufficient data for neural projection.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 -mr-16 -mt-16 rotate-45" />
          <h3 className="text-2xl font-black text-black tracking-tighter uppercase mb-10 flex items-center gap-6">
            <div className="p-4 bg-white/30 border-2 border-black">
              <Lightbulb className="w-8 h-8 text-[#8B0000]" />
            </div>
            Strategic Intelligence
          </h3>
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-black/5 border-2 border-black/10 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-black font-black leading-relaxed text-xl tracking-tight">
                {insights || "No strategic intelligence available. Continue data ingestion for personalized fiscal guidance."}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
