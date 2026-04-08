import React from 'react';
import { AppNotification } from '../types';
import { format } from 'date-fns';
import { Bell, AlertCircle, Lightbulb, CheckCircle, Trash2, MailOpen } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from '../lib/storage';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Notification History</h2>
        <span className="text-sm text-slate-500">{notifications.length} alerts</span>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400"
            >
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No notifications yet. You're all caught up!</p>
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
                  className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group relative ${!notif.read ? 'ring-2 ring-indigo-100' : ''}`}
                >
                  <div className={`p-3 rounded-2xl h-fit ${config.bg} ${config.color}`}>
                    <config.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900 truncate pr-8">{notif.title}</h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {format(new Date(notif.createdAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{notif.message}</p>
                    
                    <div className="flex gap-4 mt-4">
                      {!notif.read && (
                        <button 
                          onClick={() => notif.id && notificationService.markAsRead(notif.id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <MailOpen className="w-3 h-3" /> Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => notif.id && handleDelete(notif.id)}
                        className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
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
