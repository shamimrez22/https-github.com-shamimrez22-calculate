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
    <div className="min-h-screen bg-[#E8C6B0] text-black flex flex-col md:flex-row font-sans relative overflow-hidden grid-bg">
      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-80 bg-[#E8C6B0] border-t-2 md:border-t-0 md:border-r-2 border-[#8B0000] z-50">
        <div className="flex flex-row md:flex-col h-full p-2 md:p-6 justify-around md:justify-start gap-1 md:gap-4">
          <div className="hidden md:flex items-center gap-4 mb-10 px-2">
            <div className="w-12 h-12 bg-[#8B0000] border-2 border-black rounded-none flex items-center justify-center">
              <PieChart className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-3xl tracking-tighter text-black uppercase">FinTrack<span className="text-[#8B0000]">.</span></span>
          </div>

          <div className="flex flex-row md:flex-col w-full gap-1 md:gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-4 px-4 py-3 md:py-4 rounded-none transition-all duration-200 relative group min-w-[64px] md:min-w-0 border-2",
                  activeTab === item.id 
                    ? "bg-[#8B0000] text-white border-black" 
                    : "text-black border-transparent hover:bg-[#D1D1D1] hover:border-black"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  activeTab === item.id ? "text-white" : "text-black"
                )} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1 right-2 md:top-1/2 md:-translate-y-1/2 md:right-4 w-6 h-6 bg-white text-[#8B0000] text-[10px] flex items-center justify-center rounded-none border-2 border-black font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto hidden md:block pt-8 border-t-2 border-[#8B0000]">
            <div className="flex items-center gap-4 px-4 py-4 bg-[#D1D1D1] border-2 border-black rounded-none mb-6 group cursor-pointer">
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'user'}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-none border-2 border-black bg-white"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-none" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black text-black truncate uppercase tracking-tight">{profile?.username || 'User'}</span>
                <span className="text-[10px] text-black/60 truncate font-black uppercase tracking-widest">STATUS: ACTIVE</span>
              </div>
            </div>
            <button 
              onClick={() => storage.setCurrentUser(null)}
              className="flex items-center gap-4 px-6 py-4 w-full text-black hover:text-white hover:bg-[#8B0000] transition-all duration-200 font-black text-[10px] uppercase tracking-widest group border-2 border-transparent hover:border-black shadow-sm"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>De-authenticate</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 bg-transparent relative z-10">
        <header className="md:hidden bg-[#E8C6B0] border-b-2 border-[#8B0000] p-6 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8B0000] border-2 border-black rounded-none flex items-center justify-center">
              <PieChart className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-2xl text-black tracking-tighter uppercase">FinTrack<span className="text-[#8B0000]">.</span></span>
          </div>
          <button onClick={() => storage.setCurrentUser(null)} className="text-black p-2">
            <LogOut className="w-8 h-8" />
          </button>
        </header>
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
