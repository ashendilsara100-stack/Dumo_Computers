import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  AlertTriangle, CheckCircle2, TrendingUp, DollarSign, ShoppingCart
} from 'lucide-react';
import { db } from "../firebase/config"; // ඔයාගේ Firebase config file එකේ path එක බලන්න
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  serverTimestamp, query, orderBy 
} from "firebase/firestore";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // කෙලින්ම Form එක පේන්න 'inventory' දැම්මා
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Form Fields
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
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProducts();
  }, [isAuthenticated]);

  const handleAddProduct = async (e) => {
    if (e) e.preventDefault();
    if (!name || !buyingPrice || !sellingPrice || !stock) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice),
        stock: Number(stock),
        category,
        image: image || "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); setImage("");
      showToast("Product published successfully!", "success");
      fetchProducts();
    } catch (error) {
      showToast("Error saving data", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Product deleted", "success");
        fetchProducts();
      } catch (error) {
        showToast("Error deleting", "error");
      }
    }
  };

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else showToast("Invalid Password", "error");
  };

  // Stats Calculations
  const totalInvestment = products.reduce((sum, p) => sum + (Number(p.buyingPrice || 0) * Number(p.stock || 0)), 0);
  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.sellingPrice || 0) * Number(p.stock || 0)), 0);
  const totalProfit = totalRevenue - totalInvestment;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white italic">
        <div className="bg-zinc-900 border border-white/10 p-10 rounded-[30px] w-full max-w-md text-center">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8">DUMO ADMIN</h2>
          <input 
            type="password" 
            placeholder="Enter Password"
            className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase">Unlock</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 border-r border-white/10 p-8 flex flex-col bg-zinc-950 sticky top-0 h-screen">
        <h2 className="text-3xl font-black italic text-amber-500 mb-12">DUMO</h2>
        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-white text-black' : 'text-zinc-500 hover:bg-white/5'}`}
          >
            <Package size={20} /> Inventory
          </button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-bold flex items-center gap-2 p-4 hover:bg-red-500/5 rounded-xl">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-10 animate-in fade-in">
            <h1 className="text-7xl font-black italic tracking-tighter uppercase">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[35px]">
                <p className="text-zinc-500 font-bold text-xs uppercase mb-1">Total Investment</p>
                <p className="text-4xl font-black italic">LKR {totalInvestment.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-[35px]">
                <p className="text-amber-500 font-bold text-xs uppercase mb-1">Stock Value (Sell)</p>
                <p className="text-4xl font-black italic text-white">LKR {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900/50 border border-green-500/20 p-8 rounded-[35px]">
                <p className="text-green-500 font-bold text-xs uppercase mb-1">Potential Profit</p>
                <p className="text-4xl font-black italic text-green-500">LKR {totalProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <h1 className="text-7xl font-black italic tracking-tighter uppercase">Inventory</h1>

            {/* PRODUCT FORM */}
            <div className="bg-zinc-900/30 border border-white/10 p-10 rounded-[40px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none font-bold">
                    {['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'PSU', 'Case'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Stock Qty</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block">Buying Price (Cost)</label>
                  <input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-red-500/20 p-4 rounded-xl outline-none focus:border-red-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-2 block">Selling Price</label>
                  <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-green-500/20 p-4 rounded-xl outline-none focus:border-green-500 font-bold" />
                </div>
                <button 
                  disabled={formLoading} 
                  onClick={handleAddProduct}
                  className="bg-white text-black h-[58px] rounded-xl font-black hover:bg-amber-500 transition-all flex items-center justify-center gap-2 uppercase italic"
                >
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish Item"}
                </button>
              </div>
            </div>

            {/* PRODUCT TABLE */}
            <div className="bg-zinc-950 border border-white/10 rounded-[30px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase">
                  <tr>
                    <th className="p-6">Product</th>
                    <th className="p-6">Cost</th>
                    <th className="p-6">Price</th>
                    <th className="p-6">Profit</th>
                    <th className="p-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="p-10 text-center font-bold animate-pulse">Loading Database...</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-6 font-black uppercase italic">{p.name} <span className="block text-[10px] text-zinc-600 not-italic">Stock: {p.stock}</span></td>
                      <td className="p-6 font-bold text-zinc-500">LKR {p.buyingPrice?.toLocaleString()}</td>
                      <td className="p-6 font-black text-white italic">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-6 font-black text-green-500 italic">+LKR {(p.sellingPrice - p.buyingPrice).toLocaleString()}</td>
                      <td className="p-6 text-center">
                        <button onClick={() => handleDelete(p.id)} className="text-zinc-700 hover:text-red-500 transition-colors">
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