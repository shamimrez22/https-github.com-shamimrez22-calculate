import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Transaction, Category, Budget, UserSettings } from '../types';
import { Plus, Minus, X, Loader2, Calendar, Tag, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { notificationService } from '../services/notificationService';

interface TransactionFormProps {
  onClose: () => void;
  budgets: Budget[];
  transactions: Transaction[];
  settings: UserSettings;
}

const CATEGORIES: Category[] = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Salary", "Business", "Other"];

export default function TransactionForm({ onClose, budgets, transactions, settings }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const checkBudgets = async (newAmount: number, newCategory: string) => {
    if (type !== 'expense') return;

    const budget = budgets.find(b => b.category === newCategory);
    if (!budget) return;

    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === newCategory)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalSpent = spent + newAmount;
    const percent = (totalSpent / budget.limit) * 100;

    if (totalSpent > budget.limit) {
      await notificationService.sendNotification(
        'budget_exceeded',
        'Budget Exceeded! 🚨',
        `You've exceeded your ${newCategory} budget of $${budget.limit}. Total spent: $${totalSpent.toFixed(2)}`,
        settings
      );
    } else if (percent >= 80) {
      await notificationService.sendNotification(
        'budget_warning',
        'Budget Warning ⚠️',
        `You've used ${Math.round(percent)}% of your ${newCategory} budget.`,
        settings
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = storage.getCurrentUser();
    if (!profile) return;
    
    setLoading(true);
    const numAmount = parseFloat(amount);
    try {
      const data = storage.getUserData(profile.uid);
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 15),
        uid: profile.uid,
        amount: numAmount,
        type,
        category,
        date: new Date(date).toISOString(),
        note,
        createdAt: new Date().toISOString(),
      };

      storage.setUserData(profile.uid, {
        ...data,
        transactions: [newTransaction, ...data.transactions]
      });
      
      await checkBudgets(numAmount, category);
      onClose();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-md rounded-none shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-none transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-white/5 rounded-none border border-white/5">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-none transition-all ${
                type === 'expense' ? 'bg-white/10 text-rose-400 shadow-sm font-black uppercase tracking-widest text-xs' : 'text-slate-500 text-xs font-bold uppercase tracking-widest'
              }`}
            >
              <Minus className="w-4 h-4" /> Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-none transition-all ${
                type === 'income' ? 'bg-white/10 text-emerald-400 shadow-sm font-black uppercase tracking-widest text-xs' : 'text-slate-500 text-xs font-bold uppercase tracking-widest'
              }`}
            >
              <Plus className="w-4 h-4" /> Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-4 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-black text-white placeholder-slate-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-white font-bold"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-indigo-500 outline-none text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Note (Optional)</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] text-white font-medium"
                  placeholder="What was this for?"
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 rounded-none font-black uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
              type === 'expense' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save Transaction'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
