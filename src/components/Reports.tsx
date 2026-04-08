import React from 'react';
import { Transaction, Budget, SavingsGoal } from '../types';
import { FileText, Download, TrendingUp, TrendingDown, PieChart, ArrowRight, Table } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Financial Reports</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Deep dive into your financial health</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 border-l-4 border-l-emerald-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Income</p>
          <h4 className="text-3xl font-black text-white">${totalIncome.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="w-3 h-3" /> All Time
          </div>
        </div>
        <div className="glass-card p-8 border-l-4 border-l-rose-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Expenses</p>
          <h4 className="text-3xl font-black text-white">${totalExpense.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-rose-400 text-[10px] font-black uppercase tracking-widest">
            <TrendingDown className="w-3 h-3" /> All Time
          </div>
        </div>
        <div className="glass-card p-8 border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Savings</p>
          <h4 className="text-3xl font-black text-white">${netSavings.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <PieChart className="w-3 h-3" /> Cash Flow
          </div>
        </div>
      </div>

      <section className="glass-card p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400">
            <Table className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Summary by Category</h3>
        </div>

        <div className="space-y-6">
          {Object.entries(
            transactions.reduce((acc, t) => {
              if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
              }
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-none" />
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{cat}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-sm font-black text-white">${amount.toLocaleString()}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest w-12 text-right">
                  {Math.round((amount / totalExpense) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="glass-card p-8 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Budget Adherence
          </h3>
          <div className="space-y-4">
            {budgets.map(b => {
              const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
              const status = spent > b.limit ? 'Over' : 'Under';
              return (
                <div key={b.id} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">{b.category}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${status === 'Over' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {status} Budget
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-card p-8 space-y-6">
          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-indigo-400" /> Goal Projections
          </h3>
          <div className="space-y-4">
            {goals.map(g => {
              const remaining = g.targetAmount - g.currentAmount;
              return (
                <div key={g.id} className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">{g.name}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    ${remaining.toLocaleString()} Left
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
