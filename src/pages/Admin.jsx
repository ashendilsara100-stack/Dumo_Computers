import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Layers, Upload, Menu, X
} from 'lucide-react';
import { db } from "../firebase/config";
import { 
  collection, addDoc, deleteDoc, doc, 
  serverTimestamp, query, orderBy, onSnapshot
} from "firebase/firestore";
import SpaceBackground from "../components/SpaceBackground"; // ඔබ පැවසූ file එක

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
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [socket, setSocket] = useState(""); 
  const [ramType, setRamType] = useState(""); 

  const ADMIN_PASSWORD = "1234"; 
  const IMGBB_API_KEY = "cbabafe642eea7200b76cb9136e84615";

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(10);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      setUploadProgress(50); 
      const data = await response.json();
      if (data.success) {
        setImage(data.data.url);
        setUploadProgress(100);
        showToast("Image Uploaded Successfully!");
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        showToast("Upload failed!", "error");
        setUploadProgress(0);
      }
    } catch (error) {
      showToast("Network error during upload", "error");
      setUploadProgress(0);
    }
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
    if (!name || !buyingPrice || !sellingPrice || !stock || !category || !selectedBrand || !image) {
      showToast("Fill all fields!", "error");
      return;
    }
    setFormLoading(true);
    try {
      const formattedCategory = category.toLowerCase().trim();
      await addDoc(collection(db, "products"), {
        name, brand: selectedBrand, buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice), stock: Number(stock),
        category: formattedCategory, image: image, 
        socket: (formattedCategory.includes('cpu') || formattedCategory.includes('motherboard') || formattedCategory.includes('cool')) ? socket.trim() : null,
        ramType: (formattedCategory.includes('ram') || formattedCategory.includes('motherboard')) ? ramType.trim() : null,
        createdAt: serverTimestamp()
      });
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); 
      setImage(""); setSelectedBrand(""); setSocket(""); setRamType(""); setCategory("");
      showToast("Product published successfully!");
    } catch (error) { showToast("Error saving product", "error"); }
    setFormLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCatName.trim() });
      setNewCatName("");
      showToast("Category Added");
    } catch (e) { showToast("Error", "error"); }
  };

  const handleAddBrand = async () => {
    if (!newBrandName) return;
    try {
      await addDoc(collection(db, "brands"), { name: newBrandName.trim() });
      setNewBrandName("");
      showToast("Brand Added");
    } catch (e) { showToast("Error", "error"); }
  };

  const deleteItem = async (id, collectionName) => {
    if (window.confirm(`Delete this ${collectionName}?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        showToast("Deleted successfully");
      } catch (e) { showToast("Delete failed", "error"); }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center p-6 text-white italic font-sans text-center overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-10 rounded-[30px] w-full max-w-md">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">DUMO ADMIN</h2>
          <input type="password" placeholder="Enter Password" title="password" className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold outline-none focus:border-amber-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Invalid Password", "error")} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase italic hover:bg-amber-500 transition-all">Unlock</button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <h2 className="text-3xl font-black italic text-amber-500 mb-12 uppercase tracking-tighter">Dumo</h2>
      <nav className="flex-1 space-y-2">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'inventory', icon: Package, label: 'Inventory' },
          { id: 'setup', icon: Layers, label: 'Store Setup' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase italic text-[11px] tracking-widest ${activeTab === tab.id ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>
      <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-black flex items-center gap-2 p-4 hover:bg-red-500/10 rounded-xl uppercase italic text-[11px] tracking-widest">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-amber-500 relative">
      <SpaceBackground />
      
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border animate-bounce ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
          {toast.message}
        </div>
      )}

      {/* MOBILE HEADER */}
      <div className="md:hidden flex justify-between items-center p-6 bg-zinc-950 border-b border-white/10 z-50">
        <h2 className="text-2xl font-black italic text-amber-500 uppercase tracking-tighter">Dumo</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR - DESKTOP */}
      <div className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col bg-zinc-950/50 backdrop-blur-lg sticky top-0 h-screen z-20">
        <SidebarContent />
      </div>

      {/* SIDEBAR - MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-[60] p-8 md:hidden">
          <div className="flex justify-end mb-8">
            <button onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>
          </div>
          <SidebarContent />
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center uppercase italic">
              {[
                { label: 'Total Products', val: products.length, color: 'text-amber-500' },
                { label: 'Categories', val: categories.length, color: 'text-white' },
                { label: 'In Stock Items', val: products.reduce((acc, p) => acc + Number(p.stock), 0), color: 'text-green-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/50 backdrop-blur-sm p-8 md:p-10 rounded-[40px] border border-white/10">
                  <span className="text-zinc-500 font-black text-xs tracking-widest block mb-4">{stat.label}</span>
                  <span className={`text-5xl md:text-6xl font-black tracking-tighter ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[30px] md:rounded-[50px] space-y-8 shadow-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-6 md:p-8 rounded-[35px] border border-white/5">
                <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-[30px] p-8 text-center hover:border-amber-500/50 transition-all">
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {image ? <img src={image} className="w-full h-40 object-contain rounded-xl" alt="Preview" /> : (
                    <div className="flex flex-col items-center">
                      <Upload className="text-zinc-500 mb-2" size={30} />
                      <p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Product Image</p>
                    </div>
                  )}
                  {uploadProgress > 0 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-[12px] font-black italic text-amber-500 uppercase tracking-widest">Image Status</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold italic">{image ? "Image ready ✓" : "Upload to cloud storage"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none font-black uppercase italic text-sm text-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none font-black uppercase italic text-sm text-white">
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/40 p-6 md:p-8 rounded-[35px] border border-white/5">
                <div className={!(category.toLowerCase().includes('cpu') || category.toLowerCase().includes('motherboard') || category.toLowerCase().includes('cool')) ? 'opacity-20 pointer-events-none' : ''}>
                  <label className="text-[10px] font-black text-amber-500 uppercase ml-2 mb-2 block italic">Socket</label>
                  <input placeholder="LGA1700, AM5" value={socket} onChange={(e) => setSocket(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm text-white" />
                </div>
                <div className={!(category.toLowerCase().includes('ram') || category.toLowerCase().includes('motherboard')) ? 'opacity-20 pointer-events-none' : ''}>
                  <label className="text-[10px] font-black text-amber-500 uppercase ml-2 mb-2 block italic">RAM Generation</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['DDR2', 'DDR3', 'DDR4', 'DDR5'].map((type) => (
                      <button key={type} onClick={() => setRamType(type)} className={`p-3 rounded-xl font-black text-[10px] italic border ${ramType === type ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'}`}>{type}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block">Cost</label><input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-red-500/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-2 block">Selling</label><input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-green-500/10 p-4 rounded-2xl font-black text-white" /></div>
                <button disabled={formLoading || uploadProgress > 0} onClick={handleAddProduct} className="bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm flex items-center justify-center gap-3">
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish"}
                </button>
              </div>
            </div>

            {/* PRODUCT TABLE - RESPONSIVE SCROLL */}
            <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-[30px] md:rounded-[40px] overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                  <tr><th className="p-8">Details</th><th className="p-8">Compatibility</th><th className="p-8">Pricing</th><th className="p-8">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8"><div className="flex items-center gap-6"><img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-white/5" /><div className="font-black uppercase italic text-lg">{p.name}<span className="block text-[10px] text-zinc-600 not-italic mt-1">{p.category} • {p.stock} Units</span></div></div></td>
                      <td className="p-8"><div className="flex flex-col gap-1">{p.socket && <span className="text-[9px] font-black text-amber-500 uppercase italic bg-amber-500/5 px-2 py-1 rounded w-fit">Socket: {p.socket}</span>}{p.ramType && <span className="text-[9px] font-black text-blue-500 uppercase italic bg-blue-500/5 px-2 py-1 rounded w-fit">Type: {p.ramType}</span>}</div></td>
                      <td className="p-8 font-black text-xl italic">LKR {p.sellingPrice?.toLocaleString()}<span className="block text-[9px] text-zinc-700 mt-2">Cost: {p.buyingPrice?.toLocaleString()}</span></td>
                      <td className="p-8"><button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all hover:scale-125"><Trash2 size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Setup</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
              <div className="space-y-8">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase text-amber-500">Categories</h2>
                  <div className="flex gap-4">
                    <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Name" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                    <button onClick={handleAddCategory} className="bg-white text-black px-6 rounded-2xl font-black hover:bg-amber-500">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                      <span className="font-black italic uppercase text-sm">{cat.name}</span>
                      <button onClick={() => deleteItem(cat.id, "categories")} className="text-zinc-800 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase text-blue-500">Brands</h2>
                  <div className="flex gap-4">
                    <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Name" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                    <button onClick={handleAddBrand} className="bg-white text-black px-6 rounded-2xl font-black hover:bg-blue-500">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {brands.map(brand => (
                    <div key={brand.id} className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                      <span className="font-black italic uppercase text-sm">{brand.name}</span>
                      <button onClick={() => deleteItem(brand.id, "brands")} className="text-zinc-800 hover:text-red-500"><Trash2 size={16} /></button>
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