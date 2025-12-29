import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Users, Plus, Edit3, Trash2, TrendingUp } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats Data
  const stats = [
    { label: 'Total Sales', value: 'LKR 1,250,000', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Orders', value: '45', icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Products', value: '124', icon: Package, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex pt-20">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/10 p-6 space-y-4">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-amber-500 text-black' : 'hover:bg-zinc-900 text-gray-400'}`}
        >
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-black' : 'hover:bg-zinc-900 text-gray-400'}`}
        >
          <Package size={20} /> Inventory
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-10">
        {activeTab === 'dashboard' ? (
          <div className="space-y-10">
            <h1 className="text-4xl font-black italic">ADMIN DASHBOARD</h1>
            
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-zinc-900 p-8 rounded-[32px] border border-white/5">
                  <div className={`p-3 w-fit rounded-xl bg-black mb-4 ${s.color}`}><s.icon /></div>
                  <p className="text-gray-500 font-bold text-xs uppercase">{s.label}</p>
                  <p className="text-3xl font-black mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-zinc-900 rounded-[40px] p-8 border border-white/5">
               <h2 className="text-xl font-black mb-6">RECENT BUILD ORDERS</h2>
               <div className="space-y-4">
                  {[1, 2, 3].map(order => (
                    <div key={order} className="flex justify-between items-center p-4 bg-black rounded-2xl border border-white/5">
                      <div>
                        <p className="font-bold uppercase text-sm italic">Build Order #DC-109{order}</p>
                        <p className="text-xs text-gray-500">3 mins ago • Pending</p>
                      </div>
                      <p className="font-black text-amber-500">LKR 345,000</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
               <h1 className="text-4xl font-black italic">MANAGE PARTS</h1>
               <button className="bg-white text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-amber-500 transition-all">
                  <Plus size={20} /> ADD NEW PART
               </button>
            </div>

            {/* PRODUCT TABLE */}
            <div className="bg-zinc-900 rounded-[40px] overflow-hidden border border-white/5">
              <table className="w-full text-left">
                <thead className="bg-black text-gray-500 text-xs uppercase font-black">
                  <tr>
                    <th className="p-6">Component</th>
                    <th className="p-6">Category</th>
                    <th className="p-6">Price</th>
                    <th className="p-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t border-white/5">
                    <td className="p-6 font-bold">Intel Core i9-14900K</td>
                    <td className="p-6 text-gray-400">CPU</td>
                    <td className="p-6 font-black text-amber-500">LKR 125,000</td>
                    <td className="p-6 flex justify-center gap-3">
                      <button className="p-2 bg-zinc-800 rounded-lg hover:text-blue-500"><Edit3 size={16} /></button>
                      <button className="p-2 bg-zinc-800 rounded-lg hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;