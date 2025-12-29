import React, { useState, useEffect } from 'react';
import { 
  Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, 
  Save, Share2, CheckCircle, AlertCircle, Package, 
  Trash2, Activity, FileDown, MessageCircle 
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PCBuilder = ({ cart, setCart }) => {
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooling: null
  });
  const [totalPrice, setTotalPrice] = useState(0);

  // Components Data
  const components = {
    cpu: [
      { id: 101, name: 'Intel Core i9-14900K', price: 125000, socket: 'LGA1700' },
      { id: 102, name: 'AMD Ryzen 7 7800X3D', price: 105000, socket: 'AM5' },
      { id: 103, name: 'Intel Core i5-14600K', price: 72000, socket: 'LGA1700' }
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
      { id: 401, name: 'NVIDIA RTX 4090', price: 450000 },
      { id: 402, name: 'NVIDIA RTX 4060 Ti', price: 185000 }
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

  const componentIcons = { cpu: Cpu, motherboard: Monitor, ram: Zap, gpu: Monitor, storage: HardDrive, psu: Zap, case: Box, cooling: Fan };
  const componentLabels = { cpu: 'CPU', motherboard: 'Motherboard', ram: 'RAM', gpu: 'GPU', storage: 'Storage', psu: 'PSU', case: 'Case', cooling: 'Cooling' };

  useEffect(() => {
    const total = Object.values(selectedComponents).reduce((sum, component) => sum + (component?.price || 0), 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  // --- PDF GENERATION LOGIC ---
  const handleDownloadQuotation = () => {
    const selectedItems = Object.entries(selectedComponents).filter(([_, comp]) => comp !== null);
    if (selectedItems.length === 0) {
      showToast("PLEASE SELECT COMPONENTS FIRST!", "border-red-500");
      return;
    }

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const buildId = Math.floor(Math.random() * 100000);

    // Branding & Header
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 191, 0); // Amber
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text("DUMO COMPUTERS", 14, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("PREMIUM GAMING PC SOLUTIONS", 14, 32);
    doc.text(`DATE: ${date} | QUOTE: #DC${buildId}`, 130, 25);

    // Table
    const tableRows = selectedItems.map(([category, comp]) => [
      componentLabels[category].toUpperCase(),
      comp.name,
      `LKR ${comp.price.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 50,
      head: [['CATEGORY', 'PRODUCT DESCRIPTION', 'PRICE']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 191, 0], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(`GRAND TOTAL: LKR ${totalPrice.toLocaleString()}`, 14, finalY);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("Notes: Prices are subject to availability. Quote valid for 7 days.", 14, finalY + 15);
    doc.text("Visit us: www.dumocomputers.lk | Contact: +94 XX XXX XXXX", 14, finalY + 22);

    doc.save(`Dumo_Quote_DC${buildId}.pdf`);
    showToast("📥 QUOTATION DOWNLOADED!", "border-blue-500");
  };

  // Helper Functions
  const handleComponentSelect = (category, component) => setSelectedComponents(prev => ({ ...prev, [category]: component }));
  const handleComponentRemove = (category) => setSelectedComponents(prev => ({ ...prev, [category]: null }));
  const showToast = (msg, borderColor) => {
    const t = document.createElement('div');
    t.className = `fixed top-24 right-6 bg-white text-black px-8 py-4 rounded-2xl shadow-2xl z-50 animate-bounce font-black border-2 ${borderColor}`;
    t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  };

  const handleAddAllToCart = () => {
    const items = Object.values(selectedComponents).filter(c => c !== null);
    if (items.length === 0) return showToast("SELECT PARTS!", "border-red-500");
    setCart([...cart, ...items]);
    showToast("✓ ADDED TO CART!", "border-amber-500");
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="relative pt-32 pb-16 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-black text-xs tracking-[0.3em] mb-4 uppercase">
              <Activity size={16} /> Advanced PC Builder
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none">BUILD <span className="text-white/10">YOUR</span> BEAST</h1>
          </div>
          <div className="bg-zinc-900 border border-white/20 p-8 rounded-[40px] min-w-[320px]">
             <p className="text-gray-500 font-bold text-xs uppercase mb-1">Estimated Total</p>
             <p className="text-5xl font-black text-amber-500 italic">LKR {totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Component Selection */}
          <div className="lg:col-span-8 space-y-8">
            {Object.entries(components).map(([cat, items]) => {
              const Icon = componentIcons[cat];
              const sel = selectedComponents[cat];
              return (
                <div key={cat} className={`rounded-[35px] border-2 transition-all ${sel ? 'border-amber-500/40 bg-zinc-900/40' : 'border-white/5'}`}>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${sel ? 'bg-amber-500 text-black' : 'bg-zinc-800'}`}><Icon size={28} /></div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight">{componentLabels[cat]}</h2>
                      </div>
                      {sel && <button onClick={() => handleComponentRemove(cat)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full"><Trash2 size={20} /></button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map(item => (
                        <div key={item.id} onClick={() => handleComponentSelect(cat, item)} className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${sel?.id === item.id ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 hover:border-amber-500/50'}`}>
                          <div><p className="font-black text-sm uppercase">{item.name}</p><p className={`text-lg font-black ${sel?.id === item.id ? 'text-black' : 'text-amber-500'}`}>LKR {item.price.toLocaleString()}</p></div>
                          {sel?.id === item.id && <CheckCircle size={22} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
            <div className="bg-zinc-950 border border-white/10 rounded-[40px] p-8 shadow-2xl">
              <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3"><Box className="text-amber-500" /> BUILD LOG</h2>
              <div className="space-y-4 mb-10 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {Object.entries(selectedComponents).map(([cat, comp]) => (
                  <div key={cat} className="flex justify-between border-b border-white/5 pb-3">
                    <div className="max-w-[180px]"><p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{cat}</p><p className={`text-xs font-bold truncate ${comp ? 'text-white' : 'text-gray-800 italic'}`}>{comp ? comp.name : 'Empty'}</p></div>
                    {comp && <p className="text-xs font-black text-amber-500">LKR {comp.price.toLocaleString()}</p>}
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <button onClick={handleDownloadQuotation} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"><FileDown size={20} /> DOWNLOAD QUOTATION</button>
                <div className="flex gap-3">
                  <button onClick={handleAddAllToCart} className="flex-1 bg-amber-500 text-black py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition-all"><ShoppingCart size={16} /> CART</button>
                  <button onClick={() => window.open(`https://wa.me/94742299006`, '_blank')} className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-white/10 hover:bg-zinc-800 transition-all"><MessageCircle size={16} /> WHATSAPP</button>
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