import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Layers, Upload, Menu, X, Image as ImageIcon, Timer, Tag, Cpu
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
  const [slides, setSlides] = useState([]);

  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Product Form States
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  // --- අලුතින් එක් කළ Specs State එක ---
  const [specs, setSpecs] = useState({
    ddr: "",        // RAM & Motherboard සඳහා
    socket: "",     // CPU & Motherboard සඳහා
    size: "",       // Case & Cooler සඳහා
    wattage: "",    // PSU සඳහා
    capacity: ""    // Storage & RAM සඳහා
  });
  
  // Offer / Slider States
  const [offerTitle, setOfferTitle] = useState("");
  const [offerImage, setOfferImage] = useState("");
  const [offerExpiry, setOfferExpiry] = useState("");
  const [offerLink, setOfferLink] = useState("shop");

  const ADMIN_PASSWORD = "1234"; 
  const IMGBB_API_KEY = "cbabafe642eea7200b76cb9136e84615";

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageUpload = async (e, target) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(20);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        if (target === 'product') setImage(data.data.url);
        if (target === 'offer') setOfferImage(data.data.url);
        setUploadProgress(100);
        showToast("Image Uploaded!");
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) { showToast("Upload failed", "error"); setUploadProgress(0); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      onSnapshot(query(collection(db, "categories"), orderBy("name", "asc")), (snap) => {
        setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      onSnapshot(query(collection(db, "brands"), orderBy("name", "asc")), (snap) => {
        setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      onSnapshot(query(collection(db, "hero_slides"), orderBy("createdAt", "desc")), (snap) => {
        setSlides(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [isAuthenticated]);

  const handleAddProduct = async () => {
    if (!name || !buyingPrice || !sellingPrice || !stock || !category || !image) {
      showToast("Fill all fields!", "error"); return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name, 
        brand: selectedBrand, 
        buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice), 
        stock: Number(stock),
        category: category.toLowerCase().trim(), 
        image,
        specs: specs, // Specs ටික මෙතනින් සේව් වෙනවා
        isOffer: false,
        createdAt: serverTimestamp()
      });
      // Reset Form
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); setImage("");
      setSpecs({ ddr: "", socket: "", size: "", wattage: "", capacity: "" });
      showToast("Product published!");
    } catch (e) { showToast("Error", "error"); }
    setFormLoading(false);
  };

  const handlePublishOffer = async () => {
    if (!offerTitle || !offerImage || !offerExpiry) {
      showToast("Fill all fields!", "error"); return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "hero_slides"), {
        title: offerTitle,
        image: offerImage,
        expiryDate: new Date(offerExpiry).toISOString(),
        link: offerLink,
        order: 1,
        isOffer: true,
        createdAt: serverTimestamp()
      });
      setOfferTitle(""); setOfferImage(""); setOfferExpiry("");
      showToast("Offer Live on Slider!");
    } catch (e) { showToast("Error", "error"); }
    setFormLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    await addDoc(collection(db, "categories"), { name: newCatName });
    setNewCatName(""); showToast("Category Added");
  };

  const handleAddBrand = async () => {
    if (!newBrandName) return;
    await addDoc(collection(db, "brands"), { name: newBrandName });
    setNewBrandName(""); showToast("Brand Added");
  };

  const deleteItem = async (id, collectionName) => {
    if (window.confirm(`Delete this item?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        showToast("Deleted");
      } catch (e) { showToast("Failed", "error"); }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center p-6 text-white italic text-center overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-10 rounded-[30px] w-full max-w-md">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">DUMO ADMIN</h2>
          <input type="password" placeholder="Enter Password" title="password" className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold outline-none focus:border-amber-500 text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
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
          { id: 'offers', icon: Tag, label: 'Offers & Slider' },
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
      <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-black flex items-center gap-2 p-4 hover:bg-red-500/10 rounded-xl uppercase italic text-[11px] tracking-widest mt-auto">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative">
      <SpaceBackground />
      {toast.show && <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border animate-bounce ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{toast.message}</div>}

      <div className="md:hidden flex justify-between items-center p-6 bg-zinc-950 border-b border-white/10 z-50">
        <h2 className="text-2xl font-black italic text-amber-500 uppercase">Dumo</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-40 p-10 md:hidden">
            <button className="absolute top-6 right-6" onClick={() => setIsMobileMenuOpen(false)}><X size={32}/></button>
            <SidebarContent />
        </div>
      )}

      <div className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col bg-zinc-950/50 backdrop-blur-lg sticky top-0 h-screen z-20">
        <SidebarContent />
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black block mb-4">Total Inventory</span>
                <span className="text-6xl font-black text-amber-500">{products.length}</span>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black block mb-4">Live Offers</span>
                <span className="text-6xl font-black text-white">{slides.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-[35px] border border-white/5">
                <div className="relative group border-2 border-dashed border-white/10 rounded-[30px] p-8 text-center hover:border-amber-500/50">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {image ? <img src={image} className="w-full h-40 object-contain rounded-xl" alt="Preview" /> : <div className="flex flex-col items-center"><Upload className="text-zinc-500 mb-2" size={30} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Image</p></div>}
                  {uploadProgress > 0 && <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all" style={{width: `${uploadProgress}%`}}></div>}
                </div>
                <div className="space-y-4">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white" />
                    <div className="grid grid-cols-2 gap-4">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white text-xs">
                            <option value="">Category</option>
                            {categories.map(c => <option key={c.id} value={c.name.toLowerCase()}>{c.name}</option>)}
                        </select>
                        <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white text-xs">
                            <option value="">Brand</option>
                            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
              </div>

              {/* Dynamic Specs Section */}
              {category && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-[30px]">
                  {(category === "ram" || category === "motherboard") && (
                    <select value={specs.ddr} onChange={(e) => setSpecs({...specs, ddr: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-xs font-black uppercase text-amber-500 outline-none focus:border-amber-500">
                      <option value="">Select DDR</option>
                      <option value="DDR3">DDR3</option>
                      <option value="DDR4">DDR4</option>
                      <option value="DDR5">DDR5</option>
                    </select>
                  )}
                  {(category === "processor" || category === "motherboard") && (
                    <input placeholder="Socket (e.g. AM4, LGA1700)" value={specs.socket} onChange={(e) => setSpecs({...specs, socket: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-xs font-black uppercase text-white outline-none focus:border-amber-500" />
                  )}
                  {(category === "storage" || category === "ram") && (
                    <input placeholder="Capacity (e.g. 16GB, 1TB)" value={specs.capacity} onChange={(e) => setSpecs({...specs, capacity: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-xs font-black uppercase text-white outline-none focus:border-amber-500" />
                  )}
                  {(category === "case" || category === "cooler") && (
                    <input placeholder="Size/Type (e.g. ATX, 240mm)" value={specs.size} onChange={(e) => setSpecs({...specs, size: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-xs font-black uppercase text-white outline-none focus:border-amber-500" />
                  )}
                  {category === "psu" && (
                    <input placeholder="Wattage (e.g. 750W)" value={specs.wattage} onChange={(e) => setSpecs({...specs, wattage: e.target.value})} className="bg-black border border-white/10 p-4 rounded-xl text-xs font-black uppercase text-white outline-none focus:border-amber-500" />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block">Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block">Cost</label><input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-2 block">Selling</label><input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <button disabled={formLoading} onClick={handleAddProduct} className="bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 uppercase italic text-sm flex items-center justify-center gap-3">
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish"}
                </button>
              </div>
            </div>

            <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-[40px] overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase border-b border-white/5">
                  <tr><th className="p-8">Details</th><th className="p-8">Pricing</th><th className="p-8">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 italic">
                  {products.filter(p => !p.isOffer).map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01]">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <img src={p.image} className="w-16 h-16 rounded-2xl object-cover" />
                          <div className="font-black uppercase text-lg">
                            {p.name}
                            <span className="block text-[10px] text-zinc-600 not-italic uppercase mt-1">
                              {p.category} • {p.brand} • {p.stock} Units
                              {p.specs?.ddr && ` • ${p.specs.ddr}`}
                              {p.specs?.socket && ` • ${p.specs.socket}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 font-black text-xl">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-8"><button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Offers and Setup tabs remain the same as your original code */}
        {activeTab === 'offers' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Special Offers</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-[35px] border border-white/5">
                <div className="relative group border-2 border-dashed border-white/10 rounded-[30px] p-12 text-center hover:border-amber-500/50">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'offer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {offerImage ? <img src={offerImage} className="w-full h-40 object-contain rounded-xl" /> : <div className="flex flex-col items-center"><ImageIcon className="text-zinc-500 mb-2" size={40} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Banner Image</p></div>}
                </div>
                <div className="space-y-4">
                  <input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="Offer Title (e.g. MEGA SALE)" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-sm text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-amber-500 uppercase ml-2 flex items-center gap-1 italic"><Timer size={10}/> Expiry</label>
                        <input type="datetime-local" value={offerExpiry} onChange={(e) => setOfferExpiry(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl font-black text-white text-xs" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase ml-2 italic">Click Action</label>
                        <select value={offerLink} onChange={(e) => setOfferLink(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl font-black text-white text-xs italic uppercase">
                            <option value="shop">Go to Shop</option>
                            <option value="builder">Go to PC Builder</option>
                            <option value="whatsapp">Contact WhatsApp</option>
                        </select>
                    </div>
                  </div>
                  <button onClick={handlePublishOffer} className="w-full bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm">Publish to Slider</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map(offer => (
                  <div key={offer.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] relative group overflow-hidden">
                    <img src={offer.image} className="w-full h-32 object-contain mb-4" />
                    <p className="font-black italic uppercase text-amber-500 text-center">{offer.title}</p>
                    <div className="flex items-center justify-center gap-2 text-zinc-500 text-[10px] font-bold uppercase mt-2">
                        <Timer size={12}/> {new Date(offer.expiryDate).toLocaleDateString()}
                    </div>
                    <button onClick={() => deleteItem(offer.id, "hero_slides")} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-16 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Setup</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase text-amber-500">Categories</h2>
                  <div className="flex gap-4">
                    <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Name" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                    <button onClick={handleAddCategory} className="bg-white text-black px-6 rounded-2xl font-black">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 uppercase italic font-black text-[10px]">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <span>{cat.name}</span>
                      <button onClick={() => deleteItem(cat.id, "categories")} className="text-zinc-800 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                  <h2 className="text-xl font-black italic uppercase text-blue-500">Brands</h2>
                  <div className="flex gap-4">
                    <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="Name" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                    <button onClick={handleAddBrand} className="bg-white text-black px-6 rounded-2xl font-black">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 uppercase italic font-black text-[10px]">
                  {brands.map(brand => (
                    <div key={brand.id} className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <span>{brand.name}</span>
                      <button onClick={() => deleteItem(brand.id, "brands")} className="text-zinc-800 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-reveal-up { animation: reveal-up 0.5s ease-out both; }
      `}</style>
    </div>
  );
};

export default Admin;