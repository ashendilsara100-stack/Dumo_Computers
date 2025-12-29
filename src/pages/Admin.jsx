import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, TrendingUp, 
  Lock, Edit3, Trash2, Plus, LogOut, CheckCircle, RefreshCw 
} from 'lucide-react';
import { db } from "../firebase/config"; // ඔයාගේ config path එක නිවැරදිද බලන්න
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
  
  // Products State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("CPU");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  // 1. Fetch Products from Firestore
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
      console.error("Error fetching products: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  // 2. Add Product to Firestore
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert("Please fill all fields!");

    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        category,
        createdAt: serverTimestamp()
      });
      
      setName("");
      setPrice("");
      alert("Product added successfully!");
      fetchProducts(); // List එක update කරනවා
    } catch (error) {
      alert("Error adding product: " + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 3. Delete Product from Firestore
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (error) {
        alert("Error deleting: " + error.message);
      }
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setIsAuthenticated(true);
    else alert("Invalid Password!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white font-sans">
        <div className="bg-zinc-950 p-10 rounded-[40px] border border-white/10 w-full max-w-md">
          <div className="flex justify-center mb-6 text-amber-500">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-center mb-8 uppercase italic tracking-widest">DUMO ADMIN</h2>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="ENTER PASSWORD"
              className="w-full bg-zinc-900 border border-white/5 p-5 rounded-2xl outline-none text-center font-bold text-xl focus:border-amber-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black hover:bg-amber-500 transition-all uppercase">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* SIDEBAR */}
      <div className="w-72 border-r border-white/5 p-8 flex flex-col pt-28">
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${activeTab === 'dashboard' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:bg-zinc-900'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:bg-zinc-900'}`}
          >
            <Package size={20} /> Inventory
          </button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-4 p-4 text-red-500 font-black hover:bg-red-500/10 rounded-2xl">
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-12 pt-28 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-10">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">OVERVIEW</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950 p-8 rounded-[40px] border border-white/5">
                <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Total Products</p>
                <p className="text-4xl font-black mt-1 italic text-amber-500">{products.length}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">INVENTORY</h1>

            {/* ADD PRODUCT FORM */}
            <form onSubmit={handleAddProduct} className="bg-zinc-900/50 p-8 rounded-[35px] border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="e.g. Core i9" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Price</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500" placeholder="LKR" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500">
                  <option value="CPU">CPU</option>
                  <option value="GPU">GPU</option>
                  <option value="Motherboard">Motherboard</option>
                  <option value="RAM">RAM</option>
                  <option value="Storage">Storage</option>
                  <option value="Cooling">Cooling</option>
                  <option value="PSU">PSU</option>
                  <option value="Case">Case</option>
                </select>
              </div>
              <button disabled={formLoading} className="bg-white text-black h-[58px] rounded-2xl font-black hover:bg-amber-500 transition-all">
                {formLoading ? <RefreshCw className="animate-spin mx-auto" /> : "ADD ITEM"}
              </button>
            </form>

            {/* PRODUCT TABLE */}
            <div className="bg-zinc-950 rounded-[40px] border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-900/50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="p-8 text-left">Product</th>
                    <th className="p-8 text-left">Category</th>
                    <th className="p-8 text-left">Price</th>
                    <th className="p-8 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="4" className="p-10 text-center animate-pulse">Loading Inventory...</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-8 font-bold">{product.name}</td>
                      <td className="p-8"><span className="bg-zinc-800 px-3 py-1 rounded-full text-[10px] font-black">{product.category}</span></td>
                      <td className="p-8 font-black text-amber-500">LKR {product.price.toLocaleString()}</td>
                      <td className="p-8 text-center">
                        <button onClick={() => handleDelete(product.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
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