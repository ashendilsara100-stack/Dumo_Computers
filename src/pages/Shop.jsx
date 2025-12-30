import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000); 
  const [sortBy, setSortBy] = useState("default");

  // 1. Fetch Dynamic Data from Firebase (Real-time)
  useEffect(() => {
    // Fetch Products
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch Brands
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    // Toast Notification logic remains same
  };

  // 2. Advanced Filter Logic
  let filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase().trim();
    const nameMatch = p.name.toLowerCase().includes(searchLower) || 
                      p.category.toLowerCase().includes(searchLower) ||
                      (p.brand && p.brand.toLowerCase().includes(searchLower));
    
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
    const priceMatch = Number(p.sellingPrice) <= priceRange;

    return nameMatch && categoryMatch && brandMatch && priceMatch;
  });

  // Sorting
  if (sortBy === "price-low") filteredProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
  if (sortBy === "price-high") filteredProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 font-black">
        <span>Home</span> <ChevronRight className="w-3 h-3 text-amber-500" /> <span className="text-amber-500 italic">Store Inventory</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-72 space-y-10">
          
          {/* Price Filter */}
          <div className="bg-zinc-900/20 p-8 rounded-[40px] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <h3 className="text-xs font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic">Max Budget</h3>
            <input 
              type="range" min="0" max="1000000" step="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="mt-4 font-black italic text-lg text-white">LKR {Number(priceRange).toLocaleString()}</p>
          </div>

          {/* Categories Filter - Dynamic */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic ml-4">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button onClick={() => setSelectedCategory("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic uppercase text-xs transition-all ${selectedCategory === "All" ? "bg-amber-500 text-black" : "bg-zinc-900/40 text-zinc-500 hover:text-white"}`}>All Components</button>
              {categories.map(cat => (
                <button
                  key={cat.id} onClick={() => setSelectedCategory(cat.name)}
                  className={`text-left px-6 py-3 rounded-2xl font-black italic uppercase text-xs transition-all ${selectedCategory === cat.name ? "bg-amber-500 text-black translate-x-2" : "bg-zinc-900/40 text-zinc-500 hover:text-white hover:bg-zinc-900"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter - Dynamic */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase italic ml-4">Brands</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button onClick={() => setSelectedBrand("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic uppercase text-xs transition-all ${selectedBrand === "All" ? "bg-white text-black" : "bg-zinc-900/40 text-zinc-500 hover:text-white"}`}>All Brands</button>
              {brands.map(brand => (
                <button
                  key={brand.id} onClick={() => setSelectedBrand(brand.name)}
                  className={`text-left px-6 py-3 rounded-2xl font-black italic uppercase text-xs transition-all ${selectedBrand === brand.name ? "bg-white text-black translate-x-2" : "bg-zinc-900/40 text-zinc-500 hover:text-white hover:bg-zinc-900"}`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN SHOP AREA */}
        <main className="flex-1">
          {/* Search & Sort Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input 
                type="text" placeholder="SEARCH HARDWARE..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/30 border border-white/5 py-5 pl-16 pr-8 rounded-[25px] focus:border-amber-500/50 outline-none font-black italic text-sm tracking-widest uppercase"
              />
            </div>
            <select 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-900/30 border border-white/5 px-8 py-5 rounded-[25px] font-black italic text-xs outline-none cursor-pointer uppercase"
            >
              <option value="default">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-[450px] bg-zinc-900/40 rounded-[45px]"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/20 border border-white/5 rounded-[45px] p-6 hover:bg-zinc-900/40 transition-all duration-500 flex flex-col justify-between hover:border-amber-500/20">
                  <div className="relative aspect-square bg-black rounded-[35px] mb-6 overflow-hidden border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute top-4 right-4 bg-amber-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase italic shadow-2xl">
                      {p.brand}
                    </div>
                  </div>
                  <div className="px-2">
                    <p className="text-amber-500 text-[10px] font-black mb-1 uppercase tracking-[0.2em] italic">{p.category}</p>
                    <h3 className="text-xl font-black text-white mb-6 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2">{p.name}</h3>
                    <div className="flex items-center justify-between mb-6">
                       <p className="text-2xl font-black italic">LKR {Number(p.sellingPrice).toLocaleString()}</p>
                       {p.stock < 5 && <span className="text-[10px] text-red-500 font-black animate-pulse uppercase">Only {p.stock} Left!</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-full bg-white text-black py-5 rounded-[22px] font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-xs tracking-widest"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-32 bg-zinc-900/10 rounded-[50px] border border-dashed border-white/10">
              <Package className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
              <p className="text-zinc-500 font-black italic uppercase tracking-widest text-sm">No items matching your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}