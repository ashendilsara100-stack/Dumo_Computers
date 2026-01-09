import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Layers, Upload, Menu, X, Image as ImageIcon, Timer, Tag
} from 'lucide-react';
import { db } from "../firebase/config";
import { 
  collection, addDoc, deleteDoc, doc, updateDoc,
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

  // Product Form States (Normal)
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [socket, setSocket] = useState(""); 
  const [ramType, setRamType] = useState(""); 

  // Offer Form States (New)
  const [offerTitle, setOfferTitle] = useState("");
  const [offerImage, setOfferImage] = useState("");
  const [offerExpiry, setOfferExpiry] = useState("");

  // Hero Slide Form States
  const [slideTitle, setSlideTitle] = useState("");
  const [slideImage, setSlideImage] = useState("");
  const [slideLink, setSlideLink] = useState("shop");
  const [slideOrder, setSlideOrder] = useState("1");

  const ADMIN_PASSWORD = "1234"; 
  const IMGBB_API_KEY = "cbabafe642eea7200b76cb9136e84615";

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleImageUpload = async (e, target) => {
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
        if (target === 'product') setImage(data.data.url);
        if (target === 'slide') setSlideImage(data.data.url);
        if (target === 'offer') setOfferImage(data.data.url);
        setUploadProgress(100);
        showToast("Image Uploaded!");
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error) { showToast("Upload failed", "error"); setUploadProgress(0); }
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
      const unsubSlides = onSnapshot(query(collection(db, "hero_slides"), orderBy("order", "asc")), (snap) => {
        setSlides(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => { unsubProducts(); unsubCats(); unsubBrands(); unsubSlides(); };
    }
  }, [isAuthenticated]);

  const handleAddProduct = async () => {
    if (!name || !buyingPrice || !sellingPrice || !stock || !category || !image) {
      showToast("Fill all fields!", "error"); return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name, brand: selectedBrand, buyingPrice: Number(buyingPrice),
        sellingPrice: Number(sellingPrice), stock: Number(stock),
        category: category.toLowerCase().trim(), image, socket, ramType,
        createdAt: serverTimestamp()
      });
      setName(""); setBuyingPrice(""); setSellingPrice(""); setStock(""); setImage("");
      showToast("Product published!");
    } catch (e) { showToast("Error", "error"); }
    setFormLoading(false);
  };

  const handleAddOffer = async () => {
    if (!offerTitle || !offerImage || !offerExpiry) {
      showToast("Fill all fields!", "error"); return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: offerTitle,
        image: offerImage,
        expiryDate: new Date(offerExpiry).toISOString(),
        isOffer: true,
        category: "offers",
        createdAt: serverTimestamp()
      });
      setOfferTitle(""); setOfferImage(""); setOfferExpiry("");
      showToast("Offer Published!");
    } catch (e) { showToast("Error", "error"); }
    setFormLoading(false);
  };

  const deleteItem = async (id, collectionName) => {
    if (window.confirm(`Delete this?`)) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        showToast("Deleted");
      } catch (e) { showToast("Failed", "error"); }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center p-6 text-white italic font-sans text-center overflow-hidden">
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
          { id: 'offers', icon: Tag, label: 'Special Offers' },
          { id: 'hero', icon: ImageIcon, label: 'Hero Banners' },
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
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans relative">
      <SpaceBackground />
      {toast.show && <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border animate-bounce ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{toast.message}</div>}

      <div className="md:hidden flex justify-between items-center p-6 bg-zinc-950 border-b border-white/10 z-50">
        <h2 className="text-2xl font-black italic text-amber-500 uppercase">Dumo</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button>
      </div>

      <div className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col bg-zinc-950/50 backdrop-blur-lg sticky top-0 h-screen z-20">
        <SidebarContent />
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black tracking-widest block mb-4">Normal Products</span>
                <span className="text-6xl font-black text-amber-500 tracking-tighter">{products.filter(p => !p.isOffer).length}</span>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black tracking-widest block mb-4">Active Offers</span>
                <span className="text-6xl font-black text-white tracking-tighter">{products.filter(p => p.isOffer).length}</span>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black tracking-widest block mb-4">Total Items</span>
                <span className="text-6xl font-black text-green-500 tracking-tighter">{products.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Inventory</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-[35px] border border-white/5">
                <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-[30px] p-8 text-center hover:border-amber-500/50">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {image ? <img src={image} className="w-full h-40 object-contain rounded-xl" alt="Preview" /> : <div className="flex flex-col items-center"><Upload className="text-zinc-500 mb-2" size={30} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Product Image</p></div>}
                </div>
                <div className="space-y-2"><p className="text-[12px] font-black italic text-amber-500 uppercase tracking-widest">Status: {image ? "Ready ✓" : "No Image"}</p></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block tracking-widest">Product Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-amber-500 font-black uppercase italic text-sm text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none font-black uppercase italic text-sm text-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block tracking-widest">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none font-black uppercase italic text-sm text-white">
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
                <div><label className="text-[10px] font-black text-zinc-500 uppercase ml-2 mb-2 block tracking-widest">Stock</label><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-red-500 uppercase ml-2 mb-2 block tracking-widest">Cost</label><input type="number" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <div><label className="text-[10px] font-black text-green-500 uppercase ml-2 mb-2 block tracking-widest">Selling</label><input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" /></div>
                <button disabled={formLoading} onClick={handleAddProduct} className="bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 uppercase italic text-sm flex items-center justify-center gap-3">
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Publish Item"}
                </button>
              </div>
            </div>

            <div className="bg-zinc-950/50 backdrop-blur-md border border-white/10 rounded-[40px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase tracking-widest border-b border-white/5">
                  <tr><th className="p-8">Details</th><th className="p-8">Pricing</th><th className="p-8">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 italic">
                  {products.filter(p => !p.isOffer).map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.01] group">
                      <td className="p-8"><div className="flex items-center gap-6"><img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-white/5" /><div className="font-black uppercase text-lg">{p.name}<span className="block text-[10px] text-zinc-600 not-italic mt-1 uppercase tracking-tighter">{p.category} • {p.stock} Units</span></div></div></td>
                      <td className="p-8 font-black text-xl">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-8"><button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={22} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Special Offers</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-[35px] border border-white/5">
                <div className="relative group border-2 border-dashed border-white/10 rounded-[30px] p-12 text-center hover:border-amber-500/50">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'offer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {offerImage ? <img src={offerImage} className="w-full h-40 object-contain rounded-xl" /> : <div className="flex flex-col items-center"><ImageIcon className="text-zinc-500 mb-2" size={40} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Offer Image</p></div>}
                </div>
                <div className="space-y-4">
                  <input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="Offer Name (e.g. RTX 4090 MEGA SALE)" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-sm text-white" />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-amber-500 uppercase ml-2 flex items-center gap-1 italic"><Timer size={12}/> Set Expiry Time</label>
                    <input type="datetime-local" value={offerExpiry} onChange={(e) => setOfferExpiry(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white outline-none focus:border-amber-500" />
                  </div>
                  <button onClick={handleAddOffer} className="w-full bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm">Publish Special Offer</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.filter(p => p.isOffer).map(offer => (
                  <div key={offer.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] flex items-center gap-6 relative group">
                    <img src={offer.image} className="w-24 h-24 rounded-2xl object-cover" />
                    <div>
                        <p className="font-black italic uppercase text-amber-500">{offer.name}</p>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase mt-2">
                            <Timer size={12}/> {new Date(offer.expiryDate).toLocaleString()}
                        </div>
                    </div>
                    <button onClick={() => deleteItem(offer.id, "products")} className="absolute top-6 right-6 text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Hero Banners</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-black/40 p-8 rounded-[35px] border border-white/5">
                <div className="relative group border-2 border-dashed border-white/10 rounded-[30px] p-12 text-center hover:border-amber-500/50">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'slide')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {slideImage ? <img src={slideImage} className="w-full h-40 object-contain rounded-xl" alt="Preview" /> : <div className="flex flex-col items-center"><ImageIcon className="text-zinc-500 mb-2" size={40} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Banner Image</p></div>}
                </div>
                <div className="space-y-4">
                  <input value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} placeholder="Banner Title" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-sm text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={slideLink} onChange={(e) => setSlideLink(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-sm text-white"><option value="shop">Shop Page</option><option value="builder">PC Builder</option></select>
                    <input type="number" value={slideOrder} onChange={(e) => setSlideOrder(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                  </div>
                  <button onClick={handleAddSlide} className="w-full bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm">Add New Banner</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slides.map(slide => (
                  <div key={slide.id} className="bg-black/40 border border-white/5 p-6 rounded-[35px] relative overflow-hidden text-center">
                    <img src={slide.image} className="w-full h-32 object-contain mb-4" />
                    <p className="font-black italic uppercase text-amber-500 text-xs">{slide.title || "No Title"}</p>
                    <button onClick={() => deleteItem(slide.id, "hero_slides")} className="absolute top-4 right-4 text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-16 animate-in fade-in duration-700">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 uppercase italic font-black text-sm">
                  {categories.map(cat => (
                    <div key={cat.id} className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                      <span>{cat.name}</span>
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
                    <button onClick={handleAddBrand} className="bg-white text-black px-6 rounded-2xl font-black">Add</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 uppercase italic font-black text-sm">
                  {brands.map(brand => (
                    <div key={brand.id} className="bg-zinc-900/40 p-5 rounded-3xl border border-white/5 flex justify-between items-center group">
                      <span>{brand.name}</span>
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