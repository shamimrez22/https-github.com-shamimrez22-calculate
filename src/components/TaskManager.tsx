import React, { useState } from 'react';
import { Task } from '../types';
import { storage } from '../lib/storage';
import { Plus, Calendar, Clock, CheckCircle2, Circle, Trash2, Edit2, ListTodo, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TaskForm from './TaskForm';
import { format, isToday, isFuture, parseISO } from 'date-fns';
import { cn } from '../lib/utils';

interface TaskManagerProps {
  tasks: Task[];
}

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const colors = {
    high: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  };
  return (
    <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-none border", colors[priority])}>
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
        "glass-card p-6 flex items-center gap-5 group transition-all",
        task.completed ? "opacity-40 grayscale" : "glass-card-hover"
      )}
    >
      <button 
        onClick={() => toggleComplete(task)}
        className={cn(
          "w-8 h-8 rounded-none border-2 flex items-center justify-center transition-all",
          task.completed 
            ? "bg-emerald-500 border-emerald-500 text-white" 
            : "border-white/10 text-transparent hover:border-indigo-500 hover:text-indigo-500"
        )}
      >
        <CheckCircle2 className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className={cn(
            "font-bold text-white text-lg truncate tracking-tight",
            task.completed ? "line-through text-slate-500" : ""
          )}>
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {format(parseISO(task.scheduledAt), 'MMM dd')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-violet-400" /> {format(parseISO(task.scheduledAt), 'HH:mm')}
          </span>
          {task.repeat !== 'none' && (
            <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded-none uppercase tracking-widest text-[10px]">
              {task.repeat}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button 
          onClick={() => { setEditingTask(task); setShowForm(true); }}
          className="p-3 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-none transition-all"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => task.id && handleDelete(task.id)}
          className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-none transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function TaskManager({ tasks }: TaskManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

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
          <h2 className="text-3xl font-black text-white tracking-tight">Task Assistant</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Plan your day and stay on track</p>
        </div>
        <button 
          onClick={() => { setEditingTask(undefined); setShowForm(true); }}
          className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <section>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-none">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
              </div>
              Today's Focus
            </h3>
            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-slate-600 font-bold">No tasks for today. Relax!</p>
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
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="p-1.5 bg-violet-500/10 rounded-none">
                <Calendar className="w-4 h-4 text-violet-400" />
              </div>
              Upcoming
            </h3>
            <div className="space-y-4">
              {upcomingTasks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-slate-600 font-bold">No upcoming tasks scheduled.</p>
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
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-500/10 rounded-none">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              Recently Completed
            </h3>
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <p className="text-slate-600 font-bold">Finish some tasks to see them here!</p>
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

          <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-indigo-600 to-violet-800 p-10 text-white shadow-2xl shadow-indigo-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-none blur-2xl -mr-16 -mt-16" />
            <ListTodo className="w-12 h-12 mb-6 text-indigo-200" />
            <h3 className="text-2xl font-black mb-3 tracking-tight">Smart Assistant</h3>
            <p className="text-indigo-100/80 font-medium leading-relaxed mb-8">
              I'll notify you at the exact time of your tasks. High priority tasks will trigger a more urgent alert.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Pending</span>
                <span className="text-4xl font-black tracking-tighter">{tasks.filter(t => !t.completed).length}</span>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Completed</span>
                <span className="text-4xl font-black tracking-tighter">{completedTasks.length}</span>
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
