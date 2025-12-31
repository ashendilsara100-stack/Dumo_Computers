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

  // --- 1. OPTIMIZED SEARCH & FILTER ---
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

  // --- 2. ADVANCED BACKGROUND ANIMATION (WITH MOUSE REACT) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let planets = [];
    let mouse = { x: 0, y: 0 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
      }
      update() {
        // Mouse reaction logic
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 100;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < 100) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 10;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 10;
          }
        }
      }
      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 200; i++) stars.push(new Star());

    const animate = () => {
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // --- 3. DATA FETCHING ---
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
    // Simple Toast Effect
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 right-10 bg-amber-500 text-black px-6 py-3 rounded-xl z-[100] font-black uppercase italic text-xs animate-bounce';
    toast.innerText = `🚀 ${p.name} ADDED!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10">
        {/* Navigation Path */}
        <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">
          <span>DUMO STORE</span> <ChevronRight size={12} className="text-amber-500" /> <span className="text-amber-500 italic">Inventory</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR - Sticky */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-24 z-20">
            <div className="space-y-6">
              <div className="bg-zinc-900/60 p-8 rounded-[35px] border border-white/5 backdrop-blur-xl shadow-2xl">
                <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic flex items-center gap-2">
                  <Coins size={14} /> Budget Filter
                </h3>
                <input 
                  type="range" min="0" max="1000000" step="5000"
                  value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="mt-4 text-white font-black italic text-lg">
                  LKR {Number(priceRange).toLocaleString()}
                </div>
              </div>

              <div className="bg-zinc-900/40 backdrop-blur-md p-8 rounded-[35px] border border-white/5 shadow-2xl max-h-[400px] overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic">Components</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setSelectedCategory("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === "All" ? "bg-white text-black" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>All Components</button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === cat.name ? "bg-white text-black" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>{cat.name}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 w-full">
            
            {/* SEARCH & SORT - STICKY FIX */}
            <div className="sticky top-20 lg:top-24 z-30 pb-6">
              <div className="flex flex-col xl:flex-row gap-4 bg-black/80 backdrop-blur-2xl p-4 rounded-[40px] border border-white/10 shadow-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" placeholder="SEARCH HARDWARE..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-5 pl-16 pr-8 rounded-[30px] focus:border-amber-500/50 outline-none font-black italic text-[11px] tracking-[0.2em] uppercase transition-all"
                  />
                </div>
                <select onChange={(e) => setSortBy(e.target.value)} className="xl:w-64 bg-white/5 border border-white/10 px-8 py-5 rounded-[30px] font-black italic text-[11px] outline-none cursor-pointer uppercase">
                  <option value="default">SORT: RELEVANCE</option>
                  <option value="price-low">PRICE: LOW TO HIGH</option>
                  <option value="price-high">PRICE: HIGH TO LOW</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID */}
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/30 border border-white/5 rounded-[45px] p-6 hover:bg-zinc-900/50 transition-all duration-700 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  
                  {/* Image with Zoom & Grayscale effect */}
                  <div className="relative aspect-square bg-black/40 rounded-[35px] mb-6 overflow-hidden border border-white/5">
                    <img 
                      src={p.image || "https://via.placeholder.com/400"} 
                      alt={p.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" 
                    />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-amber-500 text-[8px] font-black px-3 py-1.5 rounded-full uppercase italic border border-amber-500/20">
                      {p.brand}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-1">
                    <p className="text-amber-500 text-[9px] font-black mb-2 uppercase italic flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {p.category}
                    </p>
                    <h3 className="text-sm md:text-lg font-black text-white mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2 h-12">
                      {p.name}
                    </h3>
                    <p className="text-xl md:text-2xl font-black italic tracking-tighter mb-6 pt-4 border-t border-white/5">
                      LKR {p.price.toLocaleString()}
                    </p>
                  </div>

                  <button onClick={() => addToCart(p)} className="w-full bg-white text-black py-4 rounded-[25px] font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[11px] tracking-widest">
                    <ShoppingCart size={16} /> Add To Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-zinc-900/10 rounded-[50px] border border-dashed border-white/10 mt-10">
                <Package className="w-16 h-16 mx-auto mb-6 text-zinc-800" />
                <p className="text-zinc-600 font-black italic uppercase tracking-[0.3em] text-xs">No matching components</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </div>
  );
}