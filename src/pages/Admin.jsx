import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  AlertTriangle, Image as ImageIcon, CheckCircle2, Zap, TrendingUp, DollarSign
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

  // Updated Form Fields
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState(""); // ගත්ත මිල
  const [sellingPrice, setSellingPrice] = useState(""); // විකුණන මිල
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
      showToast("Fill all required fields", "error");
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
      showToast("Product published to shop!", "success");
      fetchProducts();
    } catch (error) {
      showToast("Database Error", "error");
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
      } catch (error) { showToast("Error", "error"); }
    }
  };

  // calculations for Overview
  const totalInvestment = products.reduce((sum, p) => sum + (p.buyingPrice * p.stock), 0);
  const totalExpectedRevenue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);
  const potentialProfit = totalExpectedRevenue - totalInvestment;

  if (!isAuthenticated) {
     // ... (Login Code එක කලින් වගේමයි)
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Toast & Sidebar (කලින් වගේමයි) */}

      <div className="flex-1 p-6 lg:p-16 pt-32 lg:pt-16 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-12 animate-in fade-in">
            <h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter">OVERVIEW</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px]">
                <p className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-2">Total Investment</p>
                <p className="text-4xl font-black italic">LKR {(totalInvestment / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">Cost of current stock</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px]">
                <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-2">Expected Revenue</p>
                <p className="text-4xl font-black italic text-white">LKR {(totalExpectedRevenue / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">Total selling value</p>
              </div>

              <div className="bg-zinc-900/40 border border-green-500/20 p-8 rounded-[40px]">
                <p className="text-green-500 font-black text-xs uppercase tracking-widest mb-2">Potential Profit</p>
                <p className="text-4xl font-black italic text-green-500">LKR {(potentialProfit / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">Estimated earnings</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter">INVENTORY</h1>

            {/* PRODUCT FORM */}
            <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-[40px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block italic text-red-400">Buying Price (Cost)</label>
                  <input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-red-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block italic text-green-400">Selling Price</label>
                  <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-green-500 font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Stock Qty</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 font-bold" />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Image URL</label>
                  <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-amber-500 font-bold" />
                </div>
                <button 
                  disabled={formLoading} 
                  onClick={handleAddProduct}
                  className="bg-white text-black h-[60px] px-10 rounded-xl font-black hover:bg-amber-500 transition-all flex items-center gap-3 uppercase italic"
                >
                  {formLoading ? <RefreshCw className="animate-spin" /> : <><Package size={20}/> Publish Item</>}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-zinc-950 border border-white/10 rounded-[30px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900 text-zinc-500 font-black text-[10px] uppercase">
                  <tr>
                    <th className="p-6">Product</th>
                    <th className="p-6">Cost</th>
                    <th className="p-6">Price</th>
                    <th className="p-6">Profit/Unit</th>
                    <th className="p-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-all group">
                      <td className="p-6">
                        <p className="font-black uppercase italic">{p.name}</p>
                        <span className="text-[10px] text-zinc-500 font-bold">{p.category} | Stock: {p.stock}</span>
                      </td>
                      <td className="p-6 font-bold text-zinc-500">LKR {p.buyingPrice?.toLocaleString()}</td>
                      <td className="p-6 font-black text-white italic">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-6 font-black text-green-500 italic">
                        +LKR {(p.sellingPrice - p.buyingPrice).toLocaleString()}
                      </td>
                      <td className="p-6">
                        <button onClick={() => handleDelete(p.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
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