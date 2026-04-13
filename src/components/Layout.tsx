import React from 'react';
import { storage } from '../lib/storage';
import { LogOut, PieChart, History, Target, Sparkles, LayoutDashboard, Bell, Settings as SettingsIcon, ListTodo, Shield, Goal, CreditCard, FileText, Briefcase, ArrowLeft, Camera, User as UserIcon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
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

  const handleBack = () => {
    // Basic navigation history logic
    if (activeTab === 'dashboard') return;
    
    // If we are in a sub-view, go back to dashboard
    setActiveTab('dashboard');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        storage.updateProfile(profile.uid, { photoURL: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9F6] text-black flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Floating Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-6 left-6 z-[55] p-3 bg-[#2FA084] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <nav className={cn(
        "fixed md:relative h-full w-80 bg-[#F0F9F6] border-r-2 border-[#2FA084] z-[70] flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 justify-start gap-4">
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2FA084] border-2 border-black rounded-none flex items-center justify-center shrink-0">
                <PieChart className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="block font-black text-3xl tracking-tighter text-black uppercase leading-none">SS FIN TRACK<span className="text-[#2FA084]">.</span></span>
                <span className="block font-black text-[8px] tracking-[0.2em] text-[#2FA084] uppercase mt-1">DEPLOYED BY MD. SHAMIM REZA</span>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-[#E2E8F0] transition-colors border-2 border-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col w-full gap-2 overflow-y-auto no-scrollbar flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center justify-start gap-4 px-4 py-4 rounded-none transition-all duration-200 relative group border-2",
                  activeTab === item.id 
                    ? "bg-[#2FA084] text-white border-black" 
                    : "text-black border-transparent hover:bg-[#E2E8F0] hover:border-black"
                )}
                title={item.label}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200 shrink-0",
                  activeTab === item.id ? "text-white" : "text-black"
                )} />
                <span className="block text-xs font-black uppercase tracking-wider truncate">{item.label}</span>
                {item.badge > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-4 w-6 h-6 bg-white text-[#2FA084] text-[10px] flex items-center justify-center rounded-none border-2 border-black font-black">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8 border-t-2 border-[#2FA084]">
            <div className="flex items-center justify-start gap-4 px-4 py-4 bg-[#E2E8F0] border-2 border-black rounded-none mb-6 group relative">
              <div className="relative shrink-0">
                {profile?.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-none border-2 border-black bg-white object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-none border-2 border-black bg-white flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-black/20" />
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#2FA084] border-2 border-black rounded-none flex items-center justify-center cursor-pointer hover:bg-black transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black text-black truncate uppercase tracking-tight">{profile?.username || 'User'}</span>
                <span className="text-[10px] text-black/60 truncate font-black uppercase tracking-widest">STATUS: ACTIVE</span>
              </div>
            </div>
            <button 
              onClick={() => storage.setCurrentUser(null)}
              className="flex items-center justify-start gap-4 px-6 py-4 w-full text-black hover:text-white hover:bg-[#2FA084] transition-all duration-200 font-black text-[10px] uppercase tracking-widest group border-2 border-transparent hover:border-black shadow-sm"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span className="block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-12">
          {activeTab !== 'dashboard' && (
            <button 
              onClick={handleBack}
              className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2FA084] hover:text-black transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
