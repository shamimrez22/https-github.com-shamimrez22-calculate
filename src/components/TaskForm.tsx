import React, { useState } from 'react';
import { Task } from '../types';
import { storage } from '../lib/storage';
import { X, Calendar, Clock, Loader2, ListTodo } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskFormProps {
  onClose: () => void;
  task?: Task;
}

export default function TaskForm({ onClose, task }: TaskFormProps) {
  const getInitialDateTime = () => {
    if (task) {
      const d = new Date(task.scheduledAt);
      return {
        date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
        time: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
      };
    }
    const now = new Date();
    return {
      date: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0'),
      time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    };
  };

  const initial = getInitialDateTime();
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [repeat, setRepeat] = useState<Task['repeat']>(task?.repeat || 'none');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = storage.getCurrentUser();
    if (!profile) return;

    setLoading(true);
    // Parse local date and time correctly
    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    try {
      const data = storage.getUserData(profile.uid);
      if (task?.id) {
        storage.setUserData(profile.uid, {
          ...data,
          tasks: data.tasks.map(t => t.id === task.id ? {
            ...t,
            title,
            notes,
            scheduledAt,
            priority,
            repeat,
          } : t)
        });
      } else {
        const newTask: Task = {
          id: Math.random().toString(36).substring(2, 15),
          uid: profile.uid,
          title,
          notes,
          scheduledAt,
          completed: false,
          priority,
          repeat,
          createdAt: new Date().toISOString(),
        };
        storage.setUserData(profile.uid, {
          ...data,
          tasks: [...data.tasks, newTask]
        });
      }
      onClose();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-lg rounded-none shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-none text-indigo-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">{task ? 'Edit Task' : 'New Task'}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-none transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Task Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pay Electricity Bill"
                className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Date
                </label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" /> Time
                </label>
                <input 
                  type="time" 
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                >
                  <option value="low" className="bg-slate-900">Low</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="high" className="bg-slate-900">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Repeat</label>
                <select 
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as Task['repeat'])}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                >
                  <option value="none" className="bg-slate-900">None</option>
                  <option value="daily" className="bg-slate-900">Daily</option>
                  <option value="weekly" className="bg-slate-900">Weekly</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Notes (Optional)</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add some details..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none font-medium"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 text-white py-4 rounded-none font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (task ? 'Update Task' : 'Schedule Task')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
