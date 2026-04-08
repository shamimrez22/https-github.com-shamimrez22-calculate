import React, { useState, useEffect } from 'react';
import { UserSettings, UserProfile } from '../types';
import { storage } from '../lib/storage';
import { Bell, Volume2, Smartphone, Moon, Save, Loader2, User, Lock, Trash2, LogOut, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    if (!confirm('Are you absolutely sure? This will delete all your financial data and cannot be undone.')) return;

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
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white tracking-tight uppercase">Settings</h2>
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-none ${message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Account Settings */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Account Settings
        </h3>
        <div className="glass-card rounded-none overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Username</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    placeholder="New username"
                  />
                </div>
                <button 
                  onClick={handleChangeUsername}
                  disabled={accountActionLoading || newUsername === profile?.username}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-none font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Change Password</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    placeholder="New password"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button 
                  onClick={handleChangePassword}
                  disabled={accountActionLoading || !newPassword}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-none font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" /> Notification Preferences
        </h3>
        <div className="glass-card rounded-none overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Main Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-none text-indigo-400">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Push Notifications</h4>
                  <p className="text-xs text-slate-500 font-medium">Enable or disable all alerts</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                className={`w-12 h-6 rounded-none transition-all relative ${settings.notificationsEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${settings.notificationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className={`space-y-6 transition-all ${settings.notificationsEnabled ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-none text-amber-400">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Notification Sounds</h4>
                    <p className="text-xs text-slate-500 font-medium">Play a sound for each alert</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-none transition-all relative ${settings.soundEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${settings.soundEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-none text-emerald-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Vibration</h4>
                    <p className="text-xs text-slate-500 font-medium">Vibrate device on alerts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
                  className={`w-12 h-6 rounded-none transition-all relative ${settings.vibrationEnabled ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${settings.vibrationEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Quiet Hours */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-none text-slate-400">
                      <Moon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Quiet Hours</h4>
                      <p className="text-xs text-slate-500 font-medium">Do Not Disturb mode</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSettings({ ...settings, quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled } })}
                    className={`w-12 h-6 rounded-none transition-all relative ${settings.quietHours.enabled ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-none transition-all ${settings.quietHours.enabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                {settings.quietHours.enabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="grid grid-cols-2 gap-4 mt-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Start Time</label>
                      <input 
                        type="time" 
                        value={settings.quietHours.start}
                        onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, start: e.target.value } })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-none text-white outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">End Time</label>
                      <input 
                        type="time" 
                        value={settings.quietHours.end}
                        onChange={(e) => setSettings({ ...settings, quietHours: { ...settings.quietHours, end: e.target.value } })}
                        className="w-full p-3 bg-white/5 border border-white/10 rounded-none text-white outline-none font-bold"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
            <button 
              onClick={handleSavePreferences}
              disabled={saving}
              className="flex items-center gap-3 bg-indigo-500 text-white px-8 py-3 rounded-none font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all disabled:opacity-70 shadow-lg shadow-indigo-500/20"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Preferences
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="bg-rose-500/5 rounded-none border border-rose-500/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-black text-rose-400 uppercase tracking-wider">Delete Account</h4>
            <p className="text-sm text-slate-500 font-medium mt-1">Permanently remove all your data and access.</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            disabled={accountActionLoading}
            className="flex items-center gap-3 bg-rose-500 text-white px-8 py-3 rounded-none font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all disabled:opacity-70 shadow-lg shadow-rose-500/20"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
        </div>
        
        <button 
          onClick={() => storage.setCurrentUser(null)}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white py-4 rounded-none font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          Sign Out from All Devices
        </button>
      </section>
    </div>
  );
}
