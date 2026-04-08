import React, { useState, useEffect } from 'react';
import { storage } from './lib/storage';
import { Transaction, Budget, AppNotification, UserSettings, UserProfile, Task, SavingsGoal, Subscription, Asset } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import BudgetManager from './components/BudgetManager';
import AIInsights from './components/AIInsights';
import TransactionForm from './components/TransactionForm';
import NotificationHistory from './components/NotificationHistory';
import Settings from './components/Settings';
import TaskManager from './components/TaskManager';
import AdminPanel from './components/AdminPanel';
import SavingsGoals from './components/SavingsGoals';
import SubscriptionTracker from './components/SubscriptionTracker';
import Reports from './components/Reports';
import AIChat from './components/AIChat';
import Portfolio from './components/Portfolio';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2, Bell, Clock, ListTodo, AlertCircle, X } from 'lucide-react';
import { notificationService } from './services/notificationService';
import { addDays, addWeeks, parseISO } from 'date-fns';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(storage.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: string } | null>(null);

  const showToast = (title: string, message: string, type: string = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 6000);
  };

  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW Registered:', registration);
          
          // Request permission
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const res = await fetch('/api/vapid-public-key');
            const { publicKey } = await res.json();
            
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: publicKey
            });
            
            await fetch('/api/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription)
            });
          }
        } catch (err) {
          console.error('SW Registration failed:', err);
        }
      }
    };
    registerSW();

    const handleAuthChange = () => {
      setProfile(storage.getCurrentUser());
    };
    
    const handleNewNotification = (e: any) => {
      const { title, message, type } = e.detail;
      showToast(title, message, type);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('new-notification', handleNewNotification);
    
    // Initial load
    setLoading(false);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  useEffect(() => {
    if (!profile) {
      setTransactions([]);
      setBudgets([]);
      setNotifications([]);
      setTasks([]);
      setGoals([]);
      setSubscriptions([]);
      setAssets([]);
      setSettings(null);
      return;
    }

    const loadData = () => {
      const data = storage.getUserData(profile.uid);
      setTransactions(data.transactions);
      setBudgets(data.budgets);
      setNotifications(data.notifications);
      setTasks(data.tasks);
      setGoals(data.goals || []);
      setSubscriptions(data.subscriptions || []);
      setAssets(data.assets || []);
      setSettings(data.settings);
      
      // Sync tasks to server for background notifications
      fetch('/api/sync-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: profile.uid, tasks: data.tasks })
      }).catch(console.error);
    };

    loadData();
    window.addEventListener('data-change', loadData);
    return () => window.removeEventListener('data-change', loadData);
  }, [profile?.uid]);

  // Task Scheduler Effect
  useEffect(() => {
    if (!profile || !settings || tasks.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      let updated = false;
      const currentTasks = [...tasks];

      currentTasks.forEach((task, index) => {
        if (task.completed) return;

        const scheduledTime = parseISO(task.scheduledAt);
        const diff = now.getTime() - scheduledTime.getTime();

        if (diff >= 0 && diff < 3600000) { // Within the last hour
          const notifiedKey = `notified_${task.id}_${task.scheduledAt}`;
          if (!localStorage.getItem(notifiedKey)) {
            notificationService.sendNotification(
              'task_reminder',
              `Task Reminder: ${task.title} ⏰`,
              task.notes || 'Time to complete your scheduled task!',
              settings
            );
            localStorage.setItem(notifiedKey, 'true');

            if (task.repeat !== 'none' && task.id) {
              let nextDate = scheduledTime;
              if (task.repeat === 'daily') nextDate = addDays(scheduledTime, 1);
              if (task.repeat === 'weekly') nextDate = addWeeks(scheduledTime, 1);
              
              currentTasks[index] = { ...task, scheduledAt: nextDate.toISOString() };
              updated = true;
            }
          }
        }
      });

      if (updated) {
        const data = storage.getUserData(profile.uid);
        storage.setUserData(profile.uid, { ...data, tasks: currentTasks });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [profile?.uid, tasks, settings]);

  // Daily Reminder Effect
  useEffect(() => {
    if (!profile || !settings || transactions.length === 0) return;

    const checkDailyReminder = () => {
      const lastReminderKey = `last_reminder_${profile.uid}`;
      const lastReminder = localStorage.getItem(lastReminderKey);
      const today = new Date().toDateString();

      if (lastReminder !== today && settings.notificationsEnabled) {
        const hasTransactionsToday = transactions.some(t => 
          new Date(t.date).toDateString() === today
        );

        if (!hasTransactionsToday) {
          notificationService.sendNotification(
            'reminder',
            'Daily Reminder 📝',
            "Don't forget to record your expenses for today!",
            settings
          );
          localStorage.setItem(lastReminderKey, today);
        }
      }
    };

    checkDailyReminder();
  }, [profile?.uid, transactions, settings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-none animate-pulse" />
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin absolute top-0 left-0" />
          </div>
          <div className="text-center">
            <p className="text-white text-xl font-black tracking-tighter uppercase">FinTrack AI</p>
            <p className="text-slate-500 text-sm font-medium mt-1">Synchronizing your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Auth />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} goals={goals} onAddTransaction={() => setShowAddModal(true)} profile={profile} onNavigate={setActiveTab} />;
      case 'transactions':
        return <TransactionList transactions={transactions} />;
      case 'budgets':
        return <BudgetManager budgets={budgets} transactions={transactions} />;
      case 'tasks':
        return <TaskManager tasks={tasks} />;
      case 'goals':
        return <SavingsGoals goals={goals} />;
      case 'subscriptions':
        return <SubscriptionTracker subscriptions={subscriptions} />;
      case 'portfolio':
        return <Portfolio assets={assets} />;
      case 'reports':
        return <Reports transactions={transactions} budgets={budgets} goals={goals} />;
      case 'ai':
        return <AIChat transactions={transactions} budgets={budgets} />;
      case 'notifications':
        return <NotificationHistory notifications={notifications} />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} goals={goals} onAddTransaction={() => setShowAddModal(true)} profile={profile} onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadCount} profile={profile}>
      <AnimatePresence mode="wait">
        <div key={activeTab}>
          {renderContent()}
        </div>
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && settings && (
          <TransactionForm 
            onClose={() => setShowAddModal(false)} 
            budgets={budgets}
            transactions={transactions}
            settings={settings}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast 
            title={toast.title} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function Toast({ title, message, type, onClose }: { title: string; message: string; type: string; onClose: () => void }) {
  const icons: Record<string, any> = {
    task_reminder: <Clock className="w-5 h-5 text-indigo-400" />,
    reminder: <ListTodo className="w-5 h-5 text-amber-400" />,
    budget_warning: <AlertCircle className="w-5 h-5 text-rose-400" />,
    default: <Bell className="w-5 h-5 text-indigo-400" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 50, x: '-50%' }}
      className="fixed bottom-24 md:bottom-10 left-1/2 z-[200] w-[90%] max-w-sm glass-card p-5 flex items-start gap-5 shadow-2xl shadow-black/50 rounded-none border border-white/10"
    >
      <div className="p-3 bg-indigo-500/10 rounded-none border border-indigo-500/20">
        {icons[type] || icons.default}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-white text-xs uppercase tracking-[0.1em]">{title}</h4>
        <p className="text-slate-400 text-[10px] font-bold mt-1 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
