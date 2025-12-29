import { useEffect, useState } from "react";
import { getProducts } from "../firebase/products";
import { ShoppingCart, Search, Filter, Zap, TrendingUp, Star, Package } from "lucide-react";

export default function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const categories = ["All", "CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU", "Case", "Cooling"];

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
    // Toast notification effect
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
    toast.textContent = '✓ Added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Filter and sort products
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 py-16 px-6">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-cyan-400" />
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Dumo Computers
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-6">
            Premium Gaming Components & PC Parts in Sri Lanka
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full">
              <Star className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400">Genuine Products</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400">Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-gray-800 py-4 px-6">
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
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-12 pr-8 py-3 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white scale-105 shadow-lg shadow-cyan-500/50"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
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
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-lg">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-400">
              Showing <span className="text-cyan-400 font-bold">{filteredProducts.length}</span> products
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  {/* Product Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Package className="w-20 h-20 text-gray-600 group-hover:text-cyan-400 transition-colors duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-bold">
                      {p.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2 text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-cyan-400">
                        LKR {Number(p.price).toLocaleString()}
                      </span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-4 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400">In Stock</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Add to Cart
                    </button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 py-12 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Can't Find What You Need?
          </h3>
          <p className="text-gray-300 mb-6">
            Contact us for custom builds and special orders
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/50">
            Contact Us on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}