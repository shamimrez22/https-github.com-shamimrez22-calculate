import React from 'react';
import { storage } from '../lib/storage';
import { LogOut, PieChart, History, Target, Sparkles, LayoutDashboard, Bell, Settings as SettingsIcon, ListTodo, Shield, Goal, CreditCard, FileText, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount?: number;
  profile: UserProfile | null;
}

export default function Layout({ children, activeTab, setActiveTab, unreadCount = 0, profile }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'goals', label: 'Goals', icon: Goal },
    { id: 'subscriptions', label: 'Subs', icon: CreditCard },
    { id: 'portfolio', label: 'Assets', icon: Briefcase },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'ai', label: 'AI Advisor', icon: Sparkles },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#000000] text-slate-200 flex flex-col md:flex-row font-sans">
      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-72 bg-black/40 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-white/5 z-50">
        <div className="flex flex-row md:flex-col h-full p-2 md:p-6 justify-around md:justify-start gap-1 md:gap-2">
          <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-none flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <PieChart className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">FinTrack<span className="text-indigo-500">.</span></span>
          </div>

          <div className="flex flex-row md:flex-col w-full gap-1 md:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 py-2 md:py-4 rounded-none transition-all duration-300 relative group",
                  activeTab === item.id 
                    ? "bg-white/10 text-white shadow-inner" 
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                  activeTab === item.id ? "text-indigo-400" : ""
                )} />
                <span className="text-[10px] md:text-base font-semibold tracking-wide">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 w-5 h-5 bg-indigo-500 text-white text-[10px] flex items-center justify-center rounded-none border-2 border-black font-bold">
                    {item.badge}
                  </span>
                )}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-none hidden md:block"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto hidden md:block pt-6 border-t border-white/5">
            <div className="flex items-center gap-4 px-3 py-4 bg-white/5 rounded-none mb-4 border border-white/5">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-none border border-white/10 bg-slate-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{profile?.username || 'User'}</span>
                <span className="text-xs text-slate-500 truncate font-mono">@{profile?.username?.toLowerCase() || 'user'}</span>
              </div>
            </div>
            <button 
              onClick={() => storage.setCurrentUser(null)}
              className="flex items-center gap-4 px-4 py-3 w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-none transition-all duration-300 font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-[#000000]">
        <header className="md:hidden bg-black/60 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-none flex items-center justify-center">
              <PieChart className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">FinTrack<span className="text-indigo-500">.</span></span>
          </div>
          <button onClick={() => storage.setCurrentUser(null)} className="text-slate-500 p-2">
            <LogOut className="w-6 h-6" />
          </button>
        </header>
        <div className="max-w-6xl mx-auto p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
