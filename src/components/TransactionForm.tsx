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
        `You've exceeded your ${newCategory} budget of ৳${budget.limit}. Total spent: ৳${totalSpent.toFixed(2)}`,
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
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-[#E8C6B0] w-full max-w-lg rounded-none overflow-hidden border-2 border-black"
      >
        <div className="p-8 border-b-2 border-black flex justify-between items-center bg-[#8B0000] text-white">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tighter uppercase">New Entry</h2>
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Financial System Input</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-none transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Type Toggle */}
          <div className="flex p-1 bg-black/5 border-2 border-black rounded-none">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-none transition-all ${
                type === 'expense' ? 'bg-[#8B0000] text-white font-black text-[10px] uppercase tracking-widest' : 'text-black/40 text-[10px] font-black uppercase tracking-widest'
              }`}
            >
              <Minus className="w-4 h-4" /> Debit
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-none transition-all ${
                type === 'income' ? 'bg-[#8B0000] text-white font-black text-[10px] uppercase tracking-widest' : 'text-black/40 text-[10px] font-black uppercase tracking-widest'
              }`}
            >
              <Plus className="w-4 h-4" /> Credit
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Transaction Value</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-black font-black text-2xl">৳</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="excel-input pl-14 text-4xl"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Sector</label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black w-5 h-5" />
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="excel-input pl-12 appearance-none text-xs"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Timestamp</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black w-5 h-5" />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="excel-input pl-12 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Audit Note</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-5 text-black/40 group-focus-within:text-black w-5 h-5" />
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="excel-input pl-12 min-h-[120px] text-sm py-4"
                  placeholder="ENTER AUDIT DETAILS..."
                />
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="neo-button neo-button-primary w-full py-6 flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Commit Transaction'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
