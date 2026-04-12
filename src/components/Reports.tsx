import React from 'react';
import { Transaction, Budget, SavingsGoal } from '../types';
import { FileText, Download, TrendingUp, TrendingDown, PieChart, ArrowRight, Table } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Reports({ transactions, budgets, goals }: { transactions: Transaction[], budgets: Budget[], goals: SavingsGoal[] }) {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type.toUpperCase(),
      t.category,
      t.amount.toString(),
      t.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fintrack_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Financial Reports</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Comprehensive fiscal analysis</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="neo-button neo-button-primary px-8 py-4 flex items-center gap-4"
        >
          <Download className="w-5 h-5" /> Export Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-[#D1D1D1] p-10 border-2 border-emerald-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-700/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Gross Revenue</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{totalIncome.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" /> Cumulative
          </div>
        </div>
        <div className="bg-[#D1D1D1] p-10 border-2 border-[#8B0000] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B0000]/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Total Expenditure</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{totalExpense.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-[#8B0000] text-[10px] font-black uppercase tracking-widest">
            <TrendingDown className="w-4 h-4" /> Cumulative
          </div>
        </div>
        <div className="bg-[#D1D1D1] p-10 border-2 border-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Net Capital Yield</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{netSavings.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-widest">
            <PieChart className="w-4 h-4" /> Liquidity
          </div>
        </div>
      </div>

      <section className="glass-card p-10 space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#8B0000] text-white border-2 border-black">
            <Table className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-black tracking-tighter uppercase">Categorical Distribution</h3>
        </div>

        <div className="space-y-8">
          {Object.entries(
            transactions.reduce((acc, t) => {
              if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
              }
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-3 h-3 bg-[#8B0000] border-2 border-black" />
                <span className="text-sm font-black text-black uppercase tracking-widest">{cat}</span>
              </div>
              <div className="flex items-center gap-12">
                <span className="text-lg font-black text-black tracking-tighter">৳{amount.toLocaleString()}</span>
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest w-16 text-right">
                  {Math.round((amount / totalExpense) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="glass-card p-10 space-y-8">
          <h3 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
            <FileText className="w-6 h-6 text-[#8B0000]" /> Budget Compliance
          </h3>
          <div className="space-y-6">
            {budgets.map(b => {
              const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
              const status = spent > b.limit ? 'Over' : 'Under';
              return (
                <div key={b.id} className="flex justify-between items-center">
                  <span className="text-xs font-black text-black/40 uppercase tracking-widest">{b.category}</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 rounded-none",
                    status === 'Over' ? "bg-red-50 text-[#8B0000] border-[#8B0000]" : "bg-emerald-50 text-emerald-700 border-emerald-700"
                  )}>
                    {status} Threshold
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-card p-10 space-y-8">
          <h3 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
            <ArrowRight className="w-6 h-6 text-[#8B0000]" /> Objective Projections
          </h3>
          <div className="space-y-6">
            {goals.map(g => {
              const remaining = g.targetAmount - g.currentAmount;
              return (
                <div key={g.id} className="flex justify-between items-center">
                  <span className="text-xs font-black text-black/40 uppercase tracking-widest">{g.name}</span>
                  <span className="text-[10px] font-black text-black uppercase tracking-widest bg-white/30 px-3 py-1.5 border-2 border-black">
                    ৳{remaining.toLocaleString()} Deficit
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
