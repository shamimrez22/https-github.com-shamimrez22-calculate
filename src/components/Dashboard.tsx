import React, { useMemo } from 'react';
import { Transaction, Budget, UserProfile, SavingsGoal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, ArrowUpRight, ArrowDownRight, CreditCard, Activity, Target, Zap, History, Shield, Goal, LayoutGrid, BarChart3, Clock, ArrowRight, Sparkles, Bell, Search, Settings } from 'lucide-react';
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

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#64748b'];

export default function Dashboard({ transactions, budgets, goals, onAddTransaction, profile, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    
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

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-12 space-y-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#8B0000] border-2 border-black rounded-none flex items-center justify-center">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase">Command Center</h2>
            <p className="text-black/60 text-[10px] font-black uppercase tracking-widest mt-1">Operational Identity: <span className="text-black">{profile?.username}</span></p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 px-6 py-4 bg-[#D1D1D1] border-2 border-black rounded-none">
            <Search className="w-5 h-5 text-black" />
            <input type="text" placeholder="SEARCH SYSTEM..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-black placeholder-black/30 w-48" />
          </div>
          <button className="p-4 bg-white border-2 border-black rounded-none text-black hover:bg-[#8B0000] hover:text-white transition-all">
            <Bell className="w-6 h-6" />
          </button>
          <button 
            onClick={onAddTransaction}
            className="neo-button neo-button-primary px-10 py-5 flex items-center gap-4"
          >
            <Plus className="w-6 h-6" /> New Entry
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Stats & Trends */}
        <div className="lg:col-span-8 space-y-12">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Net Liquidity', value: stats.balance, icon: Wallet, color: 'text-black', bg: 'bg-white' },
              { label: 'Inbound Flow', value: stats.income, icon: ArrowUpRight, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Outbound Flow', value: stats.expenses, icon: ArrowDownRight, color: 'text-[#8B0000]', bg: 'bg-rose-50' }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-card p-10 space-y-8 transition-all relative overflow-hidden group",
                  stat.bg
                )}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className={cn("p-4 border-2 border-black bg-white", stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">{stat.label}</span>
                </div>
                <h3 className="text-5xl font-black text-black tracking-tighter relative z-10">
                  ৳{stat.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </h3>
              </motion.div>
            ))}
          </div>

          {/* Trend Chart */}
          <div className="glass-card p-12 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 -mr-16 -mt-16 rotate-45" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Fiscal Trajectory</h3>
                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Real-time neural trend analysis</p>
              </div>
              <div className="flex border-2 border-black p-1 bg-white">
                {['1M', '3M', '6M'].map(p => (
                  <button key={p} className={cn(
                    "px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all",
                    p === '6M' ? "bg-[#8B0000] text-white" : "bg-white text-black/40 hover:text-black"
                  )}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[450px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B0000" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B0000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(139,0,0,0.1)" strokeWidth={2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                    tickLine={false} 
                    tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#E8C6B0', border: '2px solid #000', borderRadius: '0px', boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#000' }}
                  />
                  <Area type="stepAfter" dataKey="income" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="stepAfter" dataKey="expense" stroke="#8B0000" strokeWidth={4} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card overflow-hidden">
            <div className="header-strip flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tighter">Transaction Buffer</h3>
              <button onClick={() => onNavigate('history')} className="text-[10px] font-black uppercase tracking-widest border-b border-white pb-0.5 hover:bg-white hover:text-[#8B0000] px-2 transition-all">Full Archive</button>
            </div>
            <div className="divide-y-2 divide-black/10">
              {recentTransactions.map((t) => (
                <div key={t.id} className="p-8 flex items-center justify-between hover:bg-white/50 transition-colors group">
                  <div className="flex items-center gap-8">
                    <div className={cn(
                      "w-14 h-14 rounded-none flex items-center justify-center border-2 border-black",
                      t.type === 'income' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-[#8B0000]"
                    )}>
                      {t.type === 'income' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="font-black text-black uppercase tracking-tighter text-xl">{t.note || t.category}</p>
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mt-1">{t.category} // {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-2xl font-black tracking-tighter",
                      t.type === 'income' ? "text-emerald-700" : "text-black"
                    )}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Allocation & Goals */}
        <div className="lg:col-span-4 space-y-12">
          {/* Allocation */}
          <div className="glass-card p-12 space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-black/5 -ml-16 -mt-16 rotate-45" />
            <h3 className="text-2xl font-black text-black uppercase tracking-tighter relative z-10">Sector Allocation</h3>
            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="#E8C6B0"
                    strokeWidth={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#E8C6B0', border: '2px solid #000', borderRadius: '0px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-5xl font-black text-black tracking-tighter">{categoryData.length}</span>
                <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Sectors</span>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              {categoryData.slice(0, 5).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between p-4 border-2 border-black/10 hover:border-black transition-all bg-white/30">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-none border-2 border-black" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black text-black uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <span className="text-base font-black text-black">৳{cat.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="glass-card p-12 space-y-12 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-black/5 -mr-16 -mt-16 rotate-45" />
            <div className="flex items-center justify-between relative z-10">
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Strategic Objectives</h3>
              <button onClick={() => onNavigate('goals')} className="text-[10px] font-black text-black uppercase tracking-widest border-b-2 border-black pb-0.5">All Goals</button>
            </div>
            <div className="space-y-10 relative z-10">
              {goals.slice(0, 3).map((goal, i) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                return (
                  <div key={goal.id} className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-black uppercase tracking-widest">{goal.name}</span>
                      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">{Math.round(progress)}% COMPLETE</span>
                    </div>
                    <div className="h-6 w-full bg-white/30 rounded-none border-2 border-black p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn("h-full bg-[#8B0000]")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-black p-4 grid grid-cols-2 gap-4 border-2 border-black">
            <button 
              onClick={() => onNavigate('settings')}
              className="flex flex-col items-center gap-4 p-8 bg-white/10 hover:bg-white group transition-all border-2 border-transparent hover:border-black"
            >
              <Settings className="w-8 h-8 text-white/40 group-hover:text-black" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-black">System Config</span>
            </button>
            <button 
              onClick={() => onNavigate('admin')}
              className="flex flex-col items-center gap-4 p-8 bg-white/10 hover:bg-white group transition-all border-2 border-transparent hover:border-black"
            >
              <Shield className="w-8 h-8 text-white/40 group-hover:text-black" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover:text-black">Security Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
