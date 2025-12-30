import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, Coins, Filter } from "lucide-react";

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
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      let catList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      catList.sort((a, b) => {
        if (a.name.toLowerCase() === 'others') return 1;
        if (b.name.toLowerCase() === 'others') return -1;
        return a.name.localeCompare(b.name);
      });
      setCategories(catList);
    });

    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      let brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      brandList.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandList);
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  let filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const categoryMatch = selectedCategory === "All" || 
      (p.category && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
    const brandMatch = selectedBrand === "All" || 
      (p.brand && p.brand.trim().toLowerCase() === selectedBrand.trim().toLowerCase());
    const priceMatch = Number(p.sellingPrice) <= priceRange;

    return searchMatch && categoryMatch && brandMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      
      {/* Container - Mobile padding adjusted */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-10 flex flex-col lg:flex-row gap-8 md:gap-12">
        
        {/* SIDEBAR - Responsive */}
        <aside className="w-full lg:w-72">
          <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6">
            
            {/* BUDGET */}
            <div className="bg-zinc-900/40 p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-amber-500/10 backdrop-blur-md relative overflow-hidden group">
              <h3 className="text-[9px] font-black tracking-[0.2em] text-amber-500 uppercase italic mb-4 flex items-center gap-2">
                <Filter size={12} /> Max Budget
              </h3>
              <p className="font-black italic text-xl md:text-2xl text-white mb-2">LKR {Number(priceRange).toLocaleString()}</p>
              <input 
                type="range" min="0" max="1000000" step="5000"
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" placeholder="SEARCH..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-amber-500/30 font-black italic text-[10px] tracking-widest uppercase"
              />
            </div>

            {/* CATEGORIES - Horizontal Scroll on Mobile */}
            <div className="bg-zinc-900/20 p-5 md:p-6 rounded-[30px] border border-white/5">
              <h3 className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase italic mb-4">Hardware</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[200px] pb-2 lg:pb-0 custom-scrollbar whitespace-nowrap lg:whitespace-normal">
                <button 
                  onClick={() => setSelectedCategory("All")} 
                  className={`px-4 py-2 rounded-xl font-black italic uppercase text-[9px] transition-all flex-shrink-0 ${selectedCategory === "All" ? "bg-white text-black" : "text-zinc-500 bg-zinc-900/40 lg:bg-transparent"}`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setSelectedCategory(cat.name)} 
                    className={`px-4 py-2 rounded-xl font-black italic uppercase text-[9px] transition-all flex-shrink-0 ${selectedCategory === cat.name ? "bg-white text-black" : "text-zinc-500 bg-zinc-900/40 lg:bg-transparent hover:text-white"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* BRANDS - Horizontal Scroll on Mobile */}
            <div className="bg-zinc-900/20 p-5 md:p-6 rounded-[30px] border border-white/5">
              <h3 className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase italic mb-4">Brands</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[200px] pb-2 lg:pb-0 custom-scrollbar whitespace-nowrap lg:whitespace-normal">
                <button 
                  onClick={() => setSelectedBrand("All")} 
                  className={`px-4 py-2 rounded-xl font-black italic uppercase text-[9px] transition-all flex-shrink-0 ${selectedBrand === "All" ? "bg-amber-500 text-black" : "text-zinc-500 bg-zinc-900/40 lg:bg-transparent"}`}
                >
                  All Brands
                </button>
                {brands.map(brand => (
                  <button 
                    key={brand.id} 
                    onClick={() => setSelectedBrand(brand.name)} 
                    className={`px-4 py-2 rounded-xl font-black italic uppercase text-[9px] transition-all flex-shrink-0 ${selectedBrand === brand.name ? "bg-amber-500 text-black" : "text-zinc-500 bg-zinc-900/40 lg:bg-transparent hover:text-white"}`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CATALOG */}
        <main className="flex-1">
          <div className="mb-8 md:mb-12">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">Catalog</h2>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mt-2">Found {filteredProducts.length} components</p>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 animate-pulse">
               {[1,2,3,4].map(i => <div key={i} className="h-64 md:h-96 bg-zinc-900/20 rounded-[30px] md:rounded-[45px]"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/10 border border-white/5 rounded-[30px] md:rounded-[45px] p-4 md:p-6 flex flex-col shadow-2xl">
                  <div className="relative aspect-square bg-black rounded-[20px] md:rounded-[35px] mb-4 md:mb-6 overflow-hidden border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 lg:grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-500 text-[8px] font-black uppercase tracking-widest italic mb-1">{p.category}</p>
                    <h3 className="text-sm md:text-xl font-black text-white mb-2 md:mb-4 leading-tight uppercase italic line-clamp-2">{p.name}</h3>
                    <p className="text-md md:text-2xl font-black italic tracking-tighter mb-4">LKR {Number(p.sellingPrice).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCart([...cart, p])} className="w-full bg-white text-black py-3 md:py-5 rounded-xl md:rounded-[22px] font-black flex items-center justify-center gap-2 hover:bg-amber-500 transition-all uppercase italic text-[9px] md:text-[11px] tracking-widest">
                    <ShoppingCart size={14} className="hidden md:block" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 2px; width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}