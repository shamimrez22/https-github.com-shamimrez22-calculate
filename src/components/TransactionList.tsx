import React, { useState } from 'react';
import { Transaction } from '../types';
import { Search, ArrowUpRight, ArrowDownLeft, Download, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { format } from 'date-fns';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../lib/utils';
import ConfirmationModal from './ConfirmationModal';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (t.note?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    const profile = storage.getCurrentUser();
    if (!profile) return;
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
      `৳${t.amount.toFixed(2)}`,
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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Transaction History</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Audit and export financial records</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={exportCSV} className="neo-button flex items-center gap-3">
            <Download className="w-4 h-4" /> CSV EXPORT
          </button>
          <button onClick={exportPDF} className="neo-button neo-button-primary flex items-center gap-3">
            <Download className="w-4 h-4" /> PDF REPORT
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b-2 border-[#2FA084] bg-white/30 space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="FILTER BY CATEGORY OR NOTE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="excel-input pl-12"
              />
            </div>
            <div className="flex p-1 bg-white border-2 border-black rounded-none">
              {(['all', 'income', 'expense'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition-all",
                    filterType === type 
                      ? 'bg-[#2FA084] text-white' 
                      : 'text-black/40 hover:text-black'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-white text-[10px] font-black uppercase tracking-widest border-b-2 border-black bg-[#2FA084]">
                <th className="px-10 py-4">Timestamp</th>
                <th className="px-10 py-4">Sector</th>
                <th className="px-10 py-4">Description</th>
                <th className="px-10 py-4 text-right">Value</th>
                <th className="px-10 py-4 text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-white/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-10 h-10 rounded-none flex items-center justify-center border-2 border-black",
                        t.type === 'income' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-[#2FA084]"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-black text-black uppercase tracking-tight">{format(new Date(t.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-widest border-2 border-black bg-white",
                      t.type === 'income' ? "text-emerald-700" : "text-black"
                    )}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-sm text-black/60 font-bold uppercase tracking-tight truncate max-w-[250px] block">{t.note || '-'}</span>
                  </td>
                  <td className={cn(
                    "px-10 py-6 text-right font-black text-2xl tracking-tighter",
                    t.type === 'income' ? "text-emerald-700" : "text-black"
                  )}>
                    {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button 
                      onClick={() => t.id && setDeleteId(t.id)}
                      className="p-3 text-black/30 hover:text-[#2FA084] hover:bg-white border-2 border-transparent hover:border-black rounded-none transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-white/30 rounded-none flex items-center justify-center border-2 border-black">
                        <Search className="w-10 h-10 text-black/20" />
                      </div>
                      <p className="text-black/40 font-black uppercase tracking-widest">No records found in system</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Confirm Deletion"
        message="Are you sure you want to purge this transaction record? This action is irreversible."
        confirmLabel="Purge"
        cancelLabel="Abort"
      />
    </div>
  );
}
