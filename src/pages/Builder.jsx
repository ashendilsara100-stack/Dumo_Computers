import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, 
  CheckCircle, AlertCircle, Trash2, Activity, FileDown, MessageCircle, Share2 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PCBuilder = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooling: null
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const total = Object.values(selectedComponents).reduce((sum, component) => 
      sum + (Number(component?.sellingPrice) || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // --- COMPATIBILITY ENGINE ---
  const getFilteredItems = (category) => {
    let items = products.filter(p => p.category?.toLowerCase().trim() === category.toLowerCase());
    if (category === 'motherboard' && selectedComponents.cpu) {
      items = items.filter(mb => mb.socket?.toLowerCase() === selectedComponents.cpu.socket?.toLowerCase());
    }
    if (category === 'ram' && selectedComponents.motherboard) {
      items = items.filter(ram => ram.ramType?.toLowerCase() === selectedComponents.motherboard.ramType?.toLowerCase());
    }
    if (category === 'cooling') {
      const activeSocket = selectedComponents.motherboard?.socket || selectedComponents.cpu?.socket;
      if (activeSocket) {
        items = items.filter(cooler => 
          cooler.socket === "Universal" || 
          cooler.socket?.toLowerCase() === activeSocket.toLowerCase()
        );
      }
    }
    return items;
  };

  const componentIcons = { cpu: Cpu, motherboard: Monitor, ram: Zap, gpu: Monitor, storage: HardDrive, psu: Zap, case: Box, cooling: Fan };
  const componentLabels = { 
    cpu: 'Processor', motherboard: 'Motherboard', ram: 'Memory (RAM)', 
    gpu: 'Graphics Card', storage: 'Storage (SSD/HDD)', psu: 'Power Supply', 
    case: 'Casing', cooling: 'CPU Cooler' 
  };

  const showToast = (msg, borderColor) => {
    const t = document.createElement('div');
    t.className = `fixed top-24 right-6 bg-black text-white px-8 py-4 rounded-2xl shadow-2xl z-50 animate-bounce font-black border-2 ${borderColor}`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  // --- NEW: SHARE & CLIPBOARD LOGIC ---
  const handleShareBuild = () => {
    const selectedItems = Object.entries(selectedComponents).filter(([_, comp]) => comp !== null);
    if (selectedItems.length === 0) return showToast("SELECT COMPONENTS FIRST!", "border-red-500");

    const buildText = `🖥️ *DUMO PC BUILD SUMMARY*\n` +
      `--------------------------\n` +
      selectedItems.map(([cat, comp]) => `• *${componentLabels[cat]}*: ${comp.name}`).join('\n') +
      `\n--------------------------\n` +
      `💰 *Total Price: LKR ${totalPrice.toLocaleString()}*`;

    navigator.clipboard.writeText(buildText).then(() => {
      showToast("BUILD COPIED TO CLIPBOARD!", "border-green-500");
    }).catch(err => {
      showToast("FAILED TO COPY!", "border-red-500");
    });
  };

  const handleDownloadQuotation = () => {
    const selectedItems = Object.entries(selectedComponents).filter(([_, comp]) => comp !== null);
    if (selectedItems.length === 0) return showToast("SELECT COMPONENTS FIRST!", "border-red-500");
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['CATEGORY', 'PRODUCT', 'PRICE']],
      body: selectedItems.map(([cat, comp]) => [componentLabels[cat].toUpperCase(), comp.name, `LKR ${Number(comp.sellingPrice).toLocaleString()}`]),
    });
    doc.save(`Dumo_Build_${Date.now()}.pdf`);
  };

  const handleWhatsApp = () => {
    const buildSummary = Object.entries(selectedComponents)
      .filter(([_, comp]) => comp !== null)
      .map(([cat, comp]) => `*${componentLabels[cat]}*: ${comp.name}`)
      .join('%0A');
    if (!buildSummary) return showToast("SELECT PARTS FIRST!", "border-red-500");
    window.open(`https://wa.me/94742299006?text=Build Quote:%0A${buildSummary}%0ATotal: LKR ${totalPrice.toLocaleString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      <div className="relative pt-32 pb-16 px-6 border-b border-white/5 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] tracking-[0.4em] mb-4 uppercase italic">
              <Activity size={14} className="animate-pulse" /> Compatibility Engine Active
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none uppercase">PC BUILDER</h1>
          </div>
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[40px] min-w-[350px]">
             <p className="text-zinc-500 font-black text-[10px] uppercase mb-1 italic">Total Estimate</p>
             <p className="text-5xl font-black text-amber-500 italic">LKR {totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {Object.keys(componentLabels).map((cat) => {
              const items = getFilteredItems(cat);
              const isLocked = (cat === 'motherboard' && !selectedComponents.cpu) || (cat === 'ram' && !selectedComponents.motherboard);

              return (
                <div key={cat} className={`rounded-[40px] border-2 transition-all duration-500 ${selectedComponents[cat] ? 'border-amber-500/30 bg-zinc-900/20' : 'border-white/5 bg-zinc-900/5'} ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-[20px] ${selectedComponents[cat] ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                          {React.createElement(componentIcons[cat], {size: 24})}
                        </div>
                        <div>
                          <h2 className="text-xl font-black uppercase italic leading-none mb-1">{componentLabels[cat]}</h2>
                          {isLocked && <p className="text-[9px] text-amber-500 font-black uppercase italic tracking-widest animate-pulse">Waiting for {cat === 'ram' ? 'Motherboard' : 'CPU'} selection...</p>}
                        </div>
                      </div>
                      {selectedComponents[cat] && <button onClick={() => setSelectedComponents(p => ({...p, [cat]: null}))} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full"><Trash2 size={20} /></button>}
                    </div>

                    {!isLocked && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.length > 0 ? items.map(item => (
                          <div key={item.id} onClick={() => setSelectedComponents(p => ({...p, [cat]: item}))} className={`p-4 rounded-[25px] border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedComponents[cat]?.id === item.id ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-black border-white/5 hover:border-amber-500/50'}`}>
                            <div className="w-14 h-14 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={item.image || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[10px] uppercase italic truncate leading-tight mb-1">{item.name}</p>
                              <p className={`text-sm font-black italic ${selectedComponents[cat]?.id === item.id ? 'text-black' : 'text-amber-500'}`}>LKR {Number(item.sellingPrice).toLocaleString()}</p>
                              <div className="flex gap-2 mt-1">
                                {item.socket && <span className="text-[7px] font-bold opacity-50 uppercase">Socket: {item.socket}</span>}
                                {item.ramType && <span className="text-[7px] font-bold opacity-50 uppercase">{item.ramType}</span>}
                              </div>
                            </div>
                            {selectedComponents[cat]?.id === item.id && <CheckCircle size={20} />}
                          </div>
                        )) : (
                          <div className="col-span-2 py-6 text-center bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                            <AlertCircle size={20} className="mx-auto mb-2 text-zinc-700" />
                            <p className="text-zinc-600 text-[10px] font-black uppercase italic tracking-widest">No compatible components in stock</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
            <div className="bg-zinc-900/50 border border-white/10 rounded-[45px] p-8 backdrop-blur-3xl shadow-3xl">
              <h2 className="text-2xl font-black italic mb-8 uppercase tracking-tighter flex items-center gap-3">
                 <Box className="text-amber-500" /> Build Log
              </h2>
              <div className="space-y-4 mb-10">
                {Object.entries(selectedComponents).map(([cat, comp]) => (
                  <div key={cat} className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] text-zinc-600 font-black uppercase italic tracking-widest">{cat}</span>
                    <span className={`text-[10px] font-black uppercase italic truncate max-w-[150px] ${comp ? "text-white" : "text-zinc-800"}`}>
                      {comp ? comp.name : 'Not Set'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {/* SHARE BUILD BUTTON */}
                <button onClick={handleShareBuild} className="w-full bg-zinc-800 text-white py-5 rounded-[22px] font-black flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all text-[10px] tracking-[0.2em] uppercase italic border border-white/10 shadow-xl">
                  <Share2 size={18} /> Share Build
                </button>
                
                <button onClick={handleDownloadQuotation} className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all text-[10px] tracking-[0.2em] uppercase italic shadow-xl shadow-blue-600/20">
                  <FileDown size={18} /> Download Quote
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleWhatsApp} className="bg-green-600 text-white py-4 rounded-[22px] font-black text-[9px] flex items-center justify-center gap-2 tracking-widest uppercase italic shadow-lg shadow-green-600/10"><MessageCircle size={16} /> WhatsApp</button>
                  <button onClick={() => { setCart([...cart, ...Object.values(selectedComponents).filter(c => c)]); showToast("ADDED TO CART!", "border-amber-500")}} className="bg-white text-black py-4 rounded-[22px] font-black text-[9px] flex items-center justify-center gap-2 tracking-widest uppercase italic shadow-lg"><ShoppingCart size={16} /> Add All</button>
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