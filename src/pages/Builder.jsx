import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, Save, Share2, CheckCircle, AlertCircle, Package, Trash2, Activity } from 'lucide-react';

const PCBuilder = ({ cart, setCart }) => {
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooling: null
  });
  const [totalPrice, setTotalPrice] = useState(0);

  // 1. All Components Data
  const components = {
    cpu: [
      { id: 101, name: 'Intel Core i9-14900K', price: 125000, socket: 'LGA1700', tdp: 125 },
      { id: 102, name: 'AMD Ryzen 7 7800X3D', price: 105000, socket: 'AM5', tdp: 120 },
      { id: 103, name: 'Intel Core i5-14600K', price: 72000, socket: 'LGA1700', tdp: 125 }
    ],
    motherboard: [
      { id: 201, name: 'ASUS ROG Strix Z790-E', price: 85000, socket: 'LGA1700' },
      { id: 202, name: 'MSI MAG B650 Tomahawk', price: 65000, socket: 'AM5' }
    ],
    ram: [
      { id: 301, name: 'G.Skill Trident Z5 32GB DDR5', price: 45000 },
      { id: 302, name: 'Corsair Vengeance 16GB DDR4', price: 28000 }
    ],
    gpu: [
      { id: 401, name: 'NVIDIA RTX 4090', price: 450000, power: 450 },
      { id: 402, name: 'NVIDIA RTX 4060 Ti', price: 185000, power: 160 }
    ],
    storage: [
      { id: 501, name: 'Samsung 990 Pro 2TB', price: 48000 },
      { id: 502, name: 'WD Black 1TB NVMe', price: 28000 }
    ],
    psu: [
      { id: 601, name: 'Corsair RM1000x', price: 42000, wattage: 1000 },
      { id: 602, name: 'Seasonic 750W Gold', price: 28000, wattage: 750 }
    ],
    case: [
      { id: 701, name: 'Lian Li O11 Dynamic', price: 38000 },
      { id: 702, name: 'NZXT H7 Flow', price: 32000 }
    ],
    cooling: [
      { id: 801, name: 'NZXT Kraken 360mm AIO', price: 58000 },
      { id: 802, name: 'Noctua Air Cooler', price: 28000 }
    ]
  };

  const componentIcons = {
    cpu: Cpu, motherboard: Monitor, ram: Zap, gpu: Monitor, storage: HardDrive, psu: Zap, case: Box, cooling: Fan
  };

  const componentLabels = {
    cpu: 'Processor (CPU)', motherboard: 'Motherboard', ram: 'Memory (RAM)', gpu: 'Graphics Card (GPU)',
    storage: 'Storage', psu: 'Power Supply (PSU)', case: 'PC Case', cooling: 'Cooling System'
  };

  useEffect(() => {
    const total = Object.values(selectedComponents).reduce((sum, component) => sum + (component?.price || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // Handlers
  const handleComponentSelect = (category, component) => setSelectedComponents(prev => ({ ...prev, [category]: component }));
  const handleComponentRemove = (category) => setSelectedComponents(prev => ({ ...prev, [category]: null }));

  // 2. Add All to Cart Logic
  const handleAddAllToCart = () => {
    const itemsToAdd = Object.values(selectedComponents).filter(comp => comp !== null);
    
    if (itemsToAdd.length === 0) {
      showToast("SELECT AT LEAST ONE PART!", "border-red-500");
      return;
    }

    setCart([...cart, ...itemsToAdd]);
    showToast("✓ ALL ITEMS ADDED TO CART!", "border-amber-500");
  };

  // 3. Share Logic
  const handleShareBuild = () => {
    const buildText = Object.entries(selectedComponents)
      .filter(([_, comp]) => comp !== null)
      .map(([cat, comp]) => `${componentLabels[cat]}: ${comp.name} - LKR ${comp.price.toLocaleString()}`)
      .join('\n');

    if (!buildText) {
      showToast("NOTHING TO SHARE!", "border-red-500");
      return;
    }

    const finalMessage = `🚀 DUMO COMPUTERS - MY PC BUILD\n\n${buildText}\n\n💰 TOTAL: LKR ${totalPrice.toLocaleString()}`;
    navigator.clipboard.writeText(finalMessage).then(() => showToast("📋 COPIED TO CLIPBOARD!", "border-amber-500"));
  };

  const showToast = (msg, borderColor) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-6 bg-white text-black px-8 py-4 rounded-2xl shadow-2xl z-50 animate-bounce font-black border-2 ${borderColor}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const checkCompatibility = () => {
    const issues = [];
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      if (selectedComponents.cpu.socket !== selectedComponents.motherboard.socket) issues.push('⚠️ Sockets do not match!');
    }
    return issues;
  };

  const compatibilityIssues = checkCompatibility();
  const completedSteps = Object.values(selectedComponents).filter(c => c !== null).length;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* HEADER */}
      <div className="relative pt-32 pb-20 px-6 border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 text-amber-500 font-black tracking-widest text-sm mb-4">
              <Activity className="w-5 h-5 animate-pulse" /> PC CONFIGURATOR v2.0
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic uppercase">
              BUILD <span className="text-white/20">YOUR</span> <br />BEAST
            </h1>
          </div>
          <div className="bg-zinc-900 border-2 border-white/20 p-8 rounded-[32px] min-w-[320px] shadow-2xl shadow-amber-500/5">
            <p className="text-gray-500 font-black text-xs uppercase mb-2">Total Price</p>
            <p className="text-5xl font-black text-white italic">LKR {totalPrice.toLocaleString()}</p>
            <div className="mt-4 w-full bg-black h-2 rounded-full"><div className="h-full bg-amber-500 transition-all duration-700" style={{ width: `${(completedSteps / 8) * 100}%` }}></div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* COMPONENT LIST */}
          <div className="lg:col-span-8 space-y-8">
            {Object.entries(components).map(([category, items]) => {
              const Icon = componentIcons[category];
              const selected = selectedComponents[category];
              return (
                <div key={category} className={`rounded-[40px] border-2 transition-all duration-500 ${selected ? 'border-amber-500/50 bg-zinc-900/30' : 'border-white/5'}`}>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${selected ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-white'}`}><Icon size={32} /></div>
                        <div><h2 className="text-2xl font-black uppercase italic">{componentLabels[category]}</h2></div>
                      </div>
                      {selected && <button onClick={() => handleComponentRemove(category)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-full"><Trash2 size={24} /></button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => (
                        <div key={item.id} onClick={() => handleComponentSelect(category, item)} className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${selected?.id === item.id ? 'bg-white text-black border-white' : 'bg-black text-white border-white/10 hover:border-amber-500/50'}`}>
                          <div className="flex-1"><h3 className="font-black text-sm uppercase">{item.name}</h3><p className={`text-xl font-black mt-1 ${selected?.id === item.id ? 'text-black' : 'text-amber-500'}`}>LKR {item.price.toLocaleString()}</p></div>
                          {selected?.id === item.id && <CheckCircle size={24} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIDEBAR LOG */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
            {compatibilityIssues.length > 0 && <div className="mb-6 bg-red-600 p-6 rounded-[32px] font-black animate-pulse flex gap-3 text-sm"><AlertCircle /> {compatibilityIssues[0]}</div>}
            <div className="bg-zinc-950 border-2 border-white/10 rounded-[40px] p-8 relative">
              <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3"><Box className="text-amber-500" /> BUILD LOG</h2>
              <div className="space-y-5 mb-10">
                {Object.entries(selectedComponents).map(([cat, comp]) => (
                  <div key={cat} className="flex justify-between items-start">
                    <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{cat}</p><p className={`text-sm font-bold truncate max-w-[150px] ${comp ? 'text-white' : 'text-gray-800'}`}>{comp ? comp.name : 'Not Configured'}</p></div>
                    {comp && <p className="text-sm font-black text-amber-500">LKR {comp.price.toLocaleString()}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <button onClick={() => window.open(`https://wa.me/94XXXXXXXXX?text=Hello, I want a quote for this build: Total LKR ${totalPrice}`, '_blank')} className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-amber-500 transition-all shadow-xl">WHATSAPP QUOTE</button>
                <div className="flex gap-4">
                  <button onClick={handleShareBuild} className="flex-1 bg-zinc-900 border border-white/10 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-zinc-800"><Share2 size={16} /> SHARE</button>
                  <button onClick={handleAddAllToCart} className="flex-1 bg-amber-500 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-500/20"><ShoppingCart size={16} /> ADD ALL</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;