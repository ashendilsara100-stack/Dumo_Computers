import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  AlertTriangle, Image as ImageIcon, CheckCircle2, Zap, TrendingUp, ShoppingBag
} from 'lucide-react';
import { db } from "../firebase/config"; // Ensure this path is correct
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

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("CPU");
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch Products from Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(items);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProducts();
  }, [isAuthenticated]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        image: image || "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      
      setName(""); setPrice(""); setStock(""); setImage("");
      showToast("Product added to Cloud successfully!");
      fetchProducts();
    } catch (error) {
      showToast("Failed to save product", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Product removed successfully!");
        fetchProducts();
      } catch (error) {
        showToast("Error deleting product", "error");
      }
    }
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      showToast("Invalid Admin Password", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white relative font-sans">
        {toast.show && (
          <div className={`fixed top-10 flex items-center gap-2 px-6 py-3 rounded-2xl font-black z-50 animate-bounce border-2 ${toast.type === 'error' ? 'bg-black text-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black text-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'}`}>
            {toast.message}
          </div>
        )}

        <div className="bg-black border-2 border-white/20 p-12 rounded-[40px] w-full max-w-md shadow-[0_20px_50px_rgba(255,255,255,0.05)] text-center">
          <div className="flex justify-center mb-8 text-white bg-white/5 w-24 h-24 items-center rounded-full mx-auto border-2 border-white/10 shadow-inner">
            <Lock size={48} />
          </div>
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">DUMO</h2>
          <p className="text-gray-500 font-bold mb-10 tracking-widest text-xs uppercase">Encrypted Admin Access</p>
          
          <div className="space-y-6 text-left">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-[0.2em]">Security Key</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-zinc-900 border-2 border-white/5 p-5 rounded-2xl outline-none text-center font-bold text-2xl focus:border-amber-500 transition-all placeholder-zinc-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black py-5 rounded-2xl font-black hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all uppercase shadow-xl tracking-widest"
            >
              Unlock Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStock = products.filter(p => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-black text-white flex relative font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black z-[100] shadow-2xl animate-in slide-in-from-right-5 border-2 ${toast.type === 'error' ? 'bg-black text-red-500 border-red-500' : 'bg-black text-green-500 border-green-500'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="hidden lg:flex w-80 border-r border-white/10 p-10 flex-col bg-zinc-950/50 backdrop-blur-xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2 text-amber-500">
             <Zap fill="currentColor" size={32} />
             <h1 className="text-4xl font-black italic tracking-tighter text-white">DUMO</h1>
          </div>
          <p className="text-gray-500 font-black text-[10px] tracking-[0.3em] uppercase">Control Center v2.5</p>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'inventory', icon: Package, label: 'Inventory' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-[0_10px_20px_rgba(245,158,11,0.2)]' 
                  : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={22} /> {tab.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="flex items-center gap-4 p-5 text-red-500 font-black hover:bg-red-500/10 rounded-2xl transition-all mt-auto"
        >
          <LogOut size={22} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-4 lg:p-16 pt-32 lg:pt-16 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent)]">
        {activeTab === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div>
              <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic">OVERVIEW</h1>
              <div className="h-2 w-24 bg-amber-500 mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[40px] hover:border-white/20 transition-all">
                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-2">Active Inventory</p>
                <p className="text-6xl font-black italic">{products.length}<span className="text-amber-500 text-2xl ml-2">SKU</span></p>
              </div>

              <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[40px] hover:border-white/20 transition-all">
                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-2">Stock Valuation</p>
                <p className="text-6xl font-black italic">{(totalValue / 100000).toFixed(1)}<span className="text-amber-500 text-2xl ml-2">Lakhs</span></p>
              </div>

              <div className="bg-zinc-900/30 border border-red-500/20 p-10 rounded-[40px] hover:border-red-500/40 transition-all">
                <p className="text-red-500/50 font-black text-xs uppercase tracking-widest mb-2">Restock Needed</p>
                <p className="text-6xl font-black italic text-red-500">{lowStock}</p>
              </div>
            </div>

            <div className="pt-10">
              <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter">Live Inventory Stream</h2>
              <div className="grid grid-cols-1 gap-4">
                {products.slice(0, 4).map(p => (
                  <div key={p.id} className="bg-zinc-900/20 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:bg-white hover:text-black transition-all">
                    <div className="flex items-center gap-6">
                      <img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
                      <div>
                        <p className="font-black text-xl uppercase italic leading-none mb-1">{p.name}</p>
                        <p className="text-xs font-black text-amber-500 group-hover:text-zinc-500 uppercase tracking-widest">{p.category}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black">LKR {p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-500">
            <div>
              <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">INVENTORY</h1>
              <p className="text-zinc-500 font-bold mt-4 uppercase tracking-[0.4em] text-xs">Cloud Database Sync: Active</p>
            </div>

            {/* PRODUCT FORM */}
            <div className="bg-zinc-900/30 border border-white/10 p-8 lg:p-12 rounded-[50px] space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block text-white/50">Component Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="e.g. Core i9 14900K" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block text-white/50">Price (LKR)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block text-white/50">Units in Stock</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="0" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block text-white/50">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase transition-all cursor-pointer"
                  >
                    {['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'].map(cat => (
                      <option key={cat} value={cat} className="bg-black">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block text-white/50 flex items-center gap-2">
                    <ImageIcon size={14} /> Global Image URL
                  </label>
                  <input 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="https://..." 
                  />
                </div>
                <button 
                  disabled={formLoading} 
                  onClick={handleAddProduct}
                  className="bg-white text-black h-[75px] px-16 rounded-2xl font-black hover:bg-amber-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center uppercase shadow-2xl disabled:opacity-50 tracking-tighter italic text-xl"
                >
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish to Shop"}
                </button>
              </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-zinc-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white text-black uppercase font-black text-[10px] tracking-[0.3em]">
                    <tr>
                      <th className="p-8">Visual</th>
                      <th className="p-8">Details</th>
                      <th className="p-8">Price Point</th>
                      <th className="p-8">Inventory</th>
                      <th className="p-8 text-center">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan="5" className="p-20 text-center animate-pulse text-zinc-500 font-black uppercase tracking-widest">Synchronizing Database...</td></tr>
                    ) : products.map(product => (
                      <tr key={product.id} className="hover:bg-white/[0.03] transition-all group">
                        <td className="p-8">
                          <img src={product.image} alt="" className="w-16 h-16 object-cover rounded-2xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </td>
                        <td className="p-8">
                          <p className="font-black text-lg uppercase italic group-hover:text-amber-500 transition-colors">{product.name}</p>
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{product.category}</span>
                        </td>
                        <td className="p-8 font-black text-2xl tracking-tighter">
                          LKR {product.price.toLocaleString()}
                        </td>
                        <td className="p-8 font-black">
                          <div className={`flex items-center gap-3 ${product.stock < 5 ? 'text-red-500' : 'text-zinc-400 group-hover:text-white'}`}>
                            <span className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
                            {product.stock} UNITS
                          </div>
                        </td>
                        <td className="p-8 text-center">
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-5 bg-zinc-900 text-zinc-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all border border-white/5 hover:border-red-500 hover:scale-110 shadow-lg"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;