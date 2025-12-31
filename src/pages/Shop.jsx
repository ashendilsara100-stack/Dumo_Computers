import { useEffect, useState, useRef, useMemo } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, Filter, Coins } from "lucide-react";

const categorySynonyms = {
  gpu: ["graphic card", "vga", "graphics card", "video card", "gpu", "nvidia", "rtx", "gtx", "radeon", "display"],
  cpu: ["processor", "chip", "intel", "amd", "ryzen", "core i", "cpu", "processor"],
  ram: ["memory", "desktop ram", "ddr4", "ddr5", "ram", "memory"],
  psu: ["power supply", "power unit", "watt", "psu", "650w", "750w", "850w"],
  storage: ["ssd", "hard drive", "hdd", "nvme", "m.2", "sata", "storage", "internal storage"],
  cooling: ["fan", "cooler", "heatsink", "liquid cool", "aio", "cooling", "fan"],
  motherboard: ["board", "mobo", "mainboard", "motherboard", "mb"]
};

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null); 
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000); 
  const [sortBy, setSortBy] = useState("default");

  // 🚀 Optimize Search & Filter using useMemo (Speed එක වැඩි කිරීමට)
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const searchLower = searchTerm.toLowerCase().trim();
      const productName = (p.name || "").toLowerCase();
      const productCat = (p.category || "").toLowerCase();
      const productBrand = (p.brand || "").toLowerCase();

      const isSynonymMatch = Object.keys(categorySynonyms).some(key => 
        categorySynonyms[key].some(syn => syn.includes(searchLower)) && productCat.includes(key)
      );

      const nameMatch = productName.includes(searchLower) || productBrand.includes(searchLower);
      const categoryMatch = selectedCategory === "All" || p.category === selectedCategory;
      const brandMatch = selectedBrand === "All" || p.brand === selectedBrand;
      const priceMatch = p.price <= priceRange;

      return categoryMatch && brandMatch && priceMatch && (nameMatch || isSynonymMatch || searchTerm === "");
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    
    return result;
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  // --- OPTIMIZED BACKGROUND ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    const animate = () => {
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (snap) => {
      setProducts(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        price: Number(doc.data().sellingPrice) || 0 
      })));
      setLoading(false);
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      setBrands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProducts(); unsubCats(); unsubBrands(); };
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Main Container - Removed overflow-x-hidden to fix Sticky */}
      <div className="relative z-10">
        
        {/* TOP PATH */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <span>DUMO</span> <ChevronRight size={10} /> <span className="text-amber-500">INVENTORY</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR - Fixed Sticky */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-4 z-20">
            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[30px] border border-white/5 shadow-2xl">
              <h3 className="text-[10px] font-black mb-4 text-amber-500 uppercase tracking-tighter flex items-center gap-2">
                <Coins size={14} /> BUDGET
              </h3>
              <input 
                type="range" min="0" max="1000000" step="5000"
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full accent-amber-500"
              />
              <p className="text-white font-black mt-2">LKR {Number(priceRange).toLocaleString()}</p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-[30px] border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black mb-4 text-zinc-500 uppercase">CATEGORY</h3>
              <div className="flex flex-col gap-1">
                <button onClick={() => setSelectedCategory("All")} className={`text-left px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${selectedCategory === "All" ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>All</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-left px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all ${selectedCategory === cat.name ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>{cat.name}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT AREA */}
          <main className="flex-1 w-full">
            
            {/* SEARCH BAR - Fixed Sticky */}
            <div className="sticky top-20 lg:top-24 z-[40] mb-8">
              <div className="bg-black/80 backdrop-blur-2xl p-3 rounded-[25px] border border-white/10 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" placeholder="SEARCH HARDWARE..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border-none py-4 pl-12 pr-4 rounded-xl text-xs uppercase font-bold outline-none focus:ring-1 ring-amber-500/50"
                  />
                </div>
                <select onChange={(e) => setSortBy(e.target.value)} className="bg-zinc-900/50 border-none px-6 py-4 rounded-xl text-[10px] font-bold uppercase outline-none">
                  <option value="default">RELEVANCE</option>
                  <option value="price-low">PRICE: LOW</option>
                  <option value="price-high">PRICE: HIGH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-zinc-900/30 border border-white/5 rounded-[30px] p-4 group hover:bg-zinc-900/60 transition-all duration-500 backdrop-blur-sm">
                  <div className="aspect-square bg-black/40 rounded-[20px] mb-4 overflow-hidden border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h3 className="text-[13px] font-bold uppercase italic line-clamp-2 h-10">{p.name}</h3>
                  <p className="text-amber-500 font-black text-lg mt-2 italic">LKR {p.price.toLocaleString()}</p>
                  <button onClick={() => addToCart(p)} className="w-full bg-white text-black py-3 mt-4 rounded-xl font-black text-[10px] uppercase hover:bg-amber-500 transition-all">Add to Cart</button>
                </div>
              ))}
            </div>

          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
}