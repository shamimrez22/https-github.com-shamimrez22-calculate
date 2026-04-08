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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-none">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            AI Financial Assistant
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Smart predictions and insights powered by Gemini AI</p>
        </div>
        <button 
          onClick={fetchAIContent}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-none text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn("w-5 h-5 text-indigo-400", loading && "animate-spin")} />
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Prediction Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-1 relative overflow-hidden rounded-none bg-gradient-to-br from-indigo-600 to-violet-800 p-10 text-white shadow-2xl shadow-indigo-500/20"
        >
          <Brain className="absolute -right-8 -top-8 w-48 h-48 text-white/10 blur-xl" />
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-4">Next Month Prediction</h3>
            {loading ? (
              <div className="flex flex-col gap-4 py-8">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-200" />
                <span className="text-lg font-bold text-indigo-100">Analyzing patterns...</span>
              </div>
            ) : prediction ? (
              <>
                <div className="text-5xl font-black tracking-tighter mb-6">${prediction.predictedAmount.toLocaleString()}</div>
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-white/10 w-fit px-4 py-2 rounded-none border border-white/10">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{Math.round(prediction.confidence * 100)}% Confidence</span>
                </div>
                <p className="mt-10 text-sm font-medium text-indigo-100/70 leading-relaxed">
                  Based on your spending history, AI predicts your expenses will be around this amount next month.
                </p>
              </>
            ) : (
              <div className="py-10">
                <p className="text-indigo-100/60 font-bold">Add more transactions for a prediction.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Insights Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-10"
        >
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8 flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-none">
              <Lightbulb className="w-6 h-6 text-amber-400" />
            </div>
            Smart Insights
          </h3>
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-none animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-slate-400 font-medium leading-relaxed text-lg">
                {insights || "No insights available yet. Keep tracking your expenses to get personalized financial advice!"}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
