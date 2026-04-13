import React, { useState } from 'react';
import { Task } from '../types';
import { storage } from '../lib/storage';
import { Plus, Calendar, Clock, CheckCircle2, Circle, Trash2, Edit2, ListTodo, AlertCircle, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskForm from './TaskForm';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import VoiceInput from './VoiceInput';

interface TaskManagerProps {
  tasks: Task[];
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colors = {
    high: 'bg-rose-50 text-[#2FA084] border-[#2FA084]',
    medium: 'bg-[#2FA084] text-white border-black',
    low: 'bg-white text-black/40 border-black/20',
  };
  return (
    <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-none border-2", colors[priority])}>
      {priority}
    </span>
  );
}

function TaskItem({ task, toggleComplete, handleDelete, setEditingTask, setShowForm }: { 
  task: Task; 
  toggleComplete: (task: Task) => void;
  handleDelete: (id: string) => void;
  setEditingTask: (task: Task) => void;
  setShowForm: (show: boolean) => void;
  key?: string;
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/50 p-6 flex items-center gap-6 group transition-all border-2 border-black",
        task.completed ? "opacity-40 grayscale" : "hover:bg-white"
      )}
    >
      <button 
        onClick={() => toggleComplete(task)}
        className={cn(
          "w-8 h-8 rounded-none border-2 flex items-center justify-center transition-all",
          task.completed 
            ? "bg-[#2FA084] border-black text-white" 
            : "border-black text-transparent hover:text-black"
        )}
      >
        <CheckCircle2 className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-2">
          <h4 className={cn(
            "font-black text-black text-lg truncate tracking-tight uppercase",
            task.completed ? "line-through text-black/40" : ""
          )}>
            {task.title}
          </h4>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-black text-black/40 uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2FA084]" /> {format(parseISO(task.scheduledAt), 'MMM dd')}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2FA084]" /> {format(parseISO(task.scheduledAt), 'HH:mm')}
          </span>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4">
          <PriorityBadge priority={task.priority} />
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button 
              onClick={() => { setEditingTask(task); setShowForm(true); }}
              className="p-2 text-black/40 hover:text-black hover:bg-white border-2 border-transparent hover:border-black transition-all"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => task.id && handleDelete(task.id)}
              className="p-2 text-black/40 hover:text-[#2FA084] hover:bg-white border-2 border-transparent hover:border-black transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TaskManager({ tasks }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [quickTask, setQuickTask] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm') });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.title) return;
    const profile = storage.getCurrentUser();
    if (!profile) return;

    try {
      const data = storage.getUserData(profile.uid);
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 15),
        uid: profile.uid,
        title: quickTask.title,
        notes: '',
        scheduledAt: new Date(`${quickTask.date}T${quickTask.time}`).toISOString(),
        completed: false,
        priority: 'medium',
        repeat: 'none',
        createdAt: new Date().toISOString(),
      };
      storage.setUserData(profile.uid, {
        ...data,
        tasks: [...data.tasks, newTask]
      });
      setQuickTask({ ...quickTask, title: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComplete = async (task: Task) => {
    const profile = storage.getCurrentUser();
    if (!profile || !task.id) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        tasks: data.tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t)
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    const profile = storage.getCurrentUser();
    if (!profile) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        tasks: data.tasks.filter(t => t.id !== id)
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  const todayTasks = tasks.filter(t => isToday(parseISO(t.scheduledAt)));
  const upcomingTasks = tasks.filter(t => isFuture(parseISO(t.scheduledAt)) && !isToday(parseISO(t.scheduledAt)));
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Task Assistant</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Strategic planning and execution</p>
        </div>
        <button 
          onClick={() => { setEditingTask(undefined); setShowForm(true); }}
          className="neo-button neo-button-primary px-10 py-5 flex items-center justify-center gap-4"
        >
          <Plus className="w-6 h-6" />
          Detailed Entry
        </button>
      </div>

      {/* Spreadsheet Style Quick Entry */}
      <div className="bg-white border-2 border-black p-1">
        <form onSubmit={handleQuickAdd} className="flex flex-col md:flex-row gap-px bg-black">
          <div className="flex-1 relative flex items-center bg-[#E2E8F0]">
            <input 
              type="text"
              placeholder="ENTER TASK TITLE (QUICK AUDIT)..."
              value={quickTask.title}
              onChange={(e) => setQuickTask({ ...quickTask, title: e.target.value })}
              className="flex-1 p-5 bg-transparent outline-none font-black text-[10px] uppercase tracking-widest text-black placeholder-black/30"
            />
            <div className="flex gap-1 pr-2">
              <VoiceInput onResult={(text) => setQuickTask(prev => ({ ...prev, title: prev.title ? `${prev.title} ${text}` : text }))} language="bn-BD" />
              <VoiceInput onResult={(text) => setQuickTask(prev => ({ ...prev, title: prev.title ? `${prev.title} ${text}` : text }))} language="en-US" />
            </div>
          </div>
          <input 
            type="date"
            value={quickTask.date}
            onChange={(e) => setQuickTask({ ...quickTask, date: e.target.value })}
            className="w-full md:w-48 p-5 bg-[#E2E8F0] outline-none font-black text-[10px] text-black border-l border-black"
          />
          <input 
            type="time"
            value={quickTask.time}
            onChange={(e) => setQuickTask({ ...quickTask, time: e.target.value })}
            className="w-full md:w-40 p-5 bg-[#E2E8F0] outline-none font-black text-[10px] text-black border-l border-black"
          />
          <button 
            type="submit"
            className="bg-[#2FA084] text-white px-10 py-5 font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all border-2 border-transparent hover:border-black"
          >
            Commit Row
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-6 flex items-center gap-4">
              <div className="p-2 bg-[#2FA084] text-white border-2 border-black">
                <AlertCircle className="w-4 h-4" />
              </div>
              Priority Focus
            </h3>
            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed">
                  <p className="text-black/30 font-black text-[10px] uppercase tracking-widest">No active tasks for current cycle</p>
                </div>
              ) : (
                todayTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    toggleComplete={toggleComplete}
                    handleDelete={handleDelete}
                    setEditingTask={setEditingTask}
                    setShowForm={setShowForm}
                  />
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-6 flex items-center gap-4">
              <div className="p-2 bg-white text-black border-2 border-black">
                <Calendar className="w-4 h-4" />
              </div>
              Future Pipeline
            </h3>
            <div className="space-y-4">
              {upcomingTasks.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed">
                  <p className="text-black/30 font-black text-[10px] uppercase tracking-widest">Pipeline clear</p>
                </div>
              ) : (
                upcomingTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    toggleComplete={toggleComplete}
                    handleDelete={handleDelete}
                    setEditingTask={setEditingTask}
                    setShowForm={setShowForm}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-6 flex items-center gap-4">
              <div className="p-2 bg-emerald-50 text-emerald-700 border-2 border-black">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              Audit History
            </h3>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed">
                  <p className="text-black/30 font-black text-[10px] uppercase tracking-widest">No history recorded</p>
                </div>
              ) : (
                completedTasks.slice(0, 5).map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    toggleComplete={toggleComplete}
                    handleDelete={handleDelete}
                    setEditingTask={setEditingTask}
                    setShowForm={setShowForm}
                  />
                ))
              )}
            </div>
          </section>

          <div className="relative overflow-hidden bg-[#2FA084] p-12 text-white border-2 border-black">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rotate-45" />
            <ListTodo className="w-12 h-12 mb-8 text-white" />
            <h3 className="text-2xl font-black mb-4 tracking-tighter uppercase">System Integrity</h3>
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10">
              Operational status: Optimal. All tasks are synchronized with the central audit core.
            </p>
            <div className="flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Active</span>
                <span className="text-5xl font-black tracking-tighter">{tasks.filter(t => !t.completed).length}</span>
              </div>
              <div className="w-px h-16 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Resolved</span>
                <span className="text-5xl font-black tracking-tighter">{completedTasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <TaskForm 
            onClose={() => { setShowForm(false); setEditingTask(undefined); }} 
            task={editingTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
