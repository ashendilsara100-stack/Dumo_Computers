import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, 
  CheckCircle, AlertCircle, Trash2, Activity, FileDown, MessageCircle, Share2, Facebook, X, Music2, MapPinned 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // මෙතන 'autoTable' ලෙස import කිරීම අත්‍යවශ්‍යයි
import SpaceBackground from "../components/SpaceBackground";

const PCBuilder = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null, cooling: null
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

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

  // Currency format කරන්න වෙනම function එකක් (RangeError මගහරවා ගැනීමට)
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
  };

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

  const handleDownloadQuotation = () => {
    try {
      const selectedItems = Object.entries(selectedComponents).filter(([_, comp]) => comp !== null);
      if (selectedItems.length === 0) return showToast("SELECT COMPONENTS FIRST!", "border-red-500");

      const doc = new jsPDF();
      const date = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY format
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const quoteNo = `2026/${Math.floor(1000 + Math.random() * 9000)}`;

      const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
      };

      // --- 1. HEADER (DMO STYLE) ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(40);
      doc.text("DMO", 15, 25);
      doc.setFontSize(10);
      doc.text("C O M P U T E R S", 15, 31);
      
      // Vertical line next to DMO
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(70, 15, 70, 35);

      // Business Details (Right Aligned)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.text("DUMO COMPUTERS WELIWERIYA", 195, 20, { align: "right" });
      doc.setFontSize(8);
      doc.text("NO. 302/6, NEW KANDY ROAD, WELIWERIYA", 195, 25, { align: "right" });
      doc.text("011 3692106 / 074 2299006", 195, 29, { align: "right" });
      doc.text("dumocomputers@gmail.com", 195, 33, { align: "right" });
      doc.text("www.dumo.lk", 195, 37, { align: "right" });

      // --- 2. QUOTE INFO ---
      doc.setFontSize(10);
      doc.text(quoteNo, 15, 55);
      doc.text("Customer", 15, 60);
      doc.setFont("helvetica", "bold");
      doc.text("QUOTATION", 15, 65);
      doc.setFont("helvetica", "normal");
      doc.text("Mobile: -", 15, 70);
      doc.text(`Date ${date} ${time}`, 195, 55, { align: "right" });

      // --- 3. PRODUCT TABLE (CLEAN DESIGN) ---
      const tableRows = [];
      selectedItems.forEach(([cat, comp]) => {
        // Main Product Row
        tableRows.push([
          comp.name.toUpperCase(),
          "1.00 QTY",
          formatCurrency(comp.sellingPrice),
          formatCurrency(comp.sellingPrice)
        ]);
        // Warranty Row (Subtitle)
        tableRows.push([
          { content: `03 Month Warranty - ${date}`, styles: { fontSize: 8, textColor: [50, 50, 50], fontStyle: 'normal', cellPadding: { top: -1, left: 2 } } },
          "", "", ""
        ]);
      });

      autoTable(doc, {
        startY: 75,
        head: [['Product', 'Quantity', 'Unit Price', 'Subtotal']],
        body: tableRows,
        theme: 'plain', // Borders නැතිව clean පෙනුමකට
        headStyles: { fontStyle: 'bold', textColor: [0, 0, 0], lineWidth: { bottom: 0.5 }, lineColor: [0, 0, 0] },
        styles: { fontSize: 9, cellPadding: 2, font: "helvetica" },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 30, halign: 'right' },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 30, halign: 'right' },
        },
      });

      // --- 4. SUMMARY SECTION ---
      let finalY = doc.lastAutoTable.finalY + 5;
      doc.setDrawColor(200);
      doc.line(15, finalY, 195, finalY); // Horizontal Line
      
      finalY += 10;
      const labelX = 140;
      const valueX = 195;

      // Subtotal
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", labelX, finalY);
      doc.text(`Rs ${formatCurrency(totalPrice)}`, valueX, finalY, { align: "right" });

      // Discount
      doc.setFont("helvetica", "normal");
      doc.text("Discount", labelX, finalY + 6);
      doc.text("(-) Rs 0.00", valueX, finalY + 6, { align: "right" });

      // Total Box
      doc.setFillColor(248, 248, 248);
      doc.rect(135, finalY + 8, 65, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.text("Total:", labelX, finalY + 14);
      doc.text(`Rs ${formatCurrency(totalPrice)}`, valueX, finalY + 14, { align: "right" });

      // --- 5. BARCODE / FOOTER ---
      const footerY = 280;
      // Barcode lines (Fake barcode style)
      for (let i = 0; i < 40; i++) {
        let weight = Math.random() > 0.5 ? 0.5 : 1;
        doc.setLineWidth(weight);
        doc.line(70 + i, footerY, 70 + i, footerY + 8);
      }
      doc.setFontSize(8);
      doc.text(quoteNo, 105, footerY + 12, { align: "center" });

      doc.save(`DUMO_QUOTATION_${quoteNo.replace('/','-')}.pdf`);
      showToast("QUOTATION DOWNLOADED!", "border-green-500");

    } catch (error) {
      console.error("PDF Error:", error);
      showToast("ERROR GENERATING PDF", "border-red-500");
    }
  };

  const handleShareBuild = () => {
    const selectedItems = Object.entries(selectedComponents).filter(([_, comp]) => comp !== null);
    if (selectedItems.length === 0) return showToast("SELECT COMPONENTS FIRST!", "border-red-500");
    const buildText = `🖥️ *DUMO PC BUILD SUMMARY*\n` +
      selectedItems.map(([cat, comp]) => `• *${componentLabels[cat]}*: ${comp.name}`).join('\n') +
      `\n💰 *Total: LKR ${totalPrice.toLocaleString()}*`;
    navigator.clipboard.writeText(buildText).then(() => showToast("BUILD COPIED!", "border-green-500"));
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 relative">
      <SpaceBackground />
      
      <div className="relative pt-32 pb-16 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-end gap-8 animate-reveal-up">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] tracking-[0.4em] mb-4 uppercase italic">
              <Activity size={14} className="animate-pulse" /> Compatibility Engine Active
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none uppercase">PC BUILDER</h1>
          </div>
          <div className="bg-zinc-900/80 border border-white/10 p-8 rounded-[40px] min-w-[350px] backdrop-blur-xl">
             <p className="text-zinc-500 font-black text-[10px] uppercase mb-1 italic">Total Estimate</p>
             <p className="text-5xl font-black text-amber-500 italic">LKR {totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {Object.keys(componentLabels).map((cat, index) => {
              const items = getFilteredItems(cat);
              const isLocked = (cat === 'motherboard' && !selectedComponents.cpu) || (cat === 'ram' && !selectedComponents.motherboard);

              return (
                <div 
                  key={cat} 
                  style={{ animationDelay: `${index * 0.1}s` }}
                  className={`rounded-[40px] border-2 transition-all duration-500 animate-reveal-up fill-mode-both ${selectedComponents[cat] ? 'border-amber-500/30 bg-zinc-900/40' : 'border-white/5 bg-zinc-900/20'} ${isLocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                >
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
                          <div key={item.id} onClick={() => setSelectedComponents(p => ({...p, [cat]: item}))} className={`p-4 rounded-[25px] border-2 cursor-pointer transition-all flex items-center gap-4 ${selectedComponents[cat]?.id === item.id ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-black/50 border-white/5 hover:border-amber-500/50'}`}>
                            <div className="w-14 h-14 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              <img src={item.image || "https://via.placeholder.com/100"} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[10px] uppercase italic truncate leading-tight mb-1">{item.name}</p>
                              <p className={`text-sm font-black italic ${selectedComponents[cat]?.id === item.id ? 'text-black' : 'text-amber-500'}`}>LKR {Number(item.sellingPrice).toLocaleString()}</p>
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
            <div className="bg-zinc-900/60 border border-white/10 rounded-[45px] p-8 backdrop-blur-3xl shadow-3xl animate-reveal-right">
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
                <button onClick={handleShareBuild} className="w-full bg-zinc-800 text-white py-5 rounded-[22px] font-black flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all text-[10px] tracking-[0.2em] uppercase italic border border-white/10 shadow-xl">
                  <Share2 size={18} /> Share Build
                </button>
                <button onClick={handleDownloadQuotation} className="w-full bg-blue-600 text-white py-5 rounded-[22px] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all text-[10px] tracking-[0.2em] uppercase italic shadow-xl shadow-blue-600/20">
                  <FileDown size={18} /> Download Quote
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleWhatsApp} className="bg-green-600 text-white py-4 rounded-[22px] font-black text-[9px] flex items-center justify-center gap-2 tracking-widest uppercase italic shadow-lg"><MessageCircle size={16} /> WhatsApp</button>
                  <button onClick={() => { setCart([...cart, ...Object.values(selectedComponents).filter(c => c)]); showToast("ADDED TO CART!", "border-amber-500")}} className="bg-white text-black py-4 rounded-[22px] font-black text-[9px] flex items-center justify-center gap-2 tracking-widest uppercase italic shadow-lg"><ShoppingCart size={16} /> Add All</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reveal-right { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        .animate-reveal-up { animation: reveal-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-reveal-right { animation: reveal-right 1s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fill-mode-both { animation-fill-mode: both; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[100]">
        {isSocialOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-reveal-up">
            <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 text-white"><MapPinned size={20}/></a>
            <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 text-white"><Facebook size={20}/></a>
            <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 text-white"><Music2 size={20}/></a>
            <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 text-white"><MessageCircle size={20}/></a>
          </div>
        )}
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-2xl transition-all">
          {isSocialOpen ? <X size={26} /> : <Share2 size={26} />}
        </button>
      </div>
    </div>
  );
};

export default PCBuilder;