import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, 
  Layers, Menu, X, Tag
} from 'lucide-react';
import { db } from "../firebase/config";
import { 
  collection, addDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy, onSnapshot 
} from "firebase/firestore";
import SpaceBackground from "../components/SpaceBackground";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(""); 
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "1234"; 
  const IMGBB_API_KEY = "cbabafe642eea7200b76cb9136e84615";

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.data.url);
        showToast("Image Uploaded!");
      }
    } catch { showToast("Upload failed", "error"); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub1 = onSnapshot(query(collection(db,"products"), orderBy("createdAt","desc")), s => setProducts(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsub2 = onSnapshot(query(collection(db,"categories"), orderBy("name","asc")), s => setCategories(s.docs.map(d => ({id:d.id, ...d.data()}))));
    const unsub3 = onSnapshot(query(collection(db,"brands"), orderBy("name","asc")), s => setBrands(s.docs.map(d => ({id:d.id, ...d.data()}))));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [isAuthenticated]);

  const handleAddProduct = async () => {
    if (!name || !sellingPrice || !image) return showToast("Required fields empty!", "error");
    setFormLoading(true);
    await addDoc(collection(db,"products"),{
      name, brand: selectedBrand, sellingPrice: Number(sellingPrice),
      stock: Number(stock), category, image, createdAt: serverTimestamp()
    });
    setName(""); setSellingPrice(""); setStock(""); setImage("");
    showToast("Product Published!");
    setFormLoading(false);
  };

  const deleteItem = async (id, col) => {
    if (window.confirm("Delete this item?")) {
      await deleteDoc(doc(db,col,id));
      showToast("Deleted!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
        <SpaceBackground />
        <div className="relative z-10 bg-zinc-900/80 p-10 rounded-[30px] border border-white/10 w-full max-w-md text-center backdrop-blur-lg">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase text-white tracking-tighter">Dumo Admin</h2>
          <input 
            type="password" placeholder="Password" 
            className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center text-white" 
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Wrong Password", "error"))}
          />
          <button onClick={() => password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Wrong Password", "error")} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase italic">Unlock</button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-black italic text-amber-500 mb-12 uppercase">Dumo</h2>
      <nav className="flex-1 space-y-2">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'inventory', icon: Package, label: 'Inventory' },
          { id: 'setup', icon: Layers, label: 'Setup' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase italic text-[10px] ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:bg-white/5'}`}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>
      <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-black flex items-center gap-2 p-4 mt-auto uppercase italic text-[10px]"><LogOut size={18} /> Logout</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative">
      <SpaceBackground />
      {toast.show && <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{toast.message}</div>}

      {/* Mobile Nav */}
      <div className="md:hidden flex justify-between items-center p-6 bg-zinc-950 border-b border-white/10 z-50">
        <h2 className="text-2xl font-black italic text-amber-500">Dumo</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black z-[60] p-10 md:hidden"><SidebarContent /></div>}

      <div className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col sticky top-0 h-screen z-20 bg-zinc-950/50 backdrop-blur-lg">
        <SidebarContent />
      </div>

      <div className="flex-1 p-6 md:p-12 relative z-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-reveal-up text-center">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase">Dashboard</h1>
            <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 inline-block min-w-[300px]">
              <p className="text-zinc-500 text-xs font-black uppercase mb-2">Total Items</p>
              <p className="text-6xl font-black text-amber-500">{products.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase">Inventory</h1>
            <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-[40px] space-y-8 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="border-2 border-dashed border-white/10 rounded-3xl p-10 text-center relative">
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {image ? <img src={image} className="h-40 mx-auto object-contain" alt=""/> : <div className="text-zinc-500 uppercase font-black">Upload Image</div>}
                    </div>
                    <div className="space-y-4">
                        <input placeholder="Product Name" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl" />
                        <div className="grid grid-cols-2 gap-4">
                            <select value={category} onChange={e=>setCategory(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl text-[10px] uppercase font-black">
                                <option value="">Category</option>
                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <select value={selectedBrand} onChange={e=>setSelectedBrand(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl text-[10px] uppercase font-black">
                                <option value="">Brand</option>
                                {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Price" type="number" value={sellingPrice} onChange={e=>setSellingPrice(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl" />
                            <input placeholder="Stock" type="number" value={stock} onChange={e=>setStock(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl" />
                        </div>
                        <button onClick={handleAddProduct} disabled={formLoading} className="w-full bg-white text-black p-4 rounded-2xl font-black uppercase italic hover:bg-amber-500 transition-all">
                            {formLoading ? "Wait..." : "Publish Product"}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-zinc-950/50 rounded-[40px] border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900 text-[10px] uppercase font-black text-zinc-500">
                        <tr><th className="p-6">Product</th><th className="p-6">Price</th><th className="p-6 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-white/5">
                                <td className="p-6 flex items-center gap-4">
                                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt=""/>
                                    <p className="font-black uppercase italic">{p.name}</p>
                                </td>
                                <td className="p-6 font-black">LKR {p.sellingPrice}</td>
                                <td className="p-6 text-right"><button onClick={()=>deleteItem(p.id, "products")} className="text-red-500"><Trash2 size={20}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-16 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic uppercase">Setup</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-white/10 space-y-6">
                <h2 className="font-black italic text-amber-500">CATEGORIES</h2>
                <div className="flex gap-4">
                  <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} className="flex-1 bg-black border border-white/10 p-4 rounded-2xl" placeholder="Name"/>
                  <button onClick={async()=>{if(newCatName){await addDoc(collection(db,"categories"),{name:newCatName});setNewCatName("");showToast("Added")}}} className="bg-white text-black px-6 rounded-2xl font-black">Add</button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {categories.map(c=>(<div key={c.id} className="bg-black/40 p-3 rounded-xl flex justify-between text-[10px] font-black uppercase border border-white/5">{c.name} <button onClick={()=>deleteItem(c.id,"categories")}><X size={14}/></button></div>))}
                </div>
              </div>
              <div className="bg-zinc-900/30 p-8 rounded-[40px] border border-white/10 space-y-6">
                <h2 className="font-black italic text-blue-500">BRANDS</h2>
                <div className="flex gap-4">
                  <input value={newBrandName} onChange={e=>setNewBrandName(e.target.value)} className="flex-1 bg-black border border-white/10 p-4 rounded-2xl" placeholder="Name"/>
                  <button onClick={async()=>{if(newBrandName){await addDoc(collection(db,"brands"),{name:newBrandName});setNewBrandName("");showToast("Added")}}} className="bg-white text-black px-6 rounded-2xl font-black">Add</button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {brands.map(b=>(<div key={b.id} className="bg-black/40 p-3 rounded-xl flex justify-between text-[10px] font-black uppercase border border-white/5">{b.name} <button onClick={()=>deleteItem(b.id,"brands")}><X size={14}/></button></div>))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-reveal-up { animation: reveal-up 0.5s ease-out both; }
      `}</style>
    </div>
  );
};

export default Admin;