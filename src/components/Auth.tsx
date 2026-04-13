import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { PieChart, User, Lock, ArrowRight, Loader2, Eye, EyeOff, Mail, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const profile = storage.login(username, password);
        storage.setCurrentUser(profile);
      } else {
        if (!email.includes('@')) throw new Error('Invalid email address');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const profile = storage.register(username, email, password);
        storage.setCurrentUser(profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9F6] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 items-stretch relative z-10 border-2 border-black">
        {/* Left: Branding */}
        <div className="flex flex-col justify-between p-16 bg-[#2FA084] text-white relative overflow-hidden border-r-2 border-black">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full opacity-20" />
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 space-y-12"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border-2 border-black rounded-none flex items-center justify-center">
                <PieChart className="text-[#2FA084] w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">FinTrack<span className="text-white">.</span></span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl font-black leading-[0.9] tracking-tighter uppercase">
                Institutional <br />
                <span className="text-[#F0F9F6]">Grade</span> <br />
                Intelligence.
              </h1>
              <p className="text-white/60 text-lg font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                Professional wealth management for the modern era.
              </p>
            </div>
          </motion.div>

          <div className="relative z-10 pt-12 border-t-2 border-white/20 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-none border-2 border-black bg-white overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Trusted by <span className="text-white">50k+</span> Analysts</p>
          </div>
        </div>

        {/* Right: Auth Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#F0F9F6] p-12 lg:p-20 space-y-12 relative"
        >
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-[#2FA084] text-white text-[10px] font-black uppercase tracking-widest border-2 border-black">
              {isLogin ? 'Authentication Required' : 'System Registration'}
            </div>
            <h2 className="text-4xl font-black text-black tracking-tighter uppercase">
              {isLogin ? 'Access Portal' : 'Initialize Account'}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 bg-rose-50 border-2 border-[#2FA084] rounded-none text-[#2FA084] text-[10px] font-black uppercase tracking-widest flex items-center gap-4"
              >
                <ShieldCheck className="w-6 h-6" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="excel-label ml-1">Identity Identifier</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 focus:bg-white outline-none transition-all font-bold text-sm uppercase tracking-widest"
                    placeholder="USERNAME"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <label className="excel-label ml-1">Communication Channel</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors w-5 h-5" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 focus:bg-white outline-none transition-all font-bold text-sm uppercase tracking-widest"
                      placeholder="EMAIL@SYSTEM.COM"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="excel-label ml-1">Security Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-black transition-colors w-5 h-5" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 focus:bg-white outline-none transition-all font-bold text-sm tracking-widest"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <button 
                disabled={loading}
                className="w-full bg-white text-black hover:bg-[#E2E8F0] border-2 border-black py-5 rounded-none font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 disabled:opacity-50 group"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {isLogin ? 'Authorize Session' : 'Create Identity'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full py-2 text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                {isLogin ? "Request New Credentials" : "Return to Access Portal"}
              </button>
            </div>
          </form>

          <div className="pt-12 border-t-2 border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-black/30">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Terminal</span>
            </div>
            <span className="text-[10px] font-black text-black/30 uppercase tracking-widest">v4.0.0-CORE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
