import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { SavingsGoal } from '../types';
import { Target, Plus, TrendingUp, Calendar, Trash2, Edit2, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
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
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Savings Goals</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Strategic accumulation and planning</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="neo-button neo-button-primary px-8 py-4 flex items-center gap-4"
        >
          <Plus className="w-5 h-5" /> New Objective
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {goals.length === 0 ? (
          <div className="md:col-span-2 glass-card p-32 text-center space-y-8">
            <div className="w-24 h-24 bg-white/30 rounded-none flex items-center justify-center mx-auto border-2 border-black">
              <Target className="w-12 h-12 text-black/20" />
            </div>
            <p className="text-black/40 font-black uppercase tracking-widest">No strategic objectives defined</p>
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
                className="glass-card p-10 space-y-8 relative overflow-hidden group"
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-700 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest border-l-2 border-b-2 border-black">
                    Mission Accomplished
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">{goal.category}</p>
                    <h3 className="text-2xl font-black text-black tracking-tighter uppercase">{goal.name}</h3>
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-3 text-black/20 hover:text-[#2FA084] border-2 border-transparent hover:border-black transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-4xl font-black text-black tracking-tighter">৳{goal.currentAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mt-1">of ৳{goal.targetAmount.toLocaleString()} target</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-black tracking-tighter">{Math.round(progress)}%</p>
                      <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Accumulated</p>
                    </div>
                  </div>

                  <div className="h-6 w-full bg-white/30 rounded-none border-2 border-black p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-none ${isCompleted ? 'bg-emerald-700' : 'bg-[#2FA084]'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t-2 border-black/10">
                  <div className="flex items-center gap-3 text-black/40">
                    <Calendar className="w-5 h-5 text-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleUpdateAmount(goal.id, 100)}
                      className="neo-button px-4 py-2 text-[10px]"
                    >
                      +৳100
                    </button>
                    <button 
                      onClick={() => handleUpdateAmount(goal.id, 500)}
                      className="neo-button px-4 py-2 text-[10px]"
                    >
                      +৳500
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#F0F9F6] rounded-none p-12 space-y-10 border-2 border-black"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Initialize Goal</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/50 rounded-none transition-colors border-2 border-transparent hover:border-black">
                  <X className="w-8 h-8 text-black" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-8">
                <div className="space-y-3">
                  <label className="excel-label ml-1">Objective Name</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.G., STRATEGIC RESERVE, ASSET ACQUISITION"
                    className="excel-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Target Amount</label>
                    <input 
                      type="number"
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-xl tracking-tighter"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Initial Capital</label>
                    <input 
                      type="number"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-xl tracking-tighter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Deadline</label>
                    <input 
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
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
                  className="neo-button neo-button-primary w-full py-6 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Commit Objective'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
