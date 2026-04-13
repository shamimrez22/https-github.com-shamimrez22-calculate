import { storage } from '../lib/storage';
import { AppNotification, UserSettings } from '../types';

class NotificationService {
  private sounds = {
    budget_exceeded: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', // Loud warning
    budget_warning: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Soft alert
    reminder: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', // Subtle tone
    ai_insight: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Subtle tone
    goal_progress: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Success tone
    task_reminder: 'https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3', // Loud alarm tone
  };

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async sendNotification(
    type: AppNotification['type'],
    title: string,
    message: string,
    settings: UserSettings
  ) {
    const profile = storage.getCurrentUser();
    if (!profile || !settings.notificationsEnabled) return;

    // Check quiet hours
    if (settings.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime >= settings.quietHours.start && currentTime <= settings.quietHours.end) {
        return;
      }
    }

    try {
      const data = storage.getUserData(profile.uid);
      const newNotification: AppNotification = {
        id: Math.random().toString(36).substring(2, 15),
        uid: profile.uid,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
      };

      storage.setUserData(profile.uid, {
        ...data,
        notifications: [newNotification, ...data.notifications]
      });

      window.dispatchEvent(new CustomEvent('new-notification', { 
        detail: { title, message, type } 
      }));

      // System Notification
      if ("Notification" in window && Notification.permission === "granted") {
        this.showSystemNotification(title, message);
      }

      if (settings.soundEnabled) {
        this.playSound(type);
      }

      if (settings.vibrationEnabled && 'vibrate' in navigator) {
        this.vibrate(type);
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async showSystemNotification(title: string, message: string) {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.showNotification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            tag: 'fiscal-alert',
            renotify: true
          } as any);
          return;
        }
      }
      new Notification(title, { body: message, icon: '/favicon.ico' } as any);
    } catch (e) {
      console.error('System notification failed:', e);
    }
  }

  private async playSound(type: AppNotification['type']) {
    try {
      const audio = new Audio(this.sounds[type]);
      await audio.play();
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }

  private vibrate(type: AppNotification['type']) {
    const patterns: Record<string, number[]> = {
      budget_exceeded: [100, 50, 100, 50, 100],
      budget_warning: [200, 100, 200],
      reminder: [100],
      ai_insight: [50, 50, 50],
      goal_progress: [100, 100, 100],
      task_reminder: [200, 100, 200, 100, 200],
    };
    navigator.vibrate(patterns[type] || [100]);
  }

  async markAsRead(notificationId: string) {
    const profile = storage.getCurrentUser();
    if (!profile) return;
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, {
        ...data,
        notifications: data.notifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export const notificationService = new NotificationService();
