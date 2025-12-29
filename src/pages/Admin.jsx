import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, TrendingUp, 
  Lock, Trash2, Plus, LogOut, RefreshCw, AlertTriangle, ImageIcon, CheckCircle2 
} from 'lucide-react';
import { db } from "../firebase/config"; 
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
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

  // Function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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
      
      // Form Reset
      setName(""); setPrice(""); setStock(""); setImage("");
      
      showToast("Product added successfully!");
      fetchProducts();
    } catch (error) {
      showToast("Error adding product", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        showToast("Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        showToast("Failed to delete product", "error");
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      showToast("Invalid Admin Password", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans relative">
        {/* Login Toast */}
        {toast.show && (
          <div className={`fixed top-10 flex items-center gap-2 px-6 py-3 rounded-2xl font-black z-50 animate-bounce ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {toast.message}
          </div>
        )}

        <div className="bg-zinc-950 p-10 rounded-[40px] border border-white/10 w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6 text-amber-500 bg-amber-500/10 w-20 h-20 items-center rounded-full mx-auto">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic tracking-widest">DUMO ADMIN</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="ENTER ACCESS KEY"
              className="w-full bg-zinc-900 border border-white/5 p-5 rounded-2xl outline-none text-center font-bold text-xl focus:border-amber-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black hover:bg-amber-500 transition-all uppercase shadow-lg">
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans relative">
      
      {/* Dynamic Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black z-[100] shadow-2xl transition-all animate-in slide-in-from-right-10 ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-72 border-r border-white/5 p-8 flex flex-col pt-28">
        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${activeTab === 'dashboard' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:bg-zinc-900'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:bg-zinc-900'}`}>
            <Package size={20} /> Inventory
          </button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-4 p-4 text-red-500 font-black hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="flex-1 p-12 pt-28 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-10">
            <h1 className="text-7xl font-black italic uppercase tracking-tighter">STATISTICS</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5">
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Total Inventory</p>
                <p className="text-5xl font-black mt-1 italic">{products.length} SKU</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">INVENTORY</h1>

            {/* PRODUCT FORM */}
            <form onSubmit={handleAddProduct} className="bg-zinc-900/40 p-8 rounded-[40px] border border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Component Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="e.g. RTX 4080 Super" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Price (LKR)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Initial Stock</label>
                  <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="Qty" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 font-bold uppercase">
                    {['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block tracking-widest flex items-center gap-2">
                    <ImageIcon size={14} /> Image Source URL (Optional)
                  </label>
                  <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="Paste link here..." />
                </div>
                <button disabled={formLoading} className="bg-white text-black h-[60px] px-12 rounded-2xl font-black hover:bg-amber-500 transition-all flex items-center justify-center shadow-lg">
                  {formLoading ? <RefreshCw className="animate-spin" /> : "SAVE TO DATABASE"}
                </button>
              </div>
            </form>

            {/* INVENTORY TABLE */}
            <div className="bg-zinc-950 rounded-[45px] border border-white/5 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/80 text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                  <tr>
                    <th className="p-8">Preview</th>
                    <th className="p-8">Description</th>
                    <th className="p-8">Pricing</th>
                    <th className="p-8">Stock Status</th>
                    <th className="p-8 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-8">
                        <img src={product.image} alt="" className="w-14 h-14 object-cover rounded-xl border border-white/10 bg-zinc-900" />
                      </td>
                      <td className="p-8">
                        <p className="font-bold text-lg leading-tight">{product.name}</p>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{product.category}</span>
                      </td>
                      <td className="p-8 font-black text-amber-500 text-xl">LKR {product.price.toLocaleString()}</td>
                      <td className="p-8 font-black">
                        <div className={`flex items-center gap-2 ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                           <span className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                           {product.stock} Units
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <button onClick={() => handleDelete(product.id)} className="p-4 bg-red-500/5 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 size={20} />
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