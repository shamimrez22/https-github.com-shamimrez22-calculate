import React, { useMemo, useState } from 'react';
import { Transaction, Budget, UserProfile, SavingsGoal, Task, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Target, Zap, History, Shield, Goal, LayoutGrid, BarChart3, Clock, ArrowRight, Sparkles, Bell, Search, Settings, ListTodo, MoreVertical, PlusSquare, Banknote, Receipt, Wallet2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import TransactionForm from './TransactionForm';
import { storage } from '../lib/storage';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  tasks: Task[];
  onAddTransaction: () => void;
  profile: UserProfile | null;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ transactions, budgets, goals, tasks, onAddTransaction, profile, onNavigate }: DashboardProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState<'income' | 'expense' | 'savings' | null>(null);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions]);

  const taskStats = useMemo(() => {
    const today = new Date().toDateString();
    const pending = tasks.filter(t => !t.completed).length;
    const completedToday = tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === today).length;
    return { pending, completedToday };
  }, [tasks]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 space-y-6">
      {/* Ultra-Compact Status Bar - Refined to match image */}
      <div className="bg-black text-white px-4 md:px-8 py-4 border-2 border-black flex items-center justify-between sticky top-0 z-30 pl-20 md:pl-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#2FA084] border border-white/20 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-none truncate">Operational Hub</h2>
            <p className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] mt-1 opacity-50 truncate">Active Session: {profile?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-8">
          <div className="relative">
            <button 
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="p-2 bg-[#2FA084] text-white hover:bg-black transition-all border border-white/20 flex items-center gap-2"
            >
              <PlusSquare className="w-5 h-5" />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Quick Entry</span>
            </button>

            <AnimatePresence>
              {showQuickMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 overflow-hidden"
                  >
                    <button 
                      onClick={() => { setQuickEntryType('income'); setShowQuickMenu(false); }}
                      className="w-full p-4 flex items-center gap-4 hover:bg-[#F0F9F6] transition-all border-b border-black/10 group"
                    >
                      <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:border-emerald-700 transition-all">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Income Entry</span>
                    </button>
                    <button 
                      onClick={() => { setQuickEntryType('expense'); setShowQuickMenu(false); }}
                      className="w-full p-4 flex items-center gap-4 hover:bg-rose-50 transition-all border-b border-black/10 group"
                    >
                      <div className="p-2 bg-rose-50 text-rose-700 border border-rose-200 group-hover:border-rose-700 transition-all">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Expense Entry</span>
                    </button>
                    <button 
                      onClick={() => { setQuickEntryType('savings'); setShowQuickMenu(false); }}
                      className="w-full p-4 flex items-center gap-4 hover:bg-blue-50 transition-all group"
                    >
                      <div className="p-2 bg-blue-50 text-blue-700 border border-blue-200 group-hover:border-blue-700 transition-all">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">Savings Entry</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest opacity-40">Liquidity</p>
            <p className="text-sm md:text-xl font-black tracking-tight">৳{stats.balance.toLocaleString()}</p>
          </div>
          <div className="sm:hidden text-right">
            <p className="text-[10px] font-black tracking-tight">৳{stats.balance.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => onNavigate('settings')}
            className="p-2 hover:bg-white/10 transition-all border border-white/10"
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        {/* Left Section */}
        <div className="md:col-span-8 space-y-4 md:space-y-6">
          {/* Main Action Card - Refined to match image */}
          <div className="bg-white border-2 border-black p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-none">Daily Log <br className="hidden md:block" /> Interface</h3>
              <p className="text-[8px] md:text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-4">Record your fiscal and operational data points</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button 
                onClick={onAddTransaction}
                className="flex-1 bg-[#2FA084] text-white px-8 md:px-12 py-4 md:py-6 font-black uppercase tracking-widest text-[10px] md:text-xs border-2 border-black hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                Log Transaction
              </button>
              <button 
                onClick={() => onNavigate('tasks')}
                className="flex-1 bg-black text-white px-8 md:px-12 py-4 md:py-6 font-black uppercase tracking-widest text-[10px] md:text-xs border-2 border-black hover:bg-[#2FA084] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
              >
                New Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {/* Task Buffer - Refined to match image */}
            <div className="bg-white border-2 border-black overflow-hidden flex flex-col">
              <div className="bg-black text-white px-3 md:px-6 py-3 font-black uppercase tracking-widest text-[7px] md:text-[10px] flex justify-between items-center">
                <span className="truncate">Task Buffer</span>
                <ListTodo className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="p-3 md:p-8 flex-1 flex flex-col justify-between gap-4 md:gap-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                  <div>
                    <p className="text-xl md:text-5xl font-black text-black leading-none">{taskStats.pending.toString().padStart(2, '0')}</p>
                    <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-black/40 mt-1 md:mt-2">Pending</p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-xl md:text-5xl font-black text-emerald-700 leading-none">{taskStats.completedToday.toString().padStart(2, '0')}</p>
                    <p className="text-[6px] md:text-[9px] font-black uppercase tracking-widest text-black/40 mt-1 md:mt-2">Done</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('tasks')}
                  className="w-full py-2 md:py-4 bg-[#E2E8F0] border-2 border-black text-[8px] md:text-[11px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                >
                  Access
                </button>
              </div>
            </div>

            {/* Fiscal Summary - Refined to match image */}
            <div className="bg-white border-2 border-black overflow-hidden flex flex-col">
              <div className="bg-[#2FA084] text-white px-3 md:px-6 py-3 font-black uppercase tracking-widest text-[7px] md:text-[10px] flex justify-between items-center">
                <span className="truncate">Fiscal Summary</span>
                <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className="p-3 md:p-8 flex-1 flex flex-col justify-between gap-4 md:gap-6">
                <div className="space-y-2 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-black/40">In</span>
                    <span className="font-black text-emerald-700 text-xs md:text-2xl">৳{stats.income.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] md:text-[10px] font-black uppercase tracking-widest text-black/40">Out</span>
                    <span className="font-black text-[#2FA084] text-xs md:text-2xl">৳{stats.expenses.toLocaleString()}</span>
                  </div>
                </div>
                <div className="pt-2 md:pt-6 border-t-2 border-black flex justify-between items-center">
                  <span className="text-[7px] md:text-[11px] font-black uppercase tracking-widest text-black">Net</span>
                  <span className="text-sm md:text-4xl font-black text-black">৳{stats.balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:col-span-4 space-y-4 md:space-y-6">
          {/* AI Insight Overlay - Refined to match image */}
          <div className="bg-black text-white p-8 md:p-10 space-y-8 border-2 border-black relative overflow-hidden h-full flex flex-col justify-between">
            <Sparkles className="absolute -right-8 -top-8 w-32 h-32 text-white/5" />
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">AI Intelligence</h3>
              <p className="text-[10px] md:text-xs font-black text-white/40 leading-relaxed uppercase tracking-widest italic">
                "System analysis indicates a 12% reduction in non-essential expenditure vectors this cycle."
              </p>
            </div>
            <button 
              onClick={() => onNavigate('ai')}
              className="relative z-10 w-full py-4 bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-[#2FA084] hover:text-white transition-all border-2 border-white"
            >
              Access Advisor
            </button>
          </div>

          {/* Strategic Objectives - Refined to match image */}
          <div className="bg-white border-2 border-black p-8 md:p-10 space-y-10">
            <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter">Strategic Objectives</h3>
            <div className="space-y-8">
              {goals.slice(0, 3).map((goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] md:text-xs font-black text-black uppercase tracking-widest truncate max-w-[150px]">{goal.name}</span>
                      <span className="text-[9px] md:text-[11px] font-black text-black/40 uppercase tracking-widest">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-[#E2E8F0] border-2 border-black p-0.5">
                      <div 
                        className="h-full bg-[#2FA084]" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {quickEntryType && (
          <TransactionForm 
            onClose={() => setQuickEntryType(null)}
            budgets={budgets}
            transactions={transactions}
            settings={storage.getUserData(profile?.uid || '').settings}
            initialType={quickEntryType === 'savings' ? 'expense' : quickEntryType}
            initialCategory={quickEntryType === 'savings' ? 'Savings' as Category : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
