import { useEffect, useState } from "react";
import { ShoppingCart, Search, Filter, Zap, TrendingUp, Star, Package, CheckCircle, ChevronRight } from "lucide-react";

const mockProducts = [
  { id: 1, name: "AMD Ryzen 5 5600X", category: "CPU", price: 72000, brand: "AMD" },
  { id: 2, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 185000, brand: "NVIDIA" },
  { id: 3, name: "Corsair Vengeance 16GB DDR4", category: "RAM", price: 28000, brand: "Corsair" },
  { id: 4, name: "Samsung 970 EVO 1TB NVMe", category: "Storage", price: 35000, brand: "Samsung" },
  { id: 5, name: "ASUS ROG Strix B550-F", category: "Motherboard", price: 65000, brand: "ASUS" },
  { id: 6, name: "Corsair RM850x 850W", category: "PSU", price: 42000, brand: "Corsair" },
  { id: 7, name: "NZXT H510 Elite", category: "Case", price: 38000, brand: "NZXT" },
  { id: 8, name: "Cooler Master Hyper 212", category: "Cooling", price: 15000, brand: "Cooler Master" },
  { id: 9, name: "Intel Core i7-13700K", category: "CPU", price: 145000, brand: "Intel" },
  { id: 10, name: "NVIDIA RTX 4070 Ti", category: "GPU", price: 295000, brand: "NVIDIA" },
  { id: 11, name: "G.Skill Trident Z 32GB DDR5", category: "RAM", price: 58000, brand: "G.Skill" },
  { id: 12, name: "WD Black SN850X 2TB NVMe", category: "Storage", price: 68000, brand: "WD" },
];

export default function ShopPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(500000); // Default max price
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU", "Case", "Cooling"];

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    // Custom Toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl z-50 font-black animate-bounce flex items-center gap-3';
    toast.innerHTML = `🚀 Added ${p.name} to cart!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Filter Logic
  let filteredProducts = products.filter(p => 
    (selectedCategory === "All" || p.category === selectedCategory) &&
    (p.price <= priceRange) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort Logic
  if (sortBy === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filteredProducts.sort((a, b) => b.price - a.price);
  if (sortBy === "name") filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center gap-2 text-sm text-gray-500 font-bold">
        <span>Home</span> <ChevronRight className="w-4 h-4" /> <span className="text-amber-500">Shop All Components</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* 2. Sidebar Filter (Desktop) */}
        <aside className="w-full lg:w-64 space-y-8">
          <div>
            <h3 className="text-xl font-black mb-4 border-l-4 border-amber-500 pl-3">FILTER BY PRICE</h3>
            <input 
              type="range" 
              min="0" 
              max="500000" 
              step="5000"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between mt-2 font-bold text-gray-400">
              <span>0</span>
              <span className="text-white">LKR {Number(priceRange).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black mb-4 border-l-4 border-amber-500 pl-3">CATEGORIES</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCategory === cat ? "bg-amber-500 text-black scale-105" : "hover:bg-gray-900 text-gray-400"
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
          <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-950 p-4 rounded-2xl border border-gray-900 shadow-inner">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                placeholder="What are you looking for?" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-gray-800 py-3 pl-12 pr-4 rounded-xl focus:border-amber-500 outline-none transition-all font-bold"
              />
            </div>
            <select 
              className="bg-black border border-gray-800 px-6 py-3 rounded-xl font-bold outline-none focus:border-amber-500"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-900 rounded-2xl"></div>)}
            </div>
          ) : (
            <>
              <p className="mb-6 text-gray-500 font-bold">Found {filteredProducts.length} items in Stock</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(p => (
                  <div key={p.id} className="group bg-gray-950 border border-gray-900 rounded-3xl p-4 hover:border-amber-500/50 transition-all duration-500 flex flex-col justify-between">
                    <div className="relative aspect-square bg-black rounded-2xl mb-4 flex items-center justify-center border border-gray-900 group-hover:bg-gray-900 transition-colors">
                      <Package className="w-16 h-16 text-gray-800 group-hover:text-amber-500 transition-colors" />
                      <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic">Hot Item</span>
                    </div>
                    
                    <div>
                      <p className="text-amber-500 text-xs font-black mb-1 uppercase tracking-widest">{p.category}</p>
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-amber-100 transition-colors">{p.name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                         <span className="text-2xl font-black text-white">LKR {p.price.toLocaleString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart(p)}
                      className="w-full bg-white text-black py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 transition-all active:scale-95"
                    >
                      <ShoppingCart className="w-5 h-5" /> ADD TO CART
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