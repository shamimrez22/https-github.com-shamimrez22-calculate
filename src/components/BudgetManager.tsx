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
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Budget Management</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Set and monitor strategic spending limits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Add Budget Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-10 sticky top-8">
            <h3 className="text-xl font-black text-black mb-10 flex items-center gap-4 uppercase tracking-tighter">
              <div className="p-2 bg-[#2FA084] text-white border-2 border-black">
                <Plus className="w-6 h-6" />
              </div>
              New Limit
            </h3>
            <form onSubmit={handleAddBudget} className="space-y-8">
              <div className="space-y-3">
                <label className="excel-label ml-1">Sector</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="excel-input"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-white">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="excel-label ml-1">Monthly Threshold (৳)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black font-black text-xl">৳</span>
                  <input 
                    type="number" 
                    required
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-2xl tracking-tighter"
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="neo-button neo-button-primary w-full py-5 flex items-center justify-center gap-4"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Target className="w-6 h-6" />
                    Initialize Budget
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Budget List */}
        <div className="lg:col-span-2 space-y-8">
          {budgets.length === 0 ? (
            <div className="glass-card p-32 text-center">
              <div className="w-24 h-24 bg-white/30 rounded-none flex items-center justify-center mx-auto mb-8 border-2 border-black">
                <Target className="w-12 h-12 text-black/20" />
              </div>
              <p className="text-black/40 font-black uppercase tracking-widest">No strategic limits defined</p>
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
                  className="glass-card p-10 group relative overflow-hidden"
                >
                  {isOver && <div className="absolute top-0 left-0 w-2 h-full bg-[#2FA084]" />}
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-black tracking-tighter uppercase">{budget.category}</h4>
                      <div className="flex items-center gap-6">
                        <span className="text-black/40 text-[10px] font-black uppercase tracking-widest">Utilized: <strong className="text-black">৳{spent.toLocaleString()}</strong></span>
                        <div className="w-1.5 h-1.5 bg-black rounded-none" />
                        <span className="text-black/40 text-[10px] font-black uppercase tracking-widest">Threshold: <strong className="text-black">৳{budget.limit.toLocaleString()}</strong></span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <span className={cn(
                        "px-4 py-1.5 rounded-none text-[10px] font-black tracking-widest uppercase border-2",
                        percent >= 90 ? "bg-rose-50 text-[#2FA084] border-[#2FA084]" : "bg-white text-black border-black"
                      )}>
                        {Math.round(percent)}% UTILIZED
                      </span>
                      <button 
                        onClick={() => budget.id && handleDelete(budget.id)}
                        className="p-3 text-black/20 hover:text-[#2FA084] hover:bg-white border-2 border-transparent hover:border-black rounded-none transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-6 bg-white/30 rounded-none border-2 border-black p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full rounded-none transition-all duration-1000",
                          percent >= 90 ? "bg-[#2FA084]" : "bg-black"
                        )}
                      />
                    </div>
                    {isOver && (
                      <div className="p-4 bg-rose-50 border-2 border-[#2FA084] text-[10px] font-black text-[#2FA084] uppercase tracking-widest flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        Critical: Threshold exceeded by ৳{(spent - budget.limit).toLocaleString()}
                      </div>
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
