import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Asset } from '../types';
import { Briefcase, Plus, TrendingUp, TrendingDown, Trash2, Loader2, DollarSign, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Portfolio({ assets }: { assets: Asset[] }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<Asset['type']>('Stock');
  const [value, setValue] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = storage.getCurrentUser();

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    const newAsset: Asset = {
      id: Math.random().toString(36).substring(2, 15),
      uid: currentUser.uid,
      name,
      type,
      value: parseFloat(value),
      purchasePrice: parseFloat(purchasePrice),
      quantity: parseFloat(quantity),
      createdAt: new Date().toISOString()
    };

    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      assets: [...(userData.assets || []), newAsset]
    });

    setLoading(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleDeleteAsset = (id: string) => {
    if (!currentUser) return;
    const userData = storage.getUserData(currentUser.uid);
    storage.setUserData(currentUser.uid, {
      ...userData,
      assets: userData.assets.filter((a: Asset) => a.id !== id)
    });
  };

  const resetForm = () => {
    setName('');
    setType('Stock');
    setValue('');
    setPurchasePrice('');
    setQuantity('');
  };

  const totalValue = assets.reduce((acc, a) => acc + (a.value * a.quantity), 0);
  const totalCost = assets.reduce((acc, a) => acc + (a.purchasePrice * a.quantity), 0);
  const totalProfit = totalValue - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Portfolio</h2>
          <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Track your assets and investments</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 border-l-4 border-l-indigo-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Portfolio Value</p>
          <h4 className="text-4xl font-black text-white">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className={`glass-card p-8 border-l-4 ${totalProfit >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Profit/Loss</p>
          <div className="flex items-baseline gap-3">
            <h4 className={`text-4xl font-black ${totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className={`text-sm font-bold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              ({profitPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Holdings</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">P/L</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No assets in your portfolio
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const assetValue = asset.value * asset.quantity;
                  const assetCost = asset.purchasePrice * asset.quantity;
                  const assetProfit = assetValue - assetCost;
                  const assetProfitPercent = (assetProfit / assetCost) * 100;

                  return (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{asset.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 text-slate-400 border border-white/5">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-white">{asset.quantity}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Avg: ${asset.purchasePrice}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-white">${assetValue.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Price: ${asset.value}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`text-sm font-black ${assetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {assetProfit >= 0 ? '+' : ''}${assetProfit.toLocaleString()}
                        </p>
                        <p className={`text-[10px] font-bold ${assetProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {assetProfitPercent.toFixed(1)}%
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-2 text-slate-600 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-10 space-y-8"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Add New Asset</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Name</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.G., APPLE, BITCOIN"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold uppercase tracking-widest text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Asset Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs uppercase tracking-widest"
                    >
                      <option value="Stock">Stock</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Gold">Gold</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Quantity</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Purchase Price</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Current Market Price</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-none text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-5 rounded-none font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Add to Portfolio'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
