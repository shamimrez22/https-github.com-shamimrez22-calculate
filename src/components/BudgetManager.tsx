import React, { useState } from 'react';
import { Budget, Category, Transaction } from '../types';
import { storage } from '../lib/storage';
import { Target, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
}

const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];

export default function BudgetManager({ budgets, transactions }: BudgetManagerProps) {
  const [category, setCategory] = useState<Category>('Food');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = storage.getCurrentUser();
    if (!profile) return;
    
    setLoading(true);
    try {
      const data = storage.getUserData(profile.uid);
      const newBudget: Budget = {
        id: Math.random().toString(36).substring(2, 15),
        uid: profile.uid,
        category,
        limit: parseFloat(limit),
        period: 'monthly'
      };
      storage.setUserData(profile.uid, {
        ...data,
        budgets: [...data.budgets, newBudget]
      });
      setLimit('');
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const profile = storage.getCurrentUser();
    if (!profile) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        budgets: data.budgets.filter(b => b.id !== id)
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Budget Management</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Set and monitor your monthly spending limits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Add Budget Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-none">
                <Plus className="w-5 h-5 text-indigo-400" />
              </div>
              New Budget
            </h3>
            <form onSubmit={handleAddBudget} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Monthly Limit ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <input 
                    type="number" 
                    required
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Target className="w-5 h-5" />
                    Set Budget
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Budget List */}
        <div className="lg:col-span-2 space-y-6">
          {budgets.length === 0 ? (
            <div className="glass-card p-20 text-center">
              <div className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-slate-700" />
              </div>
              <p className="text-slate-500 font-bold">No budgets set yet. Start tracking your limits!</p>
            </div>
          ) : (
            budgets.map(budget => {
              const spent = transactions
                .filter(t => t.type === 'expense' && t.category === budget.category)
                .reduce((acc, t) => acc + t.amount, 0);
              const percent = Math.min((spent / budget.limit) * 100, 100);
              const isOver = spent > budget.limit;
              
              return (
                <motion.div 
                  layout
                  key={budget.id} 
                  className="glass-card p-8 group relative overflow-hidden"
                >
                  {isOver && <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />}
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-white uppercase tracking-wider">{budget.category}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm font-medium">Spent: <strong className="text-white">${spent.toLocaleString()}</strong></span>
                        <div className="w-1 h-1 bg-slate-700 rounded-none" />
                        <span className="text-slate-500 text-sm font-medium">Limit: <strong className="text-slate-400">${budget.limit.toLocaleString()}</strong></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-none text-xs font-black tracking-widest uppercase",
                        percent >= 90 ? "bg-rose-500/20 text-rose-400" : percent >= 75 ? "bg-amber-500/20 text-amber-400" : "bg-indigo-500/20 text-indigo-400"
                      )}>
                        {Math.round(percent)}%
                      </span>
                      <button 
                        onClick={() => budget.id && handleDelete(budget.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-none transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 bg-white/5 rounded-none overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full rounded-none transition-all duration-1000",
                          percent >= 90 ? "bg-rose-500" : percent >= 75 ? "bg-amber-500" : "bg-indigo-500"
                        )}
                      />
                    </div>
                    {isOver && (
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Budget Exceeded by ${(spent - budget.limit).toLocaleString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
