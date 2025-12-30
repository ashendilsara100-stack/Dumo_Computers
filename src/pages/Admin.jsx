import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  AlertTriangle, Image as ImageIcon, CheckCircle2, Zap, TrendingUp, ShoppingBag
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

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("CPU");
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000); // 4 seconds penna thiyanawa
  };

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

  // FIX: handleAddProduct Logic with proper loading states
  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!name || !price || !stock) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setFormLoading(true); // Animation starts

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        image: image || "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      
      // Clear form after success
      setName(""); setPrice(""); setStock(""); setImage("");
      
      showToast("Product published successfully!", "success");
      
      // Refresh the list to show the new product
      await fetchProducts();
      
    } catch (error) {
      console.error("Firebase Error:", error);
      showToast("Failed to connect to database", "error");
    } finally {
      setFormLoading(false); // Animation stops NO MATTER WHAT
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Product deleted successfully!", "success");
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
                className="w-full bg-zinc-900 border-2 border-white/5 p-5 rounded-2xl outline-none text-center font-bold text-2xl focus:border-amber-500 transition-all placeholder-zinc-700 text-white"
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
      
      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black z-[100] shadow-2xl animate-in slide-in-from-right-5 border-2 ${toast.type === 'error' ? 'bg-black text-red-500 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-black text-green-500 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="hidden lg:flex w-80 border-r border-white/10 p-10 flex-col bg-zinc-950/50 backdrop-blur-xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2 text-amber-500 font-black italic text-3xl">
             DUMO
          </div>
          <p className="text-gray-500 font-black text-[10px] tracking-[0.3em] uppercase">Control Center v2.5</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'}`}>
            <LayoutDashboard size={22} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all ${activeTab === 'inventory' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'}`}>
            <Package size={22} /> Inventory
          </button>
        </nav>

        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-4 p-5 text-red-500 font-black hover:bg-red-500/10 rounded-2xl transition-all mt-auto border border-red-500/20">
          <LogOut size={22} /> Logout
        </button>
      </div>

      <div className="flex-1 p-4 lg:p-16 pt-32 lg:pt-16 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-12">
             <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic">OVERVIEW</h1>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[40px]">
                   <p className="text-zinc-500 font-black text-xs uppercase mb-2">Inventory Total</p>
                   <p className="text-6xl font-black italic">{products.length}</p>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[40px]">
                   <p className="text-zinc-500 font-black text-xs uppercase mb-2">Total Value</p>
                   <p className="text-6xl font-black italic">{(totalValue / 100000).toFixed(1)}L</p>
                </div>
                <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[40px]">
                   <p className="text-red-500 font-black text-xs uppercase mb-2">Low Stock</p>
                   <p className="text-6xl font-black italic text-red-500">{lowStock}</p>
                </div>
             </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-2">
            <div>
              <h1 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter italic leading-none">INVENTORY</h1>
              <p className="text-zinc-500 font-bold mt-4 uppercase text-xs tracking-[0.3em]">DATABASE SYNC: ONLINE</p>
            </div>

            {/* PRODUCT FORM */}
            <div className="bg-zinc-900/30 border border-white/10 p-8 lg:p-12 rounded-[50px] space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold text-white" placeholder="Product Name" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block">Price (LKR)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold text-white" placeholder="0" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block">Stock</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold text-white" placeholder="0" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-black uppercase text-white">
                    {['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'].map(cat => (
                      <option key={cat} value={cat} className="bg-black text-white font-bold">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2 block">Image URL</label>
                  <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-amber-500 font-bold text-white" placeholder="https://..." />
                </div>
                <button 
                  disabled={formLoading} 
                  onClick={handleAddProduct}
                  className="bg-white text-black h-[75px] px-16 rounded-2xl font-black hover:bg-amber-500 active:scale-95 transition-all flex items-center justify-center uppercase shadow-2xl disabled:opacity-50 italic text-xl min-w-[280px]"
                >
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish to Shop"}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-zinc-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-black font-black text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="p-8">Visual</th>
                      <th className="p-8">Product Details</th>
                      <th className="p-8">Price</th>
                      <th className="p-8 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr><td colSpan="4" className="p-20 text-center animate-pulse text-zinc-500 font-black">SYNCING...</td></tr>
                    ) : products.map(product => (
                      <tr key={product.id} className="hover:bg-white/[0.03] transition-all">
                        <td className="p-8">
                          <img src={product.image} className="w-16 h-16 object-cover rounded-2xl border border-white/10" alt="" />
                        </td>
                        <td className="p-8">
                          <p className="font-black text-lg uppercase italic leading-none mb-1">{product.name}</p>
                          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{product.category} | {product.stock} Units</span>
                        </td>
                        <td className="p-8 font-black text-xl italic">LKR {product.price.toLocaleString()}</td>
                        <td className="p-8 text-center">
                          <button onClick={() => handleDelete(product.id)} className="p-5 bg-zinc-900 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all border border-white/5">
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