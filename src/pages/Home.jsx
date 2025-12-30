import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Image as ImageIcon, ShoppingCart, Plus, List
} from 'lucide-react';
import { db } from "../firebase/config"; 
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Form States
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("CPU");
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) fetchProducts(); }, [isAuthenticated]);

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!name || !buyingPrice || !sellingPrice || !stock) {
      showToast("Fields Missing!", "error");
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name, buyingPrice: Number(buyingPrice), sellingPrice: Number(sellingPrice),
        stock: Number(stock), category, image: image || "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); setImage("");
      showToast("Product Published!", "success");
      fetchProducts();
    } catch (error) { showToast("Error!", "error"); } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete Product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Deleted!", "success");
        fetchProducts();
      } catch (error) { showToast("Error!", "error"); }
    }
  };

  // Calculations
  const totalInvestment = products.reduce((sum, p) => sum + (Number(p.buyingPrice || 0) * Number(p.stock || 0)), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.sellingPrice || 0) * Number(p.stock || 0)), 0);
  const totalProfit = totalRevenue - totalInvestment;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white italic">
        <div className="bg-zinc-900/50 border border-white/10 p-12 rounded-[40px] w-full max-w-md text-center backdrop-blur-xl">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-4xl font-black mb-8 tracking-tighter">DUMO ADMIN</h2>
          <input 
            type="password" placeholder="PASSWORD"
            className="w-full bg-black border border-white/10 p-5 rounded-2xl mb-6 text-center font-bold outline-none focus:border-amber-500"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Wrong Password", "error")} className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase hover:bg-amber-500 transition-all">Unlock System</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-amber-500">
      
      {/* SIDEBAR */}
      <div className="w-80 border-r border-white/5 p-10 flex flex-col bg-zinc-950/50 sticky top-0 h-screen">
        <div className="mb-16">
          <h2 className="text-4xl font-black italic text-white tracking-tighter">DUMO<span className="text-amber-500">.</span></h2>
          <p className="text-[10px] text-zinc-600 font-black tracking-[0.2em] mt-1">CORE MANAGEMENT</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-5 rounded-[20px] font-black transition-all ${activeTab === 'dashboard' ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}>
            <LayoutDashboard size={22} /> DASHBOARD
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 p-5 rounded-[20px] font-black transition-all ${activeTab === 'inventory' ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}>
            <Package size={22} /> INVENTORY
          </button>
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 p-5 text-zinc-700 hover:text-red-500 font-black transition-colors">
          <LogOut size={20} /> LOGOUT
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-16 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[45px] group hover:border-white/20 transition-all">
                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-4">Total Investment</p>
                <p className="text-5xl font-black italic">LKR {(totalInvestment / 1000).toFixed(1)}K</p>
                <div className="w-12 h-1 bg-zinc-800 mt-6 group-hover:w-full transition-all duration-500"></div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[45px] group hover:border-amber-500/20 transition-all">
                <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-4">Expected Revenue</p>
                <p className="text-5xl font-black italic">LKR {(totalRevenue / 1000).toFixed(1)}K</p>
                <div className="w-12 h-1 bg-amber-500/30 mt-6 group-hover:w-full transition-all duration-500"></div>
              </div>
              <div className="bg-zinc-900/40 border border-green-500/10 p-10 rounded-[45px] group hover:border-green-500/40 transition-all">
                <p className="text-green-500 font-black text-xs uppercase tracking-widest mb-4">Potential Profit</p>
                <p className="text-5xl font-black italic text-green-500">LKR {(totalProfit / 1000).toFixed(1)}K</p>
                <div className="w-12 h-1 bg-green-500/30 mt-6 group-hover:w-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>

            {/* PRODUCT FORM */}
            <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[50px] space-y-10 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 mb-3 block tracking-widest">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-[20px] outline-none focus:border-amber-500 font-bold transition-all" placeholder="e.g. RTX 4090 OC Edition" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 mb-3 block tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-[20px] outline-none font-bold appearance-none cursor-pointer">
                    {['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 mb-3 block tracking-widest">Units In Stock</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-[20px] outline-none focus:border-amber-500 font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                <div>
                  <label className="text-[10px] font-black text-red-500 uppercase ml-4 mb-3 block tracking-widest italic">Unit Cost (Buying)</label>
                  <input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-red-500/20 p-5 rounded-[20px] outline-none focus:border-red-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-green-500 uppercase ml-4 mb-3 block tracking-widest italic">Unit Price (Selling)</label>
                  <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-green-500/20 p-5 rounded-[20px] outline-none focus:border-green-500 font-bold" />
                </div>
                <button disabled={formLoading} onClick={handleAddProduct} className="bg-white text-black h-16 rounded-[22px] font-black hover:bg-amber-500 transition-all flex items-center justify-center gap-3 uppercase italic tracking-tighter">
                  {formLoading ? <RefreshCw className="animate-spin" /> : <><Plus size={20} /> Add to Stock</>}
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 mb-3 block tracking-widest">Image Source URL</label>
                <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-[20px] outline-none focus:border-amber-500 font-bold" placeholder="https://..." />
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-zinc-950/50 border border-white/5 rounded-[40px] overflow-hidden backdrop-blur-md">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em]">
                  <tr>
                    <th className="p-8">Product Details</th>
                    <th className="p-8">Finances</th>
                    <th className="p-8">Unit Profit</th>
                    <th className="p-8 text-center">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-black rounded-2xl overflow-hidden border border-white/5">
                            <img src={p.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <p className="font-black uppercase italic text-xl tracking-tight">{p.name}</p>
                            <span className="text-[10px] text-zinc-500 font-black tracking-widest">{p.category} • STOCK: {p.stock}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="text-zinc-500 font-bold text-xs uppercase">Cost: LKR {p.buyingPrice?.toLocaleString()}</p>
                        <p className="text-white font-black text-lg italic">Sell: LKR {p.sellingPrice?.toLocaleString()}</p>
                      </td>
                      <td className="p-8 font-black text-green-500 text-xl italic tracking-tighter">
                        +LKR {(p.sellingPrice - p.buyingPrice).toLocaleString()}
                      </td>
                      <td className="p-8 text-center">
                        <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all mx-auto">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
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