import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, Coins, Filter, AlertCircle } from "lucide-react";

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
    // Categories and Brands listeners... (Same as before)
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      let catList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      catList.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(catList);
    });
    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      let brandList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      brandList.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandList);
    });
    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  // --- FUZZY SEARCH LOGIC (වැරදි අකුරු හැදීමට) ---
  const isMatch = (text, query) => {
    if (!query) return true;
    const s = query.toLowerCase().trim();
    const t = text.toLowerCase();
    
    // 1. හරියටම මැච් වෙනවා නම්
    if (t.includes(s)) return true;

    // 2. අකුරු එකක් දෙකක් එහා මෙහා වුණොත් (Simple Fuzzy)
    let mistakes = 0;
    let j = 0;
    for (let i = 0; i < s.length && j < t.length; i++) {
      if (s[i] === t[j]) j++;
      else mistakes++;
    }
    return mistakes <= 2; // අකුරු 2ක් දක්වා වැරදි තිබුණත් පෙන්නනවා
  };

  const filteredProducts = products.filter(p => {
    const searchMatch = isMatch(p.name, searchTerm) || isMatch(p.category, searchTerm) || isMatch(p.brand, searchTerm);
    const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
    const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
    const priceMatch = Number(p.sellingPrice) <= priceRange;
    return searchMatch && categoryMatch && brandMatch && priceMatch;
  });

  // Suggested Items (සර්ච් එකට සමාන වෙනත් බඩු)
  const suggestions = searchTerm.length > 2 ? products.filter(p => 
    isMatch(p.name, searchTerm) && !filteredProducts.includes(p)
  ).slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500">
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-10 flex flex-col lg:flex-row gap-12">
        
        <aside className="w-full lg:w-72 space-y-6">
           {/* Budget, Search, Categories, Brands Filters (පරණ විදිහටම තියන්න) */}
           {/* ... (මම කලින් එවපු කෝඩ් එකේ filters ටික මෙතනට එනවා) ... */}
           
           {/* SEARCH WITH SUGGESTIONS */}
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" placeholder="TYPE ANYTHING..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900/20 border border-white/5 py-4 pl-14 pr-6 rounded-[22px] outline-none focus:border-amber-500/30 font-black italic text-[11px] tracking-widest uppercase"
              />
              
              {/* SUGGESTIONS DROPDOWN */}
              {searchTerm && filteredProducts.length === 0 && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-zinc-900 border border-white/10 mt-2 rounded-2xl p-4 z-50 shadow-2xl">
                  <p className="text-[9px] font-black text-amber-500 mb-2 uppercase tracking-widest italic">Did you mean?</p>
                  {suggestions.map(s => (
                    <button key={s.id} onClick={() => setSearchTerm(s.name)} className="block w-full text-left text-[10px] font-bold py-2 hover:text-amber-500 truncate italic uppercase">
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
           </div>
        </aside>

        <main className="flex-1">
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">Catalog</h2>
            {searchTerm && (
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mt-4">
                Searching for: "{searchTerm}"
              </p>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-zinc-900/10 rounded-[50px] border border-dashed border-white/10">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
              <p className="text-zinc-500 font-black italic uppercase tracking-widest text-sm">No exact matches found</p>
              <button onClick={() => setSearchTerm("")} className="mt-4 text-[10px] font-black text-amber-500 underline uppercase italic">Clear Search</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/10 border border-white/5 rounded-[40px] p-6 hover:bg-zinc-900/30 transition-all flex flex-col">
                  {/* Product Card Content (පරණ විදිහටම) */}
                  <div className="relative aspect-square bg-black rounded-[30px] mb-6 overflow-hidden">
                    <img 
                      src={p.image || "https://via.placeholder.com/300?text=No+Image"} 
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                  </div>
                  <div className="flex-1 px-2">
                    <p className="text-amber-500 text-[9px] font-black uppercase italic mb-1">{p.category}</p>
                    <h3 className="text-lg font-black text-white mb-4 leading-tight uppercase italic line-clamp-2">{p.name}</h3>
                    <p className="text-xl font-black italic mb-6">LKR {Number(p.sellingPrice).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setCart([...cart, p])} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest hover:bg-amber-500 transition-all">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}