import { useEffect, useState, useRef } from "react"; // useRef එකතු කළා
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
  const canvasRef = useRef(null); // Canvas එක සඳහා Ref එකක්
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState(1000000); 
  const [sortBy, setSortBy] = useState("default");

  // --- Background Animation Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let planets = [];
    let shootingStars = [];

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
        this.vy = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.y += this.vy;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    for (let i = 0; i < 150; i++) stars.push(new Star());

    const animate = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener("resize", resize);
  }, []);

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

  const addToCart = (p) => {
    setCart([...cart, p]);
    // Toast logic here...
  };

  let filteredProducts = products.filter(p => {
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

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* Background Canvas (Fixed) */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10"> {/* Contents in Z-10 to be above canvas */}
        
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 pt-28 flex items-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-black">
          <span>DUMO STORE</span> <ChevronRight size={12} className="text-amber-500" /> <span className="text-amber-500 italic">Inventory</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8 md:gap-12">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* PRICE RANGE */}
              <div className="bg-zinc-900/40 p-6 md:p-8 rounded-[35px] border border-white/5 backdrop-blur-xl group">
                <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-amber-500 uppercase italic flex items-center gap-2">
                  <Coins size={14} /> Budget Filter
                </h3>
                <input 
                  type="range" min="0" max="1000000" step="5000"
                  value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-4">
                  <span className="text-zinc-600 font-black italic text-[10px]">LKR 0</span>
                  <span className="text-white font-black italic text-lg">LKR {Number(priceRange).toLocaleString()}</span>
                </div>
              </div>

              {/* Categories & Brands with backdrop-blur */}
              <div className="bg-zinc-900/40 backdrop-blur-md p-6 md:p-8 rounded-[35px] border border-white/5 shadow-2xl">
                <h3 className="text-[10px] font-black mb-6 tracking-[0.2em] text-zinc-500 uppercase italic">Component Type</h3>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[250px] custom-scrollbar pb-2 lg:pb-0">
                   {/* ... buttons ... */}
                </div>
              </div>
              
              {/* ... Rest of your Sidebar code ... */}

            </div>
          </aside>

          {/* MAIN AREA */}
          <main className="flex-1">
             {/* ... Search & Products grid ... */}
             {/* Ensure card backgrounds are also semi-transparent: bg-zinc-900/40 backdrop-blur-sm */}
          </main>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 2px; width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fbbf24; }
      `}</style>
    </div>
  );
}