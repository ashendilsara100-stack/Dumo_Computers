import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, Save, Share2, CheckCircle, AlertCircle, Package, Trash2, ChevronRight, Activity } from 'lucide-react';

const PCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooling: null
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Sample data integration (Same as yours but with added brand context if needed)
  const components = { /* ... keep your existing components object ... */ };

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

  const handleComponentSelect = (category, component) => {
    setSelectedComponents(prev => ({ ...prev, [category]: component }));
  };

  const handleComponentRemove = (category) => {
    setSelectedComponents(prev => ({ ...prev, [category]: null }));
  };

  const checkCompatibility = () => {
    const issues = [];
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      if (selectedComponents.cpu.socket !== selectedComponents.motherboard.socket) {
        issues.push('⚠️ CPU and Motherboard sockets do not match!');
      }
    }
    if (selectedComponents.cpu && selectedComponents.psu) {
      const totalPower = (selectedComponents.cpu?.tdp || 0) + (selectedComponents.gpu?.power || 0) + 100;
      if (totalPower > selectedComponents.psu.wattage) {
        issues.push('⚠️ PSU wattage too low for this build!');
      }
    }
    return issues;
  };

  const compatibilityIssues = checkCompatibility();
  const completedSteps = Object.values(selectedComponents).filter(c => c !== null).length;
  const progressPercentage = (completedSteps / 8) * 100;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* 1. ULTRA HEADER */}
      <div className="relative pt-32 pb-20 px-6 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 text-amber-500 font-black tracking-widest text-sm mb-4">
                <Activity className="w-5 h-5" /> PC CONFIGURATOR v2.0
              </div>
              <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic uppercase">
                BUILD <span className="text-white/20">YOUR</span> <br />BEAST
              </h1>
            </div>
            
            <div className="bg-zinc-900 border-2 border-white/20 p-8 rounded-[32px] min-w-[300px] hover:border-amber-500 transition-colors shadow-2xl shadow-amber-500/10">
              <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-2">Estimated Total</p>
              <p className="text-5xl font-black text-white italic">LKR {totalPrice.toLocaleString()}</p>
              <div className="mt-4 w-full bg-black h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-700" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">Build Progress: {completedSteps}/8 Components</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 2. COMPONENT SELECTION (Left 8 Columns) */}
          <div className="lg:col-span-8 space-y-10">
            {Object.entries(components).map(([category, items]) => {
              const Icon = componentIcons[category];
              const selected = selectedComponents[category];

              return (
                <div key={category} className={`group rounded-[40px] border-2 transition-all duration-500 ${selected ? 'border-amber-500/50 bg-zinc-900/30' : 'border-white/5 bg-transparent'}`}>
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className={`p-4 rounded-2xl ${selected ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-white group-hover:bg-white group-hover:text-black'} transition-all`}>
                          <Icon size={32} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black uppercase italic tracking-tight leading-none">{componentLabels[category]}</h2>
                          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">
                            {selected ? `Selected: ${selected.name}` : `Select your ${category}`}
                          </p>
                        </div>
                      </div>
                      {selected && (
                        <button onClick={() => handleComponentRemove(category)} className="p-3 hover:bg-red-500/10 text-red-500 rounded-full transition-colors">
                          <Trash2 size={24} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleComponentSelect(category, item)}
                          className={`relative p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            selected?.id === item.id 
                            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                            : 'bg-black text-white border-white/10 hover:border-amber-500/50'
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-black text-sm uppercase leading-tight pr-4">{item.name}</h3>
                            <p className={`text-xl font-black mt-2 ${selected?.id === item.id ? 'text-black' : 'text-amber-500'}`}>
                              LKR {item.price.toLocaleString()}
                            </p>
                          </div>
                          {selected?.id === item.id && <CheckCircle className="text-black" size={24} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. STICKY SUMMARY (Right 4 Columns) */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
             {/* Compatibility Alert Area */}
             {compatibilityIssues.length > 0 && (
                <div className="mb-6 bg-red-600 p-6 rounded-[32px] text-white shadow-2xl shadow-red-600/20 animate-pulse">
                   <div className="flex gap-3">
                      <AlertCircle className="shrink-0" />
                      <div className="text-sm font-black">
                         {compatibilityIssues.map((issue, i) => <p key={i}>{issue}</p>)}
                      </div>
                   </div>
                </div>
             )}

             <div className="bg-zinc-950 border-2 border-white/10 rounded-[40px] p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3">
                   <Box className="text-amber-500" /> BUILD LOG
                </h2>
                
                <div className="space-y-6 mb-10">
                   {Object.entries(selectedComponents).map(([category, component]) => (
                      <div key={category} className="flex justify-between items-start group">
                         <div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{category}</p>
                            <p className={`text-sm font-bold truncate max-w-[180px] ${component ? 'text-white' : 'text-gray-800 italic'}`}>
                               {component ? component.name : 'Not Configured'}
                            </p>
                         </div>
                         {component && <p className="text-sm font-black text-amber-500">LKR {component.price.toLocaleString()}</p>}
                      </div>
                   ))}
                </div>

                <div className="border-t border-white/10 pt-8 space-y-4">
                   <button 
                      onClick={() => alert("Redirecting to WhatsApp for Quote...")}
                      className="w-full bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                   >
                      GET FULL QUOTE
                   </button>
                   <button className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black text-lg border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                      <Save size={20} /> SAVE BUILD
                   </button>
                   <div className="flex gap-4">
                      <button className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                         <Share2 size={16} /> SHARE
                      </button>
                      <button className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs border border-white/10 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
                         <ShoppingCart size={16} /> ADD ALL
                      </button>
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