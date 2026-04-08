import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Subscription } from '../types';
import { CreditCard, Plus, Calendar, Trash2, Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SubscriptionTracker({ subscriptions }: { subscriptions: Subscription[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [loading, setLoading] = useState(false);

  const currentUser = storage.getCurrentUser();

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    const newSub: Subscription = {
      id: Math.random().toString(36).substring(2, 15),
      uid: currentUser.uid,
      name,
      amount: parseFloat(amount),
      frequency,
      nextBillingDate,
      category,
      active: true,
      createdAt: new Date().toISOString()
    };

    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      subscriptions: [...(userData.subscriptions || []), newSub]
    });

    setLoading(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteSubscription = (id: string) => {
    if (!currentUser) return;
    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      subscriptions: userData.subscriptions.filter((s: Subscription) => s.id !== id)
    });
  };

  const toggleSubscriptionStatus = (id: string) => {
    if (!currentUser) return;
    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      subscriptions: userData.subscriptions.map((s: Subscription) => 
        s.id === id ? { ...s, active: !s.active } : s
      )
    });
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setFrequency('monthly');
    setNextBillingDate('');
    setCategory('Entertainment');
  };

  const totalMonthly = subscriptions
    .filter(s => s.active)
    .reduce((acc, s) => acc + (s.frequency === 'monthly' ? s.amount : s.amount / 12), 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Subscriptions</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Manage your recurring expenses</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Subscription
        </button>
      </div>

      {/* Summary Card */}
      <div className="glass-card p-8 border-l-4 border-l-indigo-500 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-500/10 text-indigo-400">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Monthly Cost</p>
            <h4 className="text-4xl font-black text-white">${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 border-r border-white/10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active</p>
            <p className="text-xl font-black text-white">{subscriptions.filter(s => s.active).length}</p>
          </div>
          <div className="text-center px-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paused</p>
            <p className="text-xl font-black text-slate-500">{subscriptions.filter(s => !s.active).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.length === 0 ? (
          <div className="lg:col-span-3 glass-card p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mx-auto border border-white/10">
              <CreditCard className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No subscriptions tracked yet.</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <motion.div 
              key={sub.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-card p-6 space-y-6 relative group transition-all ${!sub.active ? 'opacity-50 grayscale' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{sub.category}</p>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{sub.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => toggleSubscriptionStatus(sub.id)}
                    className={`p-2 transition-colors ${sub.active ? 'text-slate-600 hover:text-amber-400' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                    title={sub.active ? "Pause Subscription" : "Resume Subscription"}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-black text-white">${sub.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">per {sub.frequency === 'monthly' ? 'month' : 'year'}</p>
                </div>
                {!sub.active && (
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-1">Paused</span>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-3 text-slate-500">
                <Calendar className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Next Billing</p>
                  <p className="text-xs font-black text-white">{new Date(sub.nextBillingDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Add Subscription</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddSubscription} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Service Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G., NETFLIX, SPOTIFY, ADOBE"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold uppercase tracking-widest text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Amount</label>
                    <input 
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Frequency</label>
                    <select 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs uppercase tracking-widest"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Next Billing Date</label>
                    <input 
                      type="date"
                      required
                      value={nextBillingDate}
                      onChange={(e) => setNextBillingDate(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs uppercase tracking-widest"
                    >
                      <option value="Entertainment">Entertainment</option>
                      <option value="Software">Software</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-5 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Add Subscription'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
