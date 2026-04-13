import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Subscription } from '../types';
import { CreditCard, Plus, Calendar, Trash2, Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Subscriptions</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Recurring obligation management</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="neo-button neo-button-primary px-8 py-4 flex items-center gap-4"
        >
          <Plus className="w-5 h-5" /> Add Recurring
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#E2E8F0] p-10 border-2 border-black flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-black/5 -ml-16 -mt-16 rotate-45" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="p-5 bg-[#2FA084] text-white border-2 border-black">
            <RefreshCw className="w-10 h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Total Monthly Obligation</p>
            <h4 className="text-5xl font-black text-black tracking-tighter">৳{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
        </div>
        <div className="flex gap-8 relative z-10">
          <div className="text-center px-8 border-r-2 border-black/10">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Active</p>
            <p className="text-3xl font-black text-black tracking-tighter">{subscriptions.filter(s => s.active).length}</p>
          </div>
          <div className="text-center px-8">
            <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Paused</p>
            <p className="text-3xl font-black text-black/20 tracking-tighter">{subscriptions.filter(s => !s.active).length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {subscriptions.length === 0 ? (
          <div className="lg:col-span-3 glass-card p-32 text-center space-y-8">
            <div className="w-24 h-24 bg-white/30 rounded-none flex items-center justify-center mx-auto border-2 border-black">
              <CreditCard className="w-12 h-12 text-black/20" />
            </div>
            <p className="text-black/40 font-black uppercase tracking-widest">No recurring obligations tracked</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <motion.div 
              key={sub.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "glass-card p-8 space-y-8 relative group transition-all",
                !sub.active ? "opacity-50 grayscale" : ""
              )}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{sub.category}</p>
                  <h3 className="text-xl font-black text-black tracking-tighter uppercase">{sub.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleSubscriptionStatus(sub.id)}
                    className={cn(
                      "p-3 transition-all border-2 rounded-none",
                      sub.active ? "text-black/40 border-transparent hover:text-black hover:border-black" : "text-emerald-700 border-emerald-700 bg-emerald-50"
                    )}
                    title={sub.active ? "Pause Obligation" : "Resume Obligation"}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="p-3 text-black/40 hover:text-[#2FA084] hover:bg-red-50 border-2 border-transparent hover:border-black rounded-none transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-black tracking-tighter">৳{sub.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mt-1">per {sub.frequency === 'monthly' ? 'month' : 'year'}</p>
                </div>
                {!sub.active && (
                  <span className="text-[10px] font-black text-[#2FA084] uppercase tracking-widest bg-red-50 px-3 py-1.5 border-2 border-[#2FA084] rounded-none">Paused</span>
                )}
              </div>

              <div className="pt-6 border-t-2 border-black/10 flex items-center gap-4 text-black/40">
                <Calendar className="w-5 h-5 text-black" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest">Next Billing Cycle</p>
                  <p className="text-xs font-black text-black uppercase tracking-widest mt-1">{new Date(sub.nextBillingDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#F0F9F6] rounded-none p-12 space-y-10 border-2 border-black"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Add Recurring</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/50 rounded-none transition-colors border-2 border-transparent hover:border-black">
                  <X className="w-8 h-8 text-black" />
                </button>
              </div>

              <form onSubmit={handleAddSubscription} className="space-y-8">
                <div className="space-y-3">
                  <label className="excel-label ml-1">Service Identification</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G., NETFLIX, SPOTIFY, ADOBE"
                    className="excel-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Amount</label>
                    <input 
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-xl tracking-tighter"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Frequency</label>
                    <select 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="excel-input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Next Billing Cycle</label>
                    <input 
                      type="date"
                      required
                      value={nextBillingDate}
                      onChange={(e) => setNextBillingDate(e.target.value)}
                      className="excel-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Classification</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="excel-input"
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
                  className="neo-button neo-button-primary w-full py-6 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Commit Recurring'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
