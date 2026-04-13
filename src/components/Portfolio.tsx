import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Asset } from '../types';
import { Briefcase, Plus, TrendingUp, TrendingDown, Trash2, Loader2, DollarSign, BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">Portfolio</h2>
          <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Asset management and valuation</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="neo-button neo-button-primary px-8 py-4 flex items-center gap-4"
        >
          <Plus className="w-5 h-5" /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#E2E8F0] p-10 border-2 border-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Total Portfolio Value</p>
          <h4 className="text-5xl font-black text-black tracking-tighter">৳{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className={cn(
          "bg-[#E2E8F0] p-10 border-2 relative overflow-hidden",
          totalProfit >= 0 ? "border-emerald-700" : "border-[#2FA084]"
        )}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 -mr-12 -mt-12 rotate-45" />
          <p className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-4">Strategic Yield (P/L)</p>
          <div className="flex items-baseline gap-4">
            <h4 className={cn(
              "text-5xl font-black tracking-tighter",
              totalProfit >= 0 ? "text-emerald-700" : "text-[#2FA084]"
            )}>
              {totalProfit >= 0 ? '+' : ''}৳{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
            <span className={cn(
              "text-xl font-black",
              totalProfit >= 0 ? "text-emerald-700" : "text-[#2FA084]"
            )}>
              ({profitPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/30 border-2 border-black overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2FA084] text-white border-b-2 border-black">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Asset Identification</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Classification</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Holdings</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Yield</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-black/20 font-black uppercase tracking-widest">
                    No assets recorded in current portfolio
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const assetValue = asset.value * asset.quantity;
                  const assetCost = asset.purchasePrice * asset.quantity;
                  const assetProfit = assetValue - assetCost;
                  const assetProfitPercent = (assetProfit / assetCost) * 100;

                  return (
                    <tr key={asset.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-8 py-6">
                        <span className="text-lg font-black text-black uppercase tracking-tighter">{asset.name}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 bg-black text-white border-2 border-black rounded-none">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-lg font-black text-black tracking-tighter">{asset.quantity}</p>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Avg: ৳{asset.purchasePrice}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-lg font-black text-black tracking-tighter">৳{assetValue.toLocaleString()}</p>
                        <p className="text-[10px] text-black/40 font-black uppercase tracking-widest">Price: ৳{asset.value}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className={cn(
                          "text-lg font-black tracking-tighter",
                          assetProfit >= 0 ? "text-emerald-700" : "text-[#2FA084]"
                        )}>
                          {assetProfit >= 0 ? '+' : ''}৳{assetProfit.toLocaleString()}
                        </p>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          assetProfit >= 0 ? "text-emerald-700" : "text-[#2FA084]"
                        )}>
                          {assetProfitPercent.toFixed(1)}%
                        </p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-3 text-black/20 hover:text-[#2FA084] hover:bg-red-50 border-2 border-transparent hover:border-black rounded-none transition-all"
                        >
                          <Trash2 className="w-6 h-6" />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#F0F9F6] rounded-none p-12 space-y-10 border-2 border-black"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-black tracking-tighter uppercase">Add Asset</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-white/50 rounded-none transition-colors border-2 border-transparent hover:border-black">
                  <X className="w-8 h-8 text-black" />
                </button>
              </div>

              <form onSubmit={handleAddAsset} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Asset Name</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.G., APPLE, BITCOIN"
                      className="excel-input"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Asset Type</label>
                    <select 
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="excel-input"
                    >
                      <option value="Stock">Stock</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Gold">Gold</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Quantity</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-xl tracking-tighter"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="excel-label ml-1">Purchase Price</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-xl tracking-tighter"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="excel-label ml-1">Current Market Price</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-[#E2E8F0] border-2 border-black rounded-none text-black placeholder-black/30 outline-none focus:bg-white transition-all font-black text-2xl tracking-tighter"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="neo-button neo-button-primary w-full py-6 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : 'Commit Asset'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
