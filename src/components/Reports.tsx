import React, { useState, useMemo } from 'react';
import { Transaction, Budget, SavingsGoal } from '../types';
import { FileText, Download, TrendingUp, TrendingDown, PieChart, ArrowRight, Table, Calendar, Filter, Printer, FileSpreadsheet, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reports({ transactions, budgets, goals }: { transactions: Transaction[], budgets: Budget[], goals: SavingsGoal[] }) {
  const [filterType, setFilterType] = useState<'all' | 'month' | 'range'>('all');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dateRange, setDateRange] = useState({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') });

  const [showPreview, setShowPreview] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return transactions;
    if (filterType === 'month') {
      const start = startOfMonth(parseISO(`${selectedMonth}-01`));
      const end = endOfMonth(start);
      return transactions.filter(t => isWithinInterval(parseISO(t.date), { start, end }));
    }
    if (filterType === 'range') {
      return transactions.filter(t => isWithinInterval(parseISO(t.date), { 
        start: parseISO(dateRange.start), 
        end: parseISO(dateRange.end) 
      }));
    }
    return transactions;
  }, [transactions, filterType, selectedMonth, dateRange]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc: number, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc: number, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const liquidityRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome * 100 : 0;

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(47, 160, 132); // #2FA084
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FINTRACK AI REPORT', 20, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 32);
    doc.text(`Period: ${filterType === 'all' ? 'All Time' : filterType === 'month' ? selectedMonth : `${dateRange.start} to ${dateRange.end}`}`, 140, 32);

    // Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Financial Summary', 20, 55);
    
    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['Total Income', `৳${totalIncome.toLocaleString()}`],
        ['Total Expense', `৳${totalExpense.toLocaleString()}`],
        ['Net Savings', `৳${netSavings.toLocaleString()}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [47, 160, 132] }
    });

    // Transactions
    const lastY = Number((doc as any).lastAutoTable?.finalY || 100);
    doc.text('Transaction Details', 20, lastY + 15);
    
    autoTable(doc, {
      startY: lastY + 20,
      head: [['Date', 'Type', 'Category', 'Amount', 'Note']],
      body: filteredTransactions.map(t => [
        format(parseISO(t.date), 'yyyy-MM-dd'),
        t.type.toUpperCase(),
        t.category,
        `৳${t.amount.toLocaleString()}`,
        t.note || '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0] }
    });

    doc.save(`fintrack_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    const rows = filteredTransactions.map(t => [
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">FINANCIAL REPORTS</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">COMPREHENSIVE FISCAL ANALYSIS</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowPreview(true)}
            className="neo-button bg-white text-black px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <FileText className="w-4 h-4" /> PREVIEW REPORT
          </button>
          <button 
            onClick={exportToCSV}
            className="neo-button bg-white text-black px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <FileSpreadsheet className="w-4 h-4" /> EXPORT CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="neo-button neo-button-primary px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
          >
            <Printer className="w-4 h-4" /> DOWNLOAD PDF
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white border-4 border-black overflow-hidden flex flex-col"
            >
              <div className="bg-black text-white p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <FileText className="w-6 h-6 text-[#2FA084]" />
                  <h3 className="text-xl font-black uppercase tracking-tighter">REPORT PREVIEW</h3>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-[#F0F9F6]">
                {/* PDF-like Preview Content */}
                <div className="bg-white border-2 border-black p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-10">
                  <div className="bg-[#2FA084] p-8 -m-10 mb-10 text-white">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">FINTRACK AI REPORT</h1>
                    <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest opacity-80">
                      <span>GENERATED: {format(new Date(), 'd/M/yyyy HH:mm')}</span>
                      <span>PERIOD: {filterType === 'all' ? 'ALL TIME' : filterType === 'month' ? selectedMonth.toUpperCase() : `${dateRange.start} TO ${dateRange.end}`}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 bg-[#F0F9F6] border-2 border-black">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">INCOME</p>
                      <p className="text-2xl font-black tracking-tighter">৳{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-[#F0F9F6] border-2 border-black">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">EXPENSE</p>
                      <p className="text-2xl font-black tracking-tighter">৳{totalExpense.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-[#F0F9F6] border-2 border-black">
                      <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">SAVINGS</p>
                      <p className="text-2xl font-black tracking-tighter">৳{netSavings.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2">TRANSACTION LEDGER</h4>
                    <table className="w-full text-[10px] font-black uppercase tracking-wider">
                      <thead>
                        <tr className="border-b-2 border-black text-black/40">
                          <th className="py-3 text-left">DATE</th>
                          <th className="py-3 text-left">TYPE</th>
                          <th className="py-3 text-left">CATEGORY</th>
                          <th className="py-3 text-right">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.slice(0, 10).map((t, idx) => (
                          <tr key={idx} className="border-b border-black/5">
                            <td className="py-3">{format(parseISO(t.date), 'd/M/yyyy')}</td>
                            <td className="py-3">{t.type}</td>
                            <td className="py-3">{t.category}</td>
                            <td className="py-3 text-right">৳{t.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        {filteredTransactions.length > 10 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-black/20 italic">... AND {filteredTransactions.length - 10} MORE TRANSACTIONS</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t-4 border-black flex justify-end gap-4">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="neo-button"
                >CLOSE</button>
                <button 
                  onClick={() => {
                    exportToPDF();
                    setShowPreview(false);
                  }}
                  className="neo-button neo-button-primary"
                >DOWNLOAD PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Controls */}
      <div className="bg-white border-2 border-black p-6 flex flex-col md:flex-row gap-8 items-end">
        <div className="space-y-3 flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1 flex items-center gap-2">
            <Filter className="w-3 h-3" /> FILTER LOGIC
          </label>
          <div className="flex p-1 bg-black/5 border-2 border-black">
            <button 
              onClick={() => setFilterType('all')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                filterType === 'all' ? "bg-black text-white" : "text-black/40 hover:text-black"
              )}
            >ALL TIME</button>
            <button 
              onClick={() => setFilterType('month')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                filterType === 'month' ? "bg-black text-white" : "text-black/40 hover:text-black"
              )}
            >MONTHLY</button>
            <button 
              onClick={() => setFilterType('range')}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                filterType === 'range' ? "bg-black text-white" : "text-black/40 hover:text-black"
              )}
            >RANGE</button>
          </div>
        </div>

        {filterType === 'month' && (
          <div className="space-y-3 w-full md:w-48">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">SELECT MONTH</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="excel-input py-2.5"
            />
          </div>
        )}

        {filterType === 'range' && (
          <div className="flex gap-4 w-full md:w-auto">
            <div className="space-y-3 flex-1 md:w-40">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">START</label>
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="excel-input py-2.5"
              />
            </div>
            <div className="space-y-3 flex-1 md:w-40">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">END</label>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="excel-input py-2.5"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-[#E2E8F0] p-10 border-2 border-emerald-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-700/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Gross Revenue</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{totalIncome.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" /> Cumulative
          </div>
        </div>
        <div className="bg-[#E2E8F0] p-10 border-2 border-[#2FA084] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2FA084]/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Total Expenditure</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{totalExpense.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-[#2FA084] text-[10px] font-black uppercase tracking-widest">
            <TrendingDown className="w-4 h-4" /> Cumulative
          </div>
        </div>
        <div className="bg-[#E2E8F0] p-10 border-2 border-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Net Capital Yield</p>
          <h4 className="text-4xl font-black text-black tracking-tighter">৳{netSavings.toLocaleString()}</h4>
          <div className="mt-6 flex items-center gap-3 text-black text-[10px] font-black uppercase tracking-widest">
            <PieChart className="w-4 h-4" /> Liquidity
          </div>
        </div>
      </div>

      {/* Unique Fiscal Health Section */}
      <div className="bg-black text-white p-12 border-2 border-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#2FA084] text-white border-2 border-white">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter uppercase">Fiscal Health Index</h3>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-md">
              OUR AI ENGINE HAS ANALYZED YOUR {filteredTransactions.length} TRANSACTIONS. YOUR CURRENT LIQUIDITY RATIO IS {liquidityRatio.toFixed(1)}%.
            </p>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex-1 h-4 bg-white/10 border-2 border-white/20 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, liquidityRatio))}%` }}
                className="h-full bg-[#2FA084]"
              />
            </div>
            <span className="text-4xl font-black tracking-tighter">
              {Math.round(liquidityRatio)}%
            </span>
          </div>
        </div>
      </div>

      <section className="glass-card p-10 space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-[#2FA084] text-white border-2 border-black">
            <Table className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-black tracking-tighter uppercase">Categorical Distribution</h3>
        </div>

        <div className="space-y-8">
          {Object.entries(
            filteredTransactions.reduce((acc: Record<string, number>, t) => {
              if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
              }
              return acc;
            }, {})
          ).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).map(([cat, amount]: [string, number]) => (
            <div key={cat} className="flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-3 h-3 bg-[#8B0000] border-2 border-black" />
                <span className="text-sm font-black text-black uppercase tracking-widest">{cat}</span>
              </div>
              <div className="flex items-center gap-12">
                <span className="text-lg font-black text-black tracking-tighter">৳{amount.toLocaleString()}</span>
                <span className="text-[10px] font-black text-black/20 uppercase tracking-widest w-16 text-right">
                  {totalExpense > 0 ? Math.round((Number(amount) / Number(totalExpense)) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="glass-card p-10 space-y-8">
          <h3 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
            <FileText className="w-6 h-6 text-[#2FA084]" /> BUDGET COMPLIANCE
          </h3>
          <div className="space-y-6">
            {budgets.map(b => {
              const spent = filteredTransactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((acc, t) => acc + t.amount, 0);
              const status = spent > b.limit ? 'Over' : 'Under';
              return (
                <div key={b.id} className="flex justify-between items-center">
                  <span className="text-xs font-black text-black/40 uppercase tracking-widest">{b.category.toUpperCase()}</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 rounded-none",
                    status === 'Over' ? "bg-red-50 text-[#2FA084] border-[#2FA084]" : "bg-emerald-50 text-emerald-700 border-emerald-700"
                  )}>
                    {status.toUpperCase()} THRESHOLD
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-card p-10 space-y-8">
          <h3 className="text-xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
            <ArrowRight className="w-6 h-6 text-[#2FA084]" /> OBJECTIVE PROJECTIONS
          </h3>
          <div className="space-y-6">
            {goals.map(g => {
              const remaining = g.targetAmount - g.currentAmount;
              return (
                <div key={g.id} className="flex justify-between items-center">
                  <span className="text-xs font-black text-black/40 uppercase tracking-widest">{g.name.toUpperCase()}</span>
                  <span className="text-[10px] font-black text-black uppercase tracking-widest bg-white/30 px-3 py-1.5 border-2 border-black">
                    ৳{remaining.toLocaleString()} DEFICIT
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Excel-like Transaction Table */}
      <section className="bg-white border-2 border-black overflow-hidden">
        <div className="bg-black text-white p-4 flex items-center gap-4">
          <Table className="w-5 h-5" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Transaction Ledger (Excel View)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[10px] font-black uppercase tracking-wider">
            <thead>
              <tr className="bg-[#F0F9F6] border-b-2 border-black">
                <th className="px-4 py-3 text-left border-r-2 border-black w-12">#</th>
                <th className="px-4 py-3 text-left border-r-2 border-black">Date</th>
                <th className="px-4 py-3 text-left border-r-2 border-black">Type</th>
                <th className="px-4 py-3 text-left border-r-2 border-black">Category</th>
                <th className="px-4 py-3 text-left border-r-2 border-black">Amount</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t, idx) => (
                  <tr key={t.id || idx} className="border-b border-black/10 hover:bg-[#2FA084]/5 transition-colors">
                    <td className="px-4 py-3 border-r-2 border-black bg-[#F0F9F6] text-center">{idx + 1}</td>
                    <td className="px-4 py-3 border-r-2 border-black">{format(parseISO(t.date), 'd/M/yyyy')}</td>
                    <td className={cn(
                      "px-4 py-3 border-r-2 border-black font-black uppercase",
                      t.type === 'income' ? "text-emerald-600" : "text-[#8B0000]"
                    )}>{t.type}</td>
                    <td className="px-4 py-3 border-r-2 border-black uppercase">{t.category}</td>
                    <td className="px-4 py-3 border-r-2 border-black">৳{t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-black/40 italic uppercase">{t.note || '---'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-black/20 uppercase font-black tracking-widest">No transaction data available for this period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
