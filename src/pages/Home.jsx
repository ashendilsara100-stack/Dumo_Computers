import { useEffect, useState } from "react";
import { ShoppingCart, Search, Filter, Zap, TrendingUp, Star, Package, CheckCircle } from "lucide-react";

// Mock Products Data for Preview
const mockProducts = [
  { id: 1, name: "AMD Ryzen 5 5600X", category: "CPU", price: 72000 },
  { id: 2, name: "NVIDIA RTX 4060 Ti", category: "GPU", price: 185000 },
  { id: 3, name: "Corsair Vengeance 16GB DDR4", category: "RAM", price: 28000 },
  { id: 4, name: "Samsung 970 EVO 1TB NVMe", category: "Storage", price: 35000 },
  { id: 5, name: "ASUS ROG Strix B550-F", category: "Motherboard", price: 65000 },
  { id: 6, name: "Corsair RM850x 850W", category: "PSU", price: 42000 },
  { id: 7, name: "NZXT H510 Elite", category: "Case", price: 38000 },
  { id: 8, name: "Cooler Master Hyper 212", category: "Cooling", price: 15000 },
  { id: 9, name: "Intel Core i7-13700K", category: "CPU", price: 145000 },
  { id: 10, name: "NVIDIA RTX 4070 Ti", category: "GPU", price: 295000 },
  { id: 11, name: "G.Skill Trident Z 32GB DDR5", category: "RAM", price: 58000 },
  { id: 12, name: "WD Black SN850X 2TB NVMe", category: "Storage", price: 68000 },
];

export default function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU", "Case", "Cooling"];

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-white text-black px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold border-2 border-amber-500';
    toast.innerHTML = '✓ Added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  let filteredProducts = products.filter(p => 
    (selectedCategory === "All" || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "name") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-black py-20 px-6 border-b-2 ">
        <div className="max-w-7xl mx-auto">
          {/* <div className="flex items-center gap-4 mb-6">
            <Package className="w-12 h-12 text-white" />
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
              Dumo Computers
            </h1>
          </div> */}
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-bold">
            Premium Gaming Components & PC Parts
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-amber-500 hover:scale-105 transition-all">
              <Zap className="w-5 h-5" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-amber-500 hover:scale-105 transition-all">
              <Star className="w-5 h-5" />
              <span>Genuine Products</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-amber-500 hover:scale-105 transition-all">
              <TrendingUp className="w-5 h-5" />
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="sticky top-0 z-40 bg-black border-b-2 border-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white text-black placeholder-gray-500 border-2 border-white rounded-xl focus:outline-none focus:border-amber-500 font-bold transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-12 pr-8 py-4 bg-white text-black border-2 border-white rounded-xl focus:outline-none focus:border-amber-500 appearance-none cursor-pointer font-bold transition-all"
              >
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-full font-black whitespace-nowrap transition-all duration-300 border-2 ${
                  selectedCategory === cat
                    ? "bg-white text-black border-white scale-110 shadow-xl hover:bg-amber-500"
                    : "bg-black text-white border-white hover:bg-white hover:text-black hover:border-amber-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-xl font-bold">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-gray-800 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-gray-400 text-lg">
              Showing <span className="text-white font-black">{filteredProducts.length}</span> products
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-black rounded-2xl overflow-hidden border-2 border-white hover:border-amber-500 hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  {/* Product Image Placeholder */}
                  <div className="relative h-48 bg-black group-hover:bg-white flex items-center justify-center overflow-hidden border-b-2 border-white group-hover:border-amber-500 transition-all duration-300">
                    <Package className="w-20 h-20 text-white group-hover:text-black transition-all duration-300 group-hover:scale-110" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 px-4 py-1 bg-white text-black group-hover:bg-amber-500 border-2 border-black rounded-full text-xs font-black transition-all duration-300">
                      {p.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="relative p-6">
                    <h3 className="text-lg font-black mb-3 text-white group-hover:text-black transition-colors duration-300 line-clamp-2">
                      {p.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-black text-white group-hover:text-amber-600 transition-colors duration-300">
                        LKR {Number(p.price).toLocaleString()}
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-5 text-sm">
                      <CheckCircle className="w-4 h-4 text-white group-hover:text-black transition-colors duration-300" />
                      <span className="text-white group-hover:text-black font-bold transition-colors duration-300">In Stock</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full py-4 bg-white text-black group-hover:bg-amber-500 group-hover:text-white border-2 border-black font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="relative bg-white text-black py-20 px-6 mt-12 border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <Package className="w-20 h-20 text-black mx-auto mb-6" />
          <h3 className="text-5xl font-black mb-6">
            Can't Find What You Need?
          </h3>
          <p className="text-gray-700 mb-8 text-xl font-bold">
            Contact us for custom builds and special orders
          </p>
          <button className="px-12 py-5 bg-black text-white rounded-xl font-black text-xl hover:bg-amber-500 hover:scale-105 transition-all duration-300 shadow-2xl border-4 border-black">
            Contact Us on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}