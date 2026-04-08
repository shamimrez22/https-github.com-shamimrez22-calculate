import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { SavingsGoal } from '../types';
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SavingsGoals({ goals }: { goals: SavingsGoal[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);

  const currentUser = storage.getCurrentUser();

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    const newGoal: SavingsGoal = {
      id: Math.random().toString(36).substring(2, 15),
      uid: currentUser.uid,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      category,
      createdAt: new Date().toISOString()
    };

    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      goals: [...(userData.goals || []), newGoal]
    });

    setLoading(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteGoal = (id: string) => {
    if (!currentUser) return;
    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      goals: userData.goals.filter((g: SavingsGoal) => g.id !== id)
    });
  };

  const handleUpdateAmount = (id: string, amount: number) => {
    if (!currentUser) return;
    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      goals: userData.goals.map((g: SavingsGoal) => 
        g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
      )
    });
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setCategory('General');
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Savings Goals</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Plan your future, one step at a time</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="md:col-span-2 glass-card p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-none flex items-center justify-center mx-auto border border-white/10">
              <Target className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No savings goals yet. Start planning today!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <motion.div 
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 space-y-6 relative overflow-hidden group"
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                    Completed
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{goal.category}</p>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{goal.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-black text-white">${goal.currentAmount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">of ${goal.targetAmount.toLocaleString()} target</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-indigo-400">{Math.round(progress)}%</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Progress</p>
                    </div>
                  </div>

                  <div className="h-3 w-full bg-white/5 rounded-none overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-none ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateAmount(goal.id, 100)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 transition-all"
                    >
                      +$100
                    </button>
                    <button 
                      onClick={() => handleUpdateAmount(goal.id, 500)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-black text-white uppercase tracking-widest border border-white/10 transition-all"
                    >
                      +$500
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
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
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Create New Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Goal Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G., NEW CAR, EMERGENCY FUND"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold uppercase tracking-widest text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Target Amount</label>
                    <input 
                      type="number"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Initial Savings</label>
                    <input 
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Deadline</label>
                    <input 
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
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
                      <option value="General">General</option>
                      <option value="Travel">Travel</option>
                      <option value="Home">Home</option>
                      <option value="Education">Education</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Gadgets">Gadgets</option>
                    </select>
                  </div>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-5 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Goal'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
