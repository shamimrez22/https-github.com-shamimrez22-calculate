import React, { useState, useEffect } from 'react';
import { UserSettings, UserProfile } from '../types';
import { storage } from '../lib/storage';
import { Bell, Volume2, Smartphone, Moon, Save, Loader2, User, Lock, Trash2, LogOut, Eye, EyeOff, Zap, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ConfirmationModal from './ConfirmationModal';
import { notificationService } from '../services/notificationService';
import VoiceInput from './VoiceInput';

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(storage.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Account states
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const loadData = () => {
      const data = storage.getUserData(profile.uid);
      setSettings(data.settings);
      setLoading(false);
    };

    loadData();
    window.addEventListener('data-change', loadData);
    return () => window.removeEventListener('data-change', loadData);
  }, [profile?.uid]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSavePreferences = async () => {
    if (!profile || !settings) return;
    setSaving(true);
    try {
      const data = storage.getUserData(profile.uid);
      storage.setUserData(profile.uid, { ...data, settings });
      showMessage('Preferences saved successfully');
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!profile || newUsername === profile.username) return;
    if (newUsername.length < 3) {
      showMessage('Username must be at least 3 characters', 'error');
      return;
    }

    setAccountActionLoading(true);
    try {
      storage.updateProfile(profile.uid, { username: newUsername });
      showMessage('Username updated successfully');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setAccountActionLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!profile || !newPassword) return;
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setAccountActionLoading(true);
    try {
      storage.updatePassword(profile.uid, newPassword);
      setNewPassword('');
      showMessage('Password updated successfully');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setAccountActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile) return;

    setAccountActionLoading(true);
    try {
      storage.deleteAccount(profile.uid);
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setAccountActionLoading(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">System Settings</h2>
          <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-1">Configuration and security</p>
        </div>
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-6 py-3 border-2 rounded-none",
                message.type === 'error' ? "bg-red-50 text-[#2FA084] border-[#2FA084]" : "bg-emerald-50 text-emerald-700 border-emerald-700"
              )}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Settings */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-3">
          <User className="w-5 h-5 text-[#2FA084]" /> Security Credentials
        </h3>
        <div className="glass-card overflow-hidden">
          <div className="p-10 space-y-10">
            {/* Username */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Identity Handle</label>
                <div className="flex gap-2">
                  <VoiceInput onResult={(text) => setNewUsername(text)} language="bn-BD" />
                  <VoiceInput onResult={(text) => setNewUsername(text)} language="en-US" />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="excel-input pl-16"
                    placeholder="NEW IDENTITY"
                  />
                </div>
                <button 
                  onClick={handleChangeUsername}
                  disabled={accountActionLoading || newUsername === profile?.username}
                  className="neo-button neo-button-primary px-10 py-5"
                >
                  Commit Change
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Access Key</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-6 h-6" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="excel-input pl-16 pr-16"
                    placeholder="NEW ACCESS KEY"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-all"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={accountActionLoading || !newPassword}
                  className="neo-button neo-button-primary px-10 py-5"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-3">
          <Bell className="w-5 h-5 text-[#2FA084]" /> Alert Protocols
        </h3>
        <div className="glass-card overflow-hidden">
          <div className="p-10 space-y-10">
            {/* Main Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-[#2FA084] text-white border-2 border-black">
                  <Bell className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-black uppercase tracking-tighter">Push Notifications</h4>
                  <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Global alert system status</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                className={cn(
                  "w-16 h-8 border-2 border-black transition-all relative",
                  settings.notificationsEnabled ? "bg-[#2FA084]" : "bg-white/30"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 border-2 border-black transition-all",
                  settings.notificationsEnabled ? "right-1 bg-white" : "left-1 bg-black/20"
                )} />
              </button>
            </div>

            <div className={cn(
              "space-y-10 transition-all",
              settings.notificationsEnabled ? "opacity-100" : "opacity-20 pointer-events-none"
            )}>
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/30 border-2 border-black text-black">
                    <Volume2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-black uppercase tracking-tighter">Acoustic Feedback</h4>
                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Audible alert signals</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={cn(
                    "w-16 h-8 border-2 border-black transition-all relative",
                    settings.soundEnabled ? "bg-[#2FA084]" : "bg-white/30"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 border-2 border-black transition-all",
                    settings.soundEnabled ? "right-1 bg-white" : "left-1 bg-black/20"
                  )} />
                </button>
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white/30 border-2 border-black text-black">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-black uppercase tracking-tighter">Haptic Response</h4>
                    <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Tactile device vibration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
                  className={cn(
                    "w-16 h-8 border-2 border-black transition-all relative",
                    settings.vibrationEnabled ? "bg-[#2FA084]" : "bg-white/30"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 border-2 border-black transition-all",
                    settings.vibrationEnabled ? "right-1 bg-white" : "left-1 bg-black/20"
                  )} />
                </button>
              </div>

              {/* Test Notification */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    if (settings) {
                      notificationService.sendNotification(
                        'reminder',
                        'SYSTEM TEST',
                        'Operational signal verified. Background link active.',
                        settings
                      );
                    }
                  }}
                  className="w-full py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5" />
                  Verify System Signal
                </button>
                <button 
                  onClick={async () => {
                    const granted = await notificationService.requestPermission();
                    if (granted) {
                      showMessage('Notification permission granted');
                      notificationService.sendNotification('reminder', 'System Online', 'Notifications are now active.', settings!);
                    } else {
                      showMessage('Notification permission denied', 'error');
                    }
                  }}
                  className="w-full py-4 bg-[#2FA084] text-white border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  <Bell className="w-5 h-5" />
                  Enable Notifications
                </button>
                <button 
                  onClick={() => {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/995/995-preview.mp3');
                    audio.play();
                  }}
                  className="w-full py-4 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Test Alarm Sound
                </button>
              </div>

              {/* Quiet Hours */}
              <div className="pt-10 border-t-2 border-black/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/30 border-2 border-black text-black">
                      <Moon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-black uppercase tracking-tighter">Operational Silence</h4>
                      <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Scheduled suppression period</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({ ...settings, quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled } })}
                    className={cn(
                      "w-16 h-8 border-2 border-black transition-all relative",
                      settings.quietHours.enabled ? "bg-[#2FA084]" : "bg-white/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 border-2 border-black transition-all",
                      settings.quietHours.enabled ? "right-1 bg-white" : "left-1 bg-black/20"
                    )} />
                  </button>
                </div>

                {settings.quietHours.enabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-2 gap-8 mt-8"
                  >
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Commencement</label>
                      <input 
                        type="time" 
                        value={settings.quietHours.start}
                        onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, start: e.target.value } })}
                        className="excel-input text-xl tracking-tighter"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/40 ml-1">Termination</label>
                      <input 
                        type="time" 
                        value={settings.quietHours.end}
                        onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, end: e.target.value } })}
                        className="excel-input text-xl tracking-tighter"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="p-10 bg-black/5 border-t-2 border-black flex justify-end">
            <button 
              onClick={handleSavePreferences}
              disabled={saving}
              className="neo-button neo-button-primary px-10 py-5 flex items-center gap-4"
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              Commit Preferences
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-[#2FA084] uppercase tracking-widest flex items-center gap-3">
          <Trash2 className="w-5 h-5" /> Irreversible Actions
        </h3>
        <div className="bg-red-50 border-2 border-[#2FA084] p-10 flex flex-col sm:flex-row items-center justify-between gap-10">
          <div>
            <h4 className="text-xl font-black text-[#2FA084] uppercase tracking-tighter">Terminate Account</h4>
            <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mt-2">Permanent removal of all fiscal datasets</p>
          </div>
          <button 
            onClick={() => setShowDeleteModal(true)}
            disabled={accountActionLoading}
            className="neo-button bg-[#2FA084] text-white border-black px-10 py-5 flex items-center gap-4"
          >
            <Trash2 className="w-6 h-6" />
            Terminate
          </button>
        </div>
        
        <button 
          onClick={() => storage.setCurrentUser(null)}
          className="neo-button w-full py-6 flex items-center justify-center gap-4"
        >
          <LogOut className="w-6 h-6 text-[#2FA084]" />
          Global De-authentication
        </button>
      </section>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Account Termination"
        message="Are you absolutely sure? This will delete all your financial data and cannot be undone. This operation is irreversible."
        confirmLabel="Terminate"
        cancelLabel="Abort"
      />
    </div>
  );
}
