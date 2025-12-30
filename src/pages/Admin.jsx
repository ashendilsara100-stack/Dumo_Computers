import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Layers, PlusCircle, CheckCircle2, TrendingUp, DollarSign, ShoppingCart, Briefcase
} from 'lucide-react';
import { db } from "../firebase/config"; 
import { 
  collection, addDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy, onSnapshot
} from "firebase/firestore";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); 
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Product Form States
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  
  // Compatibility Fields
  const [socket, setSocket] = useState(""); 
  const [ramType, setRamType] = useState(""); 

  const ADMIN_PASSWORD = "1234"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubCats = onSnapshot(query(collection(db, "categories"), orderBy("name", "asc")), (snap) => {
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      const unsubBrands = onSnapshot(query(collection(db, "brands"), orderBy("name", "asc")), (snap) => {
        setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubProducts(); unsubCats(); unsubBrands(); };
    }
  }, [isAuthenticated]);

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!name || !buyingPrice || !sellingPrice || !stock || !category || !selectedBrand) {
      showToast("Fill all essential fields!", "error");
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        brand: selectedBrand,
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock),
        category,
        image: image || "https://via.placeholder.com/150",
        socket: (category.toLowerCase() === 'cpu' || category.toLowerCase() === 'motherboard' || category.toLowerCase() === 'cooling') ? socket : null,
        ramType: (category.toLowerCase() === 'ram' || category.toLowerCase() === 'motherboard') ? ramType : null,
        createdAt: serverTimestamp()
      });
      // Reset Form
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); 
      setImage(""); setSelectedBrand(""); setSocket(""); setRamType("");
      showToast("Product published successfully!");
    } catch (error) { showToast("Error saving product", "error"); }
    setFormLoading(false);
  };

  const deleteItem = async (id, collectionName) => {
    if (window.confirm(`Delete this ${collectionName}?`)) {
      await deleteDoc(doc(db, collectionName, id));
      showToast("Deleted successfully");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white italic font-sans">
        <div className="bg-zinc-900 border border-white/10 p-10 rounded-[30px] w-full max-w-md text-center">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">DUMO ADMIN</h2>
          <input type="password" placeholder="Enter Password" title="password" className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold outline-none focus:border-amber-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Invalid Password", "error")} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase italic hover:bg-amber-500 transition-all">Unlock</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-amber-500">
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border animate-bounce ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 border-r border-white/10 p-8 flex flex-col bg-zinc-950 sticky top-0 h-screen">
        <h2 className="text-3xl font-black italic text-amber-500 mb-12 uppercase tracking-tighter">Dumo</h2>
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase italic text-[11px] tracking-widest ${activeTab === 'dashboard' ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}><LayoutDashboard size={18} /> Dashboard</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase italic text-[11px] tracking-widest ${activeTab === 'inventory' ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}><Package size={18} /> Inventory</button>
          <button onClick={() => setActiveTab('setup')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase italic text-[11px] tracking-widest ${activeTab === 'setup' ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}><Layers size={18} /> Store Setup</button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-black flex items-center gap-2 p-4 hover:bg-red-500/10 rounded-xl uppercase italic text-[11px] tracking-widest"><LogOut size={18} /> Logout</button>
      </div>

      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'inventory' && (
          <div className="space-y-10">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>
            
            <div className="bg-zinc-900/30 border border-white/10 p-12 rounded-[50px] space-y-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-black uppercase italic text-sm cursor-pointer focus:border-amber-500">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-black uppercase italic text-sm cursor-pointer focus:border-amber-500">
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              {/* DYNAMIC COMPATIBILITY FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/40 p-8 rounded-[35px] border border-white/5 animate-in fade-in duration-500">
                <div className={!(category.toLowerCase()==='cpu' || category.toLowerCase()==='motherboard' || category.toLowerCase()==='cooling') ? 'opacity-20 pointer-events-none' : ''}>
                  <label className="text-[10px] font-black text-amber-500 uppercase ml-2 mb-3 block tracking-widest italic">Socket Compatibility</label>
                  <input placeholder="e.g. LGA1150, LGA1700, AM4" value={socket} onChange={(e) => setSocket(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm" />
                </div>
                
                <div className={!(category.toLowerCase()==='ram' || category.toLowerCase()==='motherboard') ? 'opacity-20 pointer-events-none' : ''}>
                  <label className="text-[10px] font-black text-amber-500 uppercase ml-2 mb-3 block tracking-widest italic">RAM Generation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['DDR2', 'DDR3', 'DDR4', 'DDR5'].map((type) => (
                      <button key={type} onClick={() => setRamType(type)} className={`p-4 rounded-xl font-black text-[10px] italic transition-all border ${ramType === type ? 'bg-white text-black border-white shadow-lg shadow-white/20' : 'bg-zinc-900 text-zinc-600 border-white/5 hover:border-white/20'}`}>{type}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black text-sm" /></div>
                <div><label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-3 block tracking-widest">Cost</label><input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-red-500/10 p-5 rounded-2xl outline-none focus:border-red-500 font-black text-sm" /></div>
                <div><label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-3 block tracking-widest">Selling</label><input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-green-500/10 p-5 rounded-2xl outline-none focus:border-green-500 font-black text-sm" /></div>
                <button disabled={formLoading} onClick={handleAddProduct} className="bg-white text-black h-[68px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm flex items-center justify-center gap-3 shadow-2xl">{formLoading ? <RefreshCw className="animate-spin" /> : "Publish Product"}</button>
              </div>
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL (Direct Link)" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black text-[10px] text-zinc-500 italic" />
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-[40px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                  <tr><th className="p-8">Product Details</th><th className="p-8">Compatibility</th><th className="p-8">Pricing</th><th className="p-8">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8"><div className="flex items-center gap-6"><img src={p.image} className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/5" alt="" /><div className="font-black uppercase italic text-lg">{p.name}<span className="block text-[10px] text-zinc-600 not-italic uppercase mt-1">{p.category} • {p.stock} Units</span></div></div></td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          {p.socket && <span className="text-[9px] font-black text-amber-500 uppercase italic tracking-tighter bg-amber-500/5 px-2 py-1 rounded w-fit">Socket: {p.socket}</span>}
                          {p.ramType && <span className="text-[9px] font-black text-blue-500 uppercase italic tracking-tighter bg-blue-500/5 px-2 py-1 rounded w-fit">Type: {p.ramType}</span>}
                        </div>
                      </td>
                      <td className="p-8 font-black text-xl italic leading-none">LKR {p.sellingPrice?.toLocaleString()}<span className="block text-[9px] text-zinc-700 mt-2 uppercase tracking-widest">Cost: {p.buyingPrice?.toLocaleString()}</span></td>
                      <td className="p-8"><button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all hover:scale-125"><Trash2 size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Setup and Dashboard tabs logic goes here... */}
      </div>
    </div>
  );
};

export default Admin;