import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, ArrowUpRight, ArrowDownLeft, Download, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { format } from 'date-fns';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    const profile = storage.getCurrentUser();
    if (!profile || !window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        transactions: data.transactions.filter(t => t.id !== id)
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  const exportCSV = () => {
    const data = filteredTransactions.map(t => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Note: t.note || ''
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Transaction History', 14, 15);
    const tableData = filteredTransactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type.toUpperCase(),
      t.category,
      `$${t.amount.toFixed(2)}`,
      t.note || ''
    ]);
    (doc as any).autoTable({
      head: [['Date', 'Type', 'Category', 'Amount', 'Note']],
      body: tableData,
      startY: 20,
    });
    doc.save(`transactions_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Transaction History</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage and export your financial records</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-none text-sm font-bold text-white hover:bg-white/10 transition-all">
            <Download className="w-4 h-4 text-indigo-400" /> CSV
          </button>
          <button onClick={exportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-none text-sm font-bold text-white hover:bg-white/10 transition-all">
            <Download className="w-4 h-4 text-violet-400" /> PDF
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by category or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex p-1.5 bg-white/5 rounded-none border border-white/5">
              {(['all', 'income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all ${
                    filterType === type 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Note</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-none flex items-center justify-center",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-bold text-slate-300">{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white uppercase tracking-wider">{t.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-medium truncate max-w-[200px] block">{t.note || '-'}</span>
                  </td>
                  <td className={cn(
                    "px-8 py-6 text-right font-black text-lg",
                    t.type === 'income' ? "text-emerald-400" : "text-white"
                  )}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => t.id && handleDelete(t.id)}
                      className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-none transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-none flex items-center justify-center">
                        <Search className="w-8 h-8 text-slate-700" />
                      </div>
                      <p className="text-slate-500 font-bold">No transactions found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
