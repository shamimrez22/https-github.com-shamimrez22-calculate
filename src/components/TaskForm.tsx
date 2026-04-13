import React, { useState } from 'react';
import { Task } from '../types';
import { storage } from '../lib/storage';
import { notificationService } from '../services/notificationService';
import { X, Calendar, Clock, Loader2, ListTodo } from 'lucide-react';
import { motion } from 'motion/react';
import VoiceInput from './VoiceInput';

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
      let updatedTasks;
      if (task?.id) {
        updatedTasks = data.tasks.map(t => t.id === task.id ? {
          ...t,
          title,
          notes,
          scheduledAt,
          priority,
          repeat,
        } : t);
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
        updatedTasks = [...data.tasks, newTask];
      }
      
      storage.setUserData(profile.uid, {
        ...data,
        tasks: updatedTasks
      });
      
      await notificationService.syncTasksWithServer(profile.uid, updatedTasks);
      onClose();
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#F0F9F6] w-full max-w-lg rounded-none overflow-hidden border-2 border-black"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2FA084] rounded-none text-white border-2 border-black">
                <ListTodo className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-black tracking-tighter uppercase">{task ? 'Edit Task' : 'New Task'}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-none transition-colors border-2 border-transparent hover:border-black">
              <X className="w-6 h-6 text-black" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="excel-label ml-1">Task Title</label>
                <div className="flex gap-2">
                  <VoiceInput onResult={(text) => setTitle(prev => prev ? `${prev} ${text}` : text)} language="bn-BD" />
                  <VoiceInput onResult={(text) => setTitle(prev => prev ? `${prev} ${text}` : text)} language="en-US" />
                </div>
              </div>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pay Electricity Bill"
                className="excel-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="excel-label ml-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2FA084]" /> Date
                </label>
                <input 
                  type="date" 
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="excel-input"
                />
              </div>
              <div className="space-y-2">
                <label className="excel-label ml-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2FA084]" /> Time
                </label>
                <input 
                  type="time" 
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="excel-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="excel-label ml-1">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="excel-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="excel-label ml-1">Repeat</label>
                <select 
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value as Task['repeat'])}
                  className="excel-input"
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="excel-label ml-1">Notes (Optional)</label>
                <div className="flex gap-2">
                  <VoiceInput onResult={(text) => setNotes(prev => prev ? `${prev} ${text}` : text)} language="bn-BD" />
                  <VoiceInput onResult={(text) => setNotes(prev => prev ? `${prev} ${text}` : text)} language="en-US" />
                </div>
              </div>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add some details..."
                className="excel-input h-24 resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="neo-button neo-button-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (task ? 'Update Task' : 'Schedule Task')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
