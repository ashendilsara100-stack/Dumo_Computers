import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  Layers, Upload, Menu, X, Image as ImageIcon, Timer, Tag, Edit3 
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

  // Edit State
  const [editingId, setEditingId] = useState(null);

  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Product Form States
  const [name, setName] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(""); 
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(""); 
  const [image, setImage] = useState("");
  
  // Offer Form States
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
        showToast("Image Uploaded!");
      }
    } catch (error) { showToast("Upload failed", "error"); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub1 = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsub2 = onSnapshot(query(collection(db, "categories"), orderBy("name", "asc")), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsub3 = onSnapshot(query(collection(db, "brands"), orderBy("name", "asc")), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsub4 = onSnapshot(query(collection(db, "hero_slides"), orderBy("createdAt", "desc")), (snap) => {
      setSlides(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [isAuthenticated]);

  const handleSaveProduct = async () => {
    if (!name || !sellingPrice || !image) return showToast("Fill required fields!", "error");
    setFormLoading(true);
    const productData = {
      name, brand: selectedBrand, sellingPrice: Number(sellingPrice),
      stock: Number(stock), category, image, updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        showToast("Product Updated!");
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
        showToast("Product Published!");
      }
      resetProductForm();
    } catch (e) { showToast("Error saving", "error"); }
    setFormLoading(false);
  };

  const resetProductForm = () => {
    setEditingId(null); setName(""); setSellingPrice(""); 
    setStock(""); setImage(""); setCategory(""); setSelectedBrand("");
  };

  const startEditProduct = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setSelectedBrand(p.brand || "");
    setSellingPrice(p.sellingPrice);
    setStock(p.stock);
    setCategory(p.category);
    setImage(p.image);
    setActiveTab('inventory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveOffer = async () => {
    if (!offerTitle || !offerImage) return showToast("Fill all fields!", "error");
    setFormLoading(true);
    const offerData = {
      title: offerTitle, image: offerImage,
      expiryDate: offerExpiry ? new Date(offerExpiry).toISOString() : null,
      link: offerLink, updatedAt: serverTimestamp()
    };
    try {
      if (editingId) {
        await updateDoc(doc(db, "hero_slides", editingId), offerData);
        showToast("Offer Updated!");
      } else {
        await addDoc(collection(db, "hero_slides"), { ...offerData, createdAt: serverTimestamp() });
        showToast("Offer Live!");
      }
      resetOfferForm();
    } catch (e) { showToast("Error", "error"); }
    setFormLoading(false);
  };

  const resetOfferForm = () => {
    setEditingId(null); setOfferTitle(""); setOfferImage(""); setOfferExpiry(""); setOfferLink("shop");
  };

  const startEditOffer = (offer) => {
    setEditingId(offer.id);
    setOfferTitle(offer.title);
    setOfferImage(offer.image);
    setOfferLink(offer.link || "shop");
    setActiveTab('offers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="relative min-h-screen bg-black flex items-center justify-center p-6 text-white text-center overflow-hidden">
        <SpaceBackground />
        <div className="relative z-10 bg-zinc-900/80 backdrop-blur-md border border-white/10 p-10 rounded-[30px] w-full max-w-md">
          <Lock size={40} className="mx-auto mb-6 text-amber-500" />
          <h2 className="text-3xl font-black mb-8 italic uppercase tracking-tighter">DUMO ADMIN</h2>
          <input type="password" placeholder="Enter Password" title="password" className="w-full bg-black border border-white/10 p-4 rounded-xl mb-4 text-center font-bold outline-none focus:border-amber-500 text-white" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (password === ADMIN_PASSWORD ? setIsAuthenticated(true) : showToast("Invalid Password", "error"))} />
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
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); resetProductForm(); resetOfferForm(); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all uppercase italic text-[11px] tracking-widest ${activeTab === tab.id ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:bg-white/5'}`}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>
      <button onClick={() => setIsAuthenticated(false)} className="text-red-500 font-black flex items-center gap-2 p-4 hover:bg-red-500/10 rounded-xl uppercase italic text-[11px] tracking-widest mt-auto"><LogOut size={18} /> Logout</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row relative">
      <SpaceBackground />
      {toast.show && <div className={`fixed top-5 right-5 z-[100] px-6 py-3 rounded-xl font-bold border animate-bounce ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{toast.message}</div>}

      {/* Mobile Nav */}
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

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 border-r border-white/10 p-8 flex-col bg-zinc-950/50 backdrop-blur-lg sticky top-0 h-screen z-20">
        <SidebarContent />
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto relative z-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black block mb-4">Total Inventory</span>
                <span className="text-6xl font-black text-amber-500">{products.length}</span>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-white/10 text-center">
                <span className="text-zinc-500 text-xs uppercase font-black block mb-4">Active Offers</span>
                <span className="text-6xl font-black text-white">{slides.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">{editingId ? "Edit Item" : "Inventory"}</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative group border-2 border-dashed border-white/10 rounded-[30px] p-10 text-center hover:border-amber-500/50 transition-all">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'product')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {image ? <img src={image} className="h-40 mx-auto object-contain rounded-xl" alt="Preview" /> : <div className="flex flex-col items-center"><Upload className="text-zinc-500 mb-2" size={30} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Upload Image</p></div>}
                </div>
                <div className="space-y-4">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white text-xs">
                      <option value="">Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white text-xs">
                      <option value="">Brand</option>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="Price (LKR)" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                    <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                  </div>
                  <button onClick={handleSaveProduct} className="w-full bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 uppercase italic text-sm flex items-center justify-center gap-3">
                    {formLoading ? <RefreshCw className="animate-spin" /> : (editingId ? "Update Product" : "Publish Product")}
                  </button>
                  {editingId && <button onClick={resetProductForm} className="w-full text-zinc-500 text-[10px] font-black uppercase italic">Cancel Edit</button>}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-white/10 rounded-[40px] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 font-black text-[10px] uppercase border-b border-white/5">
                  <tr><th className="p-8">Details</th><th className="p-8">Price</th><th className="p-8 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 italic">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <img src={p.image} className="w-14 h-14 rounded-xl object-cover" alt="" />
                          <div><p className="font-black uppercase text-lg">{p.name}</p><p className="text-[10px] text-zinc-500 not-italic uppercase">{p.category} • {p.brand} • {p.stock} In Stock</p></div>
                        </div>
                      </td>
                      <td className="p-8 font-black text-xl text-amber-500">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-4">
                          <button onClick={() => startEditProduct(p)} className="text-zinc-500 hover:text-white transition-all"><Edit3 size={20}/></button>
                          <button onClick={() => deleteItem(p.id, "products")} className="text-zinc-800 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-10 animate-reveal-up">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">{editingId ? "Edit Offer" : "Special Offers"}</h1>
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-6 md:p-12 rounded-[50px] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative border-2 border-dashed border-white/10 rounded-[30px] p-10 text-center">
                  <input type="file" onChange={(e) => handleImageUpload(e, 'offer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  {offerImage ? <img src={offerImage} className="h-40 mx-auto object-contain" alt="" /> : <div className="flex flex-col items-center"><ImageIcon className="text-zinc-500 mb-2" size={40} /><p className="text-[10px] font-black uppercase italic text-zinc-500">Banner Image</p></div>}
                </div>
                <div className="space-y-4">
                  <input value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} placeholder="Offer Title" className="w-full bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="datetime-local" value={offerExpiry} onChange={(e) => setOfferExpiry(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black text-white text-xs" />
                    <select value={offerLink} onChange={(e) => setOfferLink(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl font-black uppercase italic text-white text-xs">
                      <option value="shop">Go to Shop</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <button onClick={handleSaveOffer} className="w-full bg-white text-black h-[60px] rounded-2xl font-black hover:bg-amber-500 uppercase italic text-sm">
                    {editingId ? "Update Offer" : "Publish to Slider"}
                  </button>
                  {editingId && <button onClick={resetOfferForm} className="w-full text-zinc-500 text-[10px] font-black uppercase italic">Cancel Edit</button>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slides.map(offer => (
                  <div key={offer.id} className="bg-black/40 border border-white/10 p-6 rounded-[35px] text-center space-y-4">
                    <img src={offer.image} className="h-24 mx-auto object-contain rounded-xl" alt="" />
                    <p className="font-black italic uppercase text-xs">{offer.title}</p>
                    <div className="flex justify-center gap-4 pt-2">
                        <button onClick={() => startEditOffer(offer)} className="text-zinc-500 hover:text-white"><Edit3 size={18}/></button>
                        <button onClick={() => deleteItem(offer.id, "hero_slides")} className="text-zinc-800 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
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
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                <h2 className="text-xl font-black italic uppercase text-amber-500">Categories</h2>
                <div className="flex gap-4">
                  <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="New Category" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                  <button onClick={async() => { if(newCatName) { await addDoc(collection(db, "categories"), { name: newCatName }); setNewCatName(""); showToast("Added!"); } }} className="bg-white text-black px-6 rounded-2xl font-black uppercase italic text-xs">Add</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest text-zinc-400">
                      {c.name} <button onClick={() => deleteItem(c.id, "categories")}><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 p-8 rounded-[40px] space-y-6">
                <h2 className="text-xl font-black italic uppercase text-blue-500">Brands</h2>
                <div className="flex gap-4">
                  <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder="New Brand" className="flex-1 bg-black border border-white/10 p-4 rounded-2xl font-black text-white" />
                  <button onClick={async() => { if(newBrandName) { await addDoc(collection(db, "brands"), { name: newBrandName }); setNewBrandName(""); showToast("Added!"); } }} className="bg-white text-black px-6 rounded-2xl font-black uppercase italic text-xs">Add</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {brands.map(b => (
                    <div key={b.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center text-[10px] font-black uppercase italic tracking-widest text-zinc-400">
                      {b.name} <button onClick={() => deleteItem(b.id, "brands")}><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-reveal-up { animation: reveal-up 0.5s ease-out both; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: black; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Admin;