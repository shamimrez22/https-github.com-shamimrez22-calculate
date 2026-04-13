import React from 'react';
import { AppNotification } from '../types';
import { format } from 'date-fns';
import { Bell, AlertCircle, Lightbulb, CheckCircle, Trash2, MailOpen } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

interface NotificationHistoryProps {
  notifications: AppNotification[];
}

const ICON_MAP = {
  budget_exceeded: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  budget_warning: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  reminder: { icon: Bell, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ai_insight: { icon: Lightbulb, color: 'text-violet-600', bg: 'bg-violet-50' },
  goal_progress: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  task_reminder: { icon: Bell, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export default function NotificationHistory({ notifications }: NotificationHistoryProps) {
  const handleDelete = async (id: string) => {
    const profile = storage.getCurrentUser();
    if (!profile) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        notifications: data.notifications.filter(n => n.id !== id)
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Alert Archive</h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-1">System notification logs</p>
        </div>
        <div className="px-6 py-2 bg-[#2FA084] text-white border-2 border-black text-[10px] font-black uppercase tracking-widest">
          {notifications.length} RECORDS
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/10 p-20 border-4 border-dashed border-black/20 text-center"
            >
              <Bell className="w-16 h-16 mx-auto mb-6 text-black/10" />
              <p className="text-black/40 font-black uppercase tracking-widest text-xs">Zero active alerts in buffer</p>
            </motion.div>
          ) : (
            notifications.map((notif) => {
              const config = ICON_MAP[notif.type];
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "glass-card p-8 flex gap-8 group relative transition-all",
                    !notif.read ? "border-black" : "opacity-70"
                  )}
                >
                  <div className={cn(
                    "p-5 border-2 h-fit",
                    !notif.read ? "bg-[#2FA084] text-white border-black" : "bg-white/30 text-black/40 border-black/20"
                  )}>
                    <config.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-black text-black uppercase tracking-tighter truncate pr-10">{notif.title}</h4>
                      <span className="text-[10px] font-black text-black/40 uppercase tracking-widest whitespace-nowrap bg-white/30 px-3 py-1 border-2 border-black/10">
                        {format(new Date(notif.createdAt), 'MMM dd | HH:mm')}
                      </span>
                    </div>
                    <p className="text-black font-black text-sm leading-relaxed tracking-tight">{notif.message}</p>
                    
                    <div className="flex gap-6 mt-6 pt-6 border-t-2 border-black/10">
                      {!notif.read && (
                        <button 
                          onClick={() => notif.id && notificationService.markAsRead(notif.id)}
                          className="neo-button px-4 py-2 text-[10px] flex items-center gap-2"
                        >
                          <MailOpen className="w-4 h-4" /> Acknowledge
                        </button>
                      )}
                      <button 
                        onClick={() => notif.id && handleDelete(notif.id)}
                        className="text-[10px] font-black text-[#2FA084] uppercase tracking-widest flex items-center gap-2 hover:bg-[#2FA084] hover:text-white px-4 py-2 border-2 border-[#2FA084] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" /> Purge
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
