import React, { useMemo } from 'react';
import { Transaction, Budget, UserProfile, SavingsGoal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Target, Zap, History, Shield, Goal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  onAddTransaction: () => void;
  profile: UserProfile | null;
  onNavigate: (tab: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];

export default function Dashboard({ transactions, budgets, goals, onAddTransaction, profile, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    
    // Calculate growth (mocked for now based on recent transactions)
    const recentIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((acc, t) => acc + t.amount, 0);
    const growth = income > 0 ? (recentIncome / income) * 100 : 0;

    return { income, expenses, balance, growth };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { income: number, expense: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    last6Months.forEach(m => months[m] = { income: 0, expense: 0 });

    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (months[month]) {
        if (t.type === 'income') months[month].income += t.amount;
        else months[month].expense += t.amount;
      }
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [transactions]);

  const budgetAlerts = useMemo(() => {
    return budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...b, spent, percent: (spent / b.limit) * 100 };
    }).filter(b => b.percent >= 70).sort((a, b) => b.percent - a.percent);
  }, [transactions, budgets]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-none bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-none blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-none blur-3xl -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-100 font-bold uppercase tracking-[0.2em] text-xs">
              <Zap className="w-4 h-4 fill-current" />
              Financial Overview
            </div>
            <div className="space-y-1">
              <p className="text-indigo-100/70 font-medium">Total Net Worth</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
                ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-none text-sm font-bold backdrop-blur-md border border-white/10">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">+{stats.growth.toFixed(1)}%</span>
                <span className="opacity-60 font-medium ml-1">this month</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-none border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Income</span>
              </div>
              <p className="text-xl font-bold">${stats.income.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-none border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-rose-300">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Expenses</span>
              </div>
              <p className="text-xl font-bold">${stats.expenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Spending Flow
                </h3>
                <select className="bg-white/5 border border-white/10 rounded-none text-xs px-2 py-1 outline-none text-slate-400">
                  <option>Last 6 Months</option>
                </select>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <h3 className="font-bold text-white flex items-center gap-2 mb-8">
                <PieChart className="w-5 h-5 text-violet-400" />
                Category Split
              </h3>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <section className="glass-card overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Recent Activity
              </h3>
              <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">View All</button>
            </div>
            <div className="divide-y divide-white/5">
              {recentTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-medium">No recent transactions</div>
              ) : (
                recentTransactions.map((t) => (
                  <div key={t.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-none flex items-center justify-center text-xl font-bold",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.category[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{t.note || t.category}</p>
                        <p className="text-xs text-slate-500 font-medium">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {t.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-black text-lg",
                        t.type === 'income' ? "text-emerald-400" : "text-white"
                      )}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <section className="glass-card p-8 space-y-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className="w-full flex items-center gap-4 p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-none font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm">Admin Control</p>
                    <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Manage System</p>
                  </div>
                </button>
              )}
              <button 
                onClick={onAddTransaction}
                className="w-full flex items-center gap-4 p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-none font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <div className="w-10 h-10 bg-white/20 rounded-none flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span>Add Transaction</span>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-none font-bold transition-all border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center">
                  <Target className="w-6 h-6 text-violet-400" />
                </div>
                <span>Set New Budget</span>
              </button>
              <button className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 text-white rounded-none font-bold transition-all border border-white/5">
                <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-emerald-400" />
                </div>
                <span>Manage Cards</span>
              </button>
            </div>
          </section>

          {/* Savings Goals Summary */}
          <section className="glass-card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Goal className="w-5 h-5 text-indigo-400" />
                Savings Progress
              </h3>
              <button 
                onClick={() => onNavigate('goals')}
                className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300"
              >
                View All
              </button>
            </div>
            <div className="space-y-6">
              {goals.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium text-center py-4">No savings goals set</p>
              ) : (
                goals.slice(0, 2).map(goal => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  return (
                    <div key={goal.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{goal.name}</p>
                          <p className="font-bold text-white">${goal.currentAmount.toLocaleString()} <span className="text-slate-500 font-medium text-xs">/ ${goal.targetAmount.toLocaleString()}</span></p>
                        </div>
                        <span className="text-xs font-black text-indigo-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-none overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-indigo-500 rounded-none"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Budget Progress */}
          <section className="glass-card p-8 space-y-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-400" />
              Budget Watch
            </h3>
            <div className="space-y-6">
              {budgets.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium text-center py-4">No budgets set yet</p>
              ) : (
                budgets.slice(0, 3).map(b => {
                  const spent = transactions
                    .filter(t => t.type === 'expense' && t.category === b.category)
                    .reduce((acc, t) => acc + t.amount, 0);
                  const percent = Math.min((spent / b.limit) * 100, 100);
                  return (
                    <div key={b.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">{b.category}</p>
                          <p className="font-bold text-white">${spent.toLocaleString()} <span className="text-slate-500 font-medium text-xs">/ ${b.limit.toLocaleString()}</span></p>
                        </div>
                        <span className={cn(
                          "text-xs font-black px-2 py-1 rounded-none",
                          percent > 90 ? "bg-rose-500/20 text-rose-400" : "bg-indigo-500/20 text-indigo-400"
                        )}>{Math.round(percent)}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-none overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={cn(
                            "h-full rounded-none",
                            percent > 90 ? "bg-rose-500" : "bg-indigo-500"
                          )}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button 
        onClick={onAddTransaction}
        className="fixed bottom-24 right-6 md:hidden w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-none shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-4 border-black"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
