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

  // Form Fields
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Real-time Data Listeners
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

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCatName.trim() });
    setNewCatName("");
    showToast("Category added!");
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    await addDoc(collection(db, "brands"), { name: newBrandName.trim() });
    setNewBrandName("");
    showToast("Brand added!");
  };

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!name || !buyingPrice || !sellingPrice || !stock || !category || !selectedBrand) {
      showToast("Fill all fields including Brand & Category", "error");
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
        createdAt: serverTimestamp()
      });
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); setImage(""); setSelectedBrand("");
      showToast("Product published!");
    } catch (error) { showToast("Error saving", "error"); }
    setFormLoading(false);
  };

  const deleteItem = async (id, collectionName) => {
    if (window.confirm(`Delete this ${collectionName}?`)) {
      await deleteDoc(doc(db, collectionName, id));
      showToast("Deleted successfully");
    }
  };

  const handleLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else showToast("Invalid Password", "error");
  };

  // Calculations
  const totalInvestment = products.reduce((sum, p) => sum + (Number(p.buyingPrice || 0) * Number(p.stock || 0)), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.sellingPrice || 0) * Number(p.stock || 0)), 0);
  const totalProfit = totalRevenue - totalInvestment;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white italic font-sans">
        <div className="bg-zinc-900 border border-white/10 p-10 rounded-[30px] w-full max-w-md text-center">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">DUMO ADMIN</h2>
          <input type="password" placeholder="Enter Password" className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold outline-none focus:border-amber-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase italic hover:bg-amber-500 transition-all">Unlock</button>
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

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[45px]"><p className="text-zinc-500 font-black text-[10px] uppercase mb-2 tracking-widest">Total Investment</p><p className="text-5xl font-black italic">LKR {totalInvestment.toLocaleString()}</p></div>
              <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[45px]"><p className="text-amber-500 font-black text-[10px] uppercase mb-2 tracking-widest">Stock Value</p><p className="text-5xl font-black italic">LKR {totalRevenue.toLocaleString()}</p></div>
              <div className="bg-zinc-900/50 border border-green-500/20 p-10 rounded-[45px]"><p className="text-green-500 font-black text-[10px] uppercase mb-2 tracking-widest">Potential Profit</p><p className="text-5xl font-black italic text-green-500">LKR {totalProfit.toLocaleString()}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>
            
            <div className="bg-zinc-900/30 border border-white/10 p-12 rounded-[50px] space-y-10 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2"><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Product Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm" /></div>
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-black uppercase italic text-sm cursor-pointer focus:border-amber-500">
                    <option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none font-black uppercase italic text-sm cursor-pointer focus:border-amber-500">
                    <option value="">Select Brand</option>{brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-3 block tracking-widest">Stock Qty</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black text-sm" /></div>
                <div><label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-3 block tracking-widest">Cost (LKR)</label><input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-red-500/20 p-5 rounded-2xl outline-none focus:border-red-500 font-black text-sm" /></div>
                <div><label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-3 block tracking-widest">Selling (LKR)</label><input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-green-500/20 p-5 rounded-2xl outline-none focus:border-green-500 font-black text-sm" /></div>
                <button disabled={formLoading} onClick={handleAddProduct} className="bg-white text-black h-[64px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm flex items-center justify-center gap-3 active:scale-95 shadow-lg">{formLoading ? <RefreshCw className="animate-spin" /> : "Publish Item"}</button>
              </div>
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image Link (https://...)" className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black text-[11px] text-zinc-500" />
            </div>

            <div className="bg-zinc-950 border border-white/10 rounded-[40px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/5"><tr><th className="p-8">Product</th><th className="p-8">Brand</th><th className="p-8">Pricing</th><th className="p-8">Action</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8"><div className="flex items-center gap-6"><img src={p.image} className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-xl border border-white/5" /><div className="font-black uppercase italic text-lg leading-tight">{p.name}<span className="block text-[10px] text-zinc-600 not-italic uppercase tracking-widest mt-1">{p.category} • {p.stock} In Stock</span></div></div></td>
                      <td className="p-8 font-black text-amber-500 italic uppercase tracking-widest text-xs">{p.brand}</td>
                      <td className="p-8"><span className="text-[10px] text-zinc-600 block uppercase font-black mb-1">Profit: +{(p.sellingPrice - p.buyingPrice).toLocaleString()}</span><span className="font-black text-xl italic">LKR {p.sellingPrice?.toLocaleString()}</span></td>
                      <td className="p-8 text-center"><button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all transform hover:scale-125"><Trash2 size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none text-white/90">Store Setup</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* CATEGORY SECTION */}
              <div className="space-y-8">
                <div className="bg-zinc-900/30 border border-white/10 p-10 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase tracking-widest text-amber-500">Categories</h2>
                  <div className="flex gap-4">
                    <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category Name" className="flex-1 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic" />
                    <button onClick={handleAddCategory} className="bg-white text-black px-8 rounded-2xl font-black uppercase italic hover:bg-amber-500 transition-all active:scale-95">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-amber-500/30 transition-all">
                      <span className="font-black italic uppercase tracking-widest text-sm">{cat.name}</span>
                      <button onClick={() => deleteItem(cat.id, "categories")} className="text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* BRAND SECTION */}
              <div className="space-y-8">
                <div className="bg-zinc-900/30 border border-white/10 p-10 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase tracking-widest text-blue-500">Brands</h2>
                  <div className="flex gap-4">
                    <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Brand Name" className="flex-1 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic" />
                    <button onClick={handleAddBrand} className="bg-white text-black px-8 rounded-2xl font-black uppercase italic hover:bg-blue-500 transition-all active:scale-95">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brands.map(brand => (
                    <div key={brand.id} className="bg-zinc-900/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                      <span className="font-black italic uppercase tracking-widest text-sm">{brand.name}</span>
                      <button onClick={() => deleteItem(brand.id, "brands")} className="text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;