import { useEffect, useState } from "react";
import { db } from "../firebase/config"; // Firebase සම්බන්ධ කිරීම
import { collection, onSnapshot, query } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight } from "lucide-react";

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(500000); 
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU", "Case", "Cooling"];

  // 1. Firebase එකෙන් Real-time Data ලබාගැනීම
  useEffect(() => {
    const q = query(collection(db, "products"));
    
    // onSnapshot පාවිච්චි කිරීමෙන් Database එකේ වෙනසක් වුණු ගමන් මෙතනට update වෙනවා
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // ඇඩ්මින් එකේ sellingPrice කියන එක price විදිහට ගන්නවා
        price: Number(doc.data().sellingPrice) || 0 
      }));
      setProducts(items);
      setLoading(false);
    });

    return () => unsubscribe(); // Page එකෙන් අයින් වෙද්දී connection එක නවත්වනවා
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    
    // Custom Toast Notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl z-50 font-black animate-bounce flex items-center gap-3 italic';
    toast.innerHTML = `🚀 Added ${p.name} to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // 2. Filter Logic (Real-time filtering)
  let filteredProducts = products.filter(p => 
    (selectedCategory === "All" || p.category === selectedCategory) &&
    (p.price <= priceRange) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 3. Sort Logic
  if (sortBy === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === "name") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-24 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-black">
        <span className="hover:text-white cursor-pointer transition-colors">Home</span> 
        <ChevronRight className="w-3 h-3 text-amber-500" /> 
        <span className="text-amber-500 italic">Shop All Components</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-12">
        
        {/* 2. Sidebar Filter */}
        <aside className="w-full lg:w-72 space-y-12">
          <div className="bg-zinc-900/20 p-8 rounded-[40px] border border-white/5 backdrop-blur-3xl">
            <h3 className="text-xs font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic">Filter by Price</h3>
            <input 
              type="range" 
              min="0" 
              max="1000000" 
              step="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between mt-4 font-black italic">
              <span className="text-zinc-600 text-xs">MIN</span>
              <span className="text-white text-lg">LKR {Number(priceRange).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-zinc-900/20 p-8 rounded-[40px] border border-white/5">
            <h3 className="text-xs font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-6 py-3 rounded-2xl font-black italic transition-all uppercase text-sm ${
                    selectedCategory === cat 
                    ? "bg-amber-500 text-black translate-x-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                    : "hover:bg-white/5 text-zinc-500 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1">
          {/* Search & Sort Row */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
              <input 
                type="text" 
                placeholder="SEARCH FOR COMPONENTS..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/30 border border-white/5 py-5 pl-16 pr-8 rounded-[30px] focus:border-amber-500/50 outline-none transition-all font-black italic text-sm tracking-widest uppercase"
              />
            </div>
            <select 
              className="w-full md:w-auto bg-zinc-900/30 border border-white/5 px-8 py-5 rounded-[30px] font-black italic text-sm outline-none focus:border-amber-500/50 appearance-none cursor-pointer uppercase"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default" className="bg-zinc-900">SORT: FEATURED</option>
              <option value="price-low" className="bg-zinc-900">PRICE: LOW TO HIGH</option>
              <option value="price-high" className="bg-zinc-900">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-96 bg-zinc-900/20 rounded-[45px] animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-10 px-2">
                <p className="text-zinc-500 font-black italic text-xs uppercase tracking-widest">Showing {filteredProducts.length} Items</p>
                <div className="h-[1px] flex-1 bg-white/5 mx-6"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(p => (
                  <div key={p.id} className="group bg-zinc-900/20 border border-white/5 rounded-[45px] p-6 hover:bg-zinc-900/40 transition-all duration-500 flex flex-col justify-between border-b-4 border-b-transparent hover:border-b-amber-500">
                    <div className="relative aspect-square bg-black rounded-[35px] mb-6 flex items-center justify-center border border-white/5 overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      ) : (
                        <Package className="w-20 h-20 text-zinc-800 group-hover:text-amber-500/20 transition-colors" />
                      )}
                      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase italic tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        In Stock
                      </div>
                    </div>
                    
                    <div className="px-2">
                      <p className="text-amber-500 text-[10px] font-black mb-2 uppercase tracking-[0.2em] italic">{p.category}</p>
                      <h3 className="text-xl font-black text-white mb-6 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2">{p.name}</h3>
                      <div className="flex items-center justify-between mb-6">
                         <span className="text-2xl font-black italic">LKR {p.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full bg-white text-black py-5 rounded-[25px] font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic tracking-tighter"
                    >
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}