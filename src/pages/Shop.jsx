import { useEffect, useState, useRef, useMemo } from "react";
import { db } from "../firebase/config"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, ChevronRight, Filter, Coins, LayoutGrid } from "lucide-react";

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

  // --- 1. PRODUCT FILTER LOGIC ---
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

  // --- 2. THE HOME-STYLE BACKGROUND ANIMATION ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let planets = [];
    let shootingStars = [];
    let particles = [];
    let mouse = { x: 0, y: 0, realX: -1000, realY: -1000 };
    let isClicking = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height) / 2;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 6;
        this.size = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      update() {
        this.x += this.speed; this.y += this.speed; this.opacity -= 0.01;
        if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
          if (Math.random() < 0.03) this.reset();
        }
      }
      draw() {
        if (this.opacity > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.lineWidth = this.size;
          ctx.beginPath(); ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.length, this.y - this.length);
          ctx.stroke(); ctx.restore();
        }
      }
    }

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= 0.02; }
      draw() {
        ctx.fillStyle = `rgba(245, 158, 11, ${this.life})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    class Planet {
      constructor(size, color, speed, depth) {
        this.size = size; this.color = color; this.speed = speed; this.depth = depth;
        this.reset(true);
      }
      reset(firstTime) {
        this.x = Math.random() * canvas.width;
        this.y = firstTime ? Math.random() * canvas.height : -200;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height + 200) this.reset();
        this.renderX = this.x + (mouse.x * this.depth);
        this.renderY = this.y + (mouse.y * this.depth);
      }
      draw() {
        ctx.save(); ctx.translate(this.renderX, this.renderY);
        let grad = ctx.createRadialGradient(-this.size/3, -this.size/3, this.size/10, 0, 0, this.size);
        grad.addColorStop(0, this.color); grad.addColorStop(1, "black");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    class Star {
      constructor() { 
        this.init(); 
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.vy = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.twinkle += this.twinkleSpeed;
        if (isClicking) {
          const dx = mouse.realX - this.x; const dy = mouse.realY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.x += dx / (dist * 0.1); this.y += dy / (dist * 0.1);
          if (dist < 5) this.init();
        } else {
          this.y += this.vy; if (this.y > canvas.height) this.y = 0;
        }
      }
      draw() { 
        const opacity = 0.8 + Math.sin(this.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`; 
        ctx.fillRect(this.x, this.y, this.size, this.size); 
      }
    }

    planets = [new Planet(60, "#f59e0b", 0.1, 5), new Planet(110, "#78350f", 0.05, 3)];
    for (let i = 0; i < 200; i++) stars.push(new Star());
    for (let i = 0; i < 5; i++) shootingStars.push(new ShootingStar());

    const animate = () => {
      ctx.fillStyle = "#020202"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      planets.forEach(p => { p.update(); p.draw(); });
      shootingStars.forEach(s => { s.update(); s.draw(); });
      particles = particles.filter(p => { p.update(); p.draw(); return p.life > 0; });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouse.realX = e.clientX; mouse.realY = e.clientY;
      mouse.x = (e.clientX - canvas.width/2) / 80;
      mouse.y = (e.clientY - canvas.height/2) / 80;
    };
    const handleClick = (e) => {
      for (let i = 0; i < 20; i++) particles.push(new Particle(e.clientX, e.clientY));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", () => isClicking = true);
    window.addEventListener("mouseup", () => isClicking = false);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
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
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 right-10 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl z-[100] font-black flex items-center gap-3 italic uppercase text-sm border-2 border-black animate-bounce';
    toast.innerHTML = `🚀 ${p.name} ADDED!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">
          <span>DUMO STORE</span> <ChevronRight size={12} className="text-amber-500" /> <span className="text-amber-500 italic">Inventory</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8 md:gap-12 items-start">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-24 z-20 space-y-6">
            
            {/* BUDGET */}
            <div className="bg-zinc-900/60 p-6 md:p-8 rounded-[35px] border border-white/5 backdrop-blur-xl shadow-2xl">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic flex items-center gap-2">
                <Coins size={14} /> Budget Filter
              </h3>
              <input 
                type="range" min="0" max="1000000" step="5000"
                value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="mt-4 text-white font-black italic text-lg">LKR {Number(priceRange).toLocaleString()}</div>
            </div>

            {/* CATEGORIES */}
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 rounded-[35px] border border-white/5 shadow-2xl max-h-[350px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic flex items-center gap-2">
                <LayoutGrid size={12}/> Categories
              </h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSelectedCategory("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === "All" ? "bg-white text-black translate-x-1" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>All Components</button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedCategory === cat.name ? "bg-white text-black translate-x-1" : "text-zinc-500 hover:text-white hover:bg-white/5"}`}>{cat.name}</button>
                ))}
              </div>
            </div>

            {/* BRANDS - RE-ADDED */}
            <div className="bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 rounded-[35px] border border-white/5 shadow-2xl max-h-[350px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic">Popular Brands</h3>
              <div className="flex flex-col gap-2">
                <button onClick={() => setSelectedBrand("All")} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedBrand === "All" ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"}`}>All Brands</button>
                {brands.map(brand => (
                  <button key={brand.id} onClick={() => setSelectedBrand(brand.name)} className={`text-left px-6 py-3 rounded-2xl font-black italic text-[11px] uppercase transition-all ${selectedBrand === brand.name ? "bg-amber-500 text-black translate-x-1" : "text-zinc-500 hover:text-white"}`}>{brand.name}</button>
                ))}
              </div>
            </div>

          </aside>

          {/* MAIN AREA */}
          <main className="flex-1 w-full">
            <div className="sticky top-20 lg:top-24 z-30 pb-6">
              <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center bg-black/80 backdrop-blur-2xl p-4 rounded-[40px] border border-white/10 shadow-2xl">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" placeholder="SEARCH HARDWARE..." 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 py-5 pl-16 pr-8 rounded-[30px] focus:border-amber-500/50 outline-none font-black italic text-[11px] tracking-[0.2em] uppercase transition-all"
                  />
                </div>
                {/* SORT DROPDOWN - FIXED VISIBILITY */}
                <select 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="w-full xl:w-64 bg-zinc-900 border border-white/10 px-8 py-5 rounded-[30px] font-black italic text-[11px] outline-none cursor-pointer uppercase tracking-widest text-white appearance-none"
                >
                  <option value="default" className="bg-zinc-900 text-white">SORT: RELEVANCE</option>
                  <option value="price-low" className="bg-zinc-900 text-white">PRICE: LOW TO HIGH</option>
                  <option value="price-high" className="bg-zinc-900 text-white">PRICE: HIGH TO LOW</option>
                  <option value="name" className="bg-zinc-900 text-white">NAME: A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="group bg-zinc-900/30 border border-white/5 rounded-[35px] md:rounded-[45px] p-4 md:p-6 hover:bg-zinc-900/50 transition-all duration-700 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="relative aspect-square bg-black/40 rounded-[25px] md:rounded-[35px] mb-6 overflow-hidden border border-white/5">
                    <img src={p.image || "https://via.placeholder.com/400"} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-amber-500 text-[8px] font-black px-3 py-1.5 rounded-full uppercase italic border border-amber-500/20">
                      {p.brand}
                    </div>
                  </div>
                  <div className="flex-1 px-1">
                    <p className="text-amber-500 text-[9px] font-black mb-2 uppercase tracking-[0.2em] italic flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {p.category}
                    </p>
                    <h3 className="text-sm md:text-lg font-black text-white mb-4 leading-tight uppercase italic group-hover:text-amber-500 transition-colors line-clamp-2 h-10 md:h-14">
                      {p.name}
                    </h3>
                    <p className="text-lg md:text-2xl font-black italic tracking-tighter mb-6 pt-4 border-t border-white/5">
                      LKR {p.price.toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => addToCart(p)} className="w-full bg-white text-black py-4 md:py-5 rounded-[20px] md:rounded-[25px] font-black flex items-center justify-center gap-3 hover:bg-amber-500 transition-all active:scale-95 uppercase italic text-[10px] md:text-[11px] tracking-widest shadow-xl">
                    <ShoppingCart size={16} /> Add To Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Empty Result Message */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-40">
                <Package size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                <p className="text-zinc-500 font-black italic uppercase text-xs tracking-widest">No hardware found matching your criteria</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1rem; }
      `}</style>
    </div>
  );
}