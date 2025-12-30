import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000); 

  useEffect(() => {
    // 1. Fetch Products
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // 2. Fetch & Sort Categories (A-Z, Others at Bottom)
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      let catList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      catList.sort((a, b) => {
        if (a.name.toLowerCase() === 'others') return 1;
        if (b.name.toLowerCase() === 'others') return -1;
        return a.name.localeCompare(b.name);
      });
      
      setCategories(catList);
    });

    // 3. Fetch & Sort Brands (A-Z)
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      let brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      brandList.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandList);
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  // Filter Logic
  let filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
    const priceMatch = Number(p.sellingPrice) <= priceRange;
    return searchMatch && categoryMatch && brandMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      
      <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 font-black italic">
        <span>Dumo Store</span> <ChevronRight className="w-3 h-3 text-amber-500" /> <span className="text-amber-500">Inventory</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        
        {/* STICKY SIDEBAR */}
        <aside className="w-full lg:w-72">
          <div className="lg:sticky lg:top-28 space-y-8">
            
            {/* SEARCH (Moved to Sidebar for easy access) */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                type="text" placeholder="SEARCH..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/40 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-amber-500/50 font-black italic text-xs tracking-widest uppercase transition-all"
              />
            </div>

            {/* CATEGORIES - Scrollable if long */}
            <div className="bg-zinc-900/20 p-6 rounded-[35px] border border-white/5 backdrop-blur-md">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase italic mb-4">Hardware</h3>
              <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                <button onClick={() => setSelectedCategory("All")} className={`text-left px-4 py-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${selectedCategory === "All" ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-white"}`}>All Components</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-left px-4 py-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${selectedCategory === cat.name ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-zinc-500 hover:text-white"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* BRANDS - Scrollable if long */}
            <div className="bg-zinc-900/20 p-6 rounded-[35px] border border-white/5 backdrop-blur-md">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-blue-500 uppercase italic mb-4">Brands</h3>
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                <button onClick={() => setSelectedBrand("All")} className={`text-left px-4 py-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${selectedBrand === "All" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>All Brands</button>
                {brands.map(brand => (
                  <button key={brand.id} onClick={() => setSelectedBrand(brand.name)} className={`text-left px-4 py-2 rounded-xl font-black italic uppercase text-[10px] transition-all ${selectedBrand === brand.name ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="px-4">
              <p className="text-[10px] font-black italic text-zinc-500 uppercase mb-4 tracking-widest">Max Budget: <span className="text-white">LKR {Number(priceRange).toLocaleString()}</span></p>
              <input type="range" min="0" max="1000000" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full accent-amber-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
            </div>

          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Inventory <span className="text-zinc-800 ml-2">({filteredProducts.length})</span></h2>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-96 bg-zinc-900/40 rounded-[40px]"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/20 border border-white/5 rounded-[40px] p-5 hover:bg-zinc-900/40 transition-all duration-500 flex flex-col hover:border-amber-500/20 shadow-xl">
                  <div className="relative aspect-square bg-black rounded-[30px] mb-5 overflow-hidden border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0" />
                  </div>
                  <div className="px-2 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-amber-500 text-[9px] font-black uppercase tracking-widest italic">{p.category}</p>
                      <span className="text-[9px] font-black text-zinc-600 uppercase italic bg-white/5 px-2 py-1 rounded-md">{p.brand}</span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2">{p.name}</h3>
                    <p className="text-xl font-black italic mb-6">LKR {Number(p.sellingPrice).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCart([...cart, p])} className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[10px] tracking-widest">
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-24 bg-zinc-900/10 rounded-[40px] border border-dashed border-white/5">
              <Package className="w-12 h-12 mx-auto mb-4 text-zinc-800" />
              <p className="text-zinc-600 font-black italic uppercase tracking-widest text-xs">Zero items found</p>
            </div>
          )}
        </main>
      </div>
      
      {/* CSS for Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}