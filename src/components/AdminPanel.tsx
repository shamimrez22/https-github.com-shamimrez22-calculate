import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { UserProfile } from '../types';
import { Users, Lock, Unlock, Shield, Key, Loader2, Search, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
          className="glass-card p-12 text-center space-y-10"
        >
          <div className="w-24 h-24 bg-red-50 rounded-none flex items-center justify-center mx-auto border-2 border-[#2FA084]">
            <ShieldAlert className="w-12 h-12 text-[#2FA084]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Restricted Access</h2>
            <p className="text-black/40 text-[10px] font-black mt-3 uppercase tracking-widest">Verify Admin Credentials to Proceed</p>
          </div>

          {message.text && (
            <div className="bg-red-50 text-[#2FA084] p-4 text-[10px] font-black uppercase tracking-widest border-2 border-[#2FA084] rounded-none">
              {message.text}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative">
              <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
              <input 
                type="password"
                required
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                placeholder="ENTER ADMIN PASSWORD"
                className="excel-input pl-16 py-4"
              />
            </div>
            <button className="neo-button neo-button-primary w-full py-5">
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
    (u.username?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Admin Control</h2>
          <p className="text-black/40 text-[10px] font-black mt-2 uppercase tracking-widest">System Management & User Oversight</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-[#E2E8F0] p-8 border-2 border-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -mr-12 -mt-12 rotate-45" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-[#2FA084] text-white border-2 border-black">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Total Users</p>
              <h4 className="text-4xl font-black text-black tracking-tighter">{users.length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-[#E2E8F0] p-8 border-2 border-[#2FA084] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#2FA084]/5 -mr-12 -mt-12 rotate-45" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-red-50 text-[#2FA084] border-2 border-[#2FA084]">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Locked Accounts</p>
              <h4 className="text-4xl font-black text-[#2FA084] tracking-tighter">{users.filter(u => u.isLocked).length}</h4>
            </div>
          </div>
        </div>
        <div className="bg-[#E2E8F0] p-8 border-2 border-emerald-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-700/5 -mr-12 -mt-12 rotate-45" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-emerald-50 text-emerald-700 border-2 border-emerald-700">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-2">Admin Accounts</p>
              <h4 className="text-4xl font-black text-emerald-700 tracking-tighter">{users.filter(u => u.role === 'admin').length}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-3">
            <Users className="w-5 h-5 text-[#2FA084]" /> User Directory
          </h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
            <input 
              type="text"
              placeholder="SEARCH USERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white/30 border-2 border-black rounded-none text-[10px] font-black uppercase tracking-widest text-black focus:bg-white outline-none w-80"
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2FA084] text-white">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">User Identification</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Email Address</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Privilege Level</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Operational Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/10 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2FA084] text-white border-2 border-black rounded-none flex items-center justify-center font-black text-xs uppercase">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="text-lg font-black text-black uppercase tracking-tighter">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-black/40 font-black uppercase tracking-widest">{user.email}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-2 rounded-none",
                        user.role === 'admin' ? "text-white bg-[#2FA084] border-black" : "text-black/40 bg-white/30 border-black/10"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {user.isLocked ? (
                          <span className="flex items-center gap-2 text-[#2FA084] text-[10px] font-black uppercase tracking-widest bg-red-50 px-3 py-1.5 border-2 border-[#2FA084]">
                            <XCircle className="w-4 h-4" /> Locked
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-emerald-700 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1.5 border-2 border-emerald-700">
                            <CheckCircle2 className="w-4 h-4" /> Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleToggleLock(user.uid)}
                        disabled={user.uid === currentUser?.uid}
                        className={cn(
                          "px-4 py-2 border-2 rounded-none transition-all disabled:opacity-20 flex items-center gap-2 ml-auto text-[10px] font-black uppercase tracking-widest",
                          user.isLocked ? "text-emerald-700 border-emerald-700 hover:bg-emerald-50" : "text-[#8B0000] border-[#8B0000] hover:bg-red-50"
                        )}
                        title={user.isLocked ? "Unlock User" : "Lock User"}
                      >
                        {user.isLocked ? (
                          <>
                            <Unlock className="w-4 h-4" /> UNLOCK ACCOUNT
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" /> LOCK ACCOUNT
                          </>
                        )}
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
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-3">
          <Key className="w-5 h-5 text-[#2FA084]" /> Security Protocols
        </h3>
        <div className="glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-black/5 -mr-16 -mt-16 rotate-45" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 relative z-10">
            <div className="max-w-lg">
              <h4 className="text-xl font-black text-black tracking-tighter uppercase">Update Admin Credentials</h4>
              <p className="text-[10px] text-black/40 font-black uppercase tracking-widest mt-3 leading-relaxed">
                Modification of administrative access keys. System integrity requires high-entropy credential selection.
              </p>
            </div>
            <form onSubmit={handleChangeAdminPassword} className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-black w-5 h-5" />
                <input 
                  type="password"
                  placeholder="NEW ACCESS KEY"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="excel-input pl-16 py-4"
                />
              </div>
              <button 
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="neo-button neo-button-primary px-10 py-5 flex items-center gap-3"
              >
                {passwordLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Commit'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
