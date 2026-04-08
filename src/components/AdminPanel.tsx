import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { UserProfile } from '../types';
import { Users, Lock, Unlock, Shield, Key, Loader2, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminPanel() {
  const [isVerified, setIsVerified] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const currentUser = storage.getCurrentUser();

  useEffect(() => {
    if (isVerified) {
      loadUsers();
    }
  }, [isVerified]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) return;
      // We use the login method logic to verify the admin password
      storage.login(currentUser.username, verifyPassword);
      setIsVerified(true);
      showMessage("Admin access granted");
    } catch (err: any) {
      showMessage("Invalid admin password", 'error');
    }
  };

  const loadUsers = () => {
    setLoading(true);
    const allUsers = storage.getAllUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  if (!isVerified) {
    return (
      <div className="max-w-md mx-auto py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-rose-500/10 rounded-none flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-10 h-10 text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Restricted Access</h2>
            <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Verify Admin Credentials to Proceed</p>
          </div>

          {message.text && (
            <div className="bg-rose-500/10 text-rose-400 p-3 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
              {message.text}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
              <input 
                type="password"
                required
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="ENTER ADMIN PASSWORD"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-black text-xs uppercase tracking-widest"
              />
            </div>
            <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">
              Verify Access
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleToggleLock = (uid: string) => {
    if (uid === currentUser?.uid) {
      showMessage("You cannot lock your own account!", 'error');
      return;
    }
    storage.toggleUserLock(uid);
    loadUsers();
    showMessage("User status updated successfully");
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newPassword) return;
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      storage.updateUserPassword(currentUser.uid, newPassword);
      setNewPassword('');
      showMessage('Admin password updated successfully');
    } catch (err: any) {
      showMessage(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Admin Control</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">System Management & User Oversight</p>
        </div>
        <AnimatePresence>
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-none border ${
                message.type === 'error' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Users</p>
              <h4 className="text-2xl font-black text-white">{users.length}</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Locked Accounts</p>
              <h4 className="text-2xl font-black text-white">{users.filter(u => u.isLocked).length}</h4>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Accounts</p>
              <h4 className="text-2xl font-black text-white">{users.filter(u => u.role === 'admin').length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> User Directory
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text"
              placeholder="SEARCH USERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-none text-[10px] font-black uppercase tracking-widest text-white focus:ring-1 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
        </div>

        <div className="glass-card rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-xs">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                        user.role === 'admin' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 bg-white/5'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.isLocked ? (
                          <span className="flex items-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                            <XCircle className="w-3 h-3" /> Locked
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleLock(user.uid)}
                        disabled={user.uid === currentUser?.uid}
                        className={`p-2 transition-all disabled:opacity-20 ${
                          user.isLocked ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                        title={user.isLocked ? "Unlock User" : "Lock User"}
                      >
                        {user.isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Admin Security */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" /> Admin Security
        </h3>
        <div className="glass-card p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h4 className="text-white font-black uppercase tracking-wider">Update Admin Password</h4>
              <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
                Change your administrative access credentials. Ensure you use a strong, unique password to maintain system integrity.
              </p>
            </div>
            <form onSubmit={handleChangeAdminPassword} className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="password"
                  placeholder="NEW ADMIN PASSWORD"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-none text-[10px] font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'UPDATE'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
