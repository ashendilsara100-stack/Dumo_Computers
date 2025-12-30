import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Lock, Trash2, LogOut, RefreshCw, 
  AlertTriangle, Image, CheckCircle2, Zap, TrendingUp, ShoppingBag
} from 'lucide-react';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [products, setProducts] = useState([
    { id: 1, name: "AMD Ryzen 9 7950X", category: "CPU", price: 185000, stock: 8, image: "https://via.placeholder.com/150" },
    { id: 2, name: "NVIDIA RTX 4080 Super", category: "GPU", price: 425000, stock: 3, image: "https://via.placeholder.com/150" },
    { id: 3, name: "Corsair Dominator 64GB DDR5", category: "RAM", price: 125000, stock: 15, image: "https://via.placeholder.com/150" },
  ]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("CPU");
  const [image, setImage] = useState("");

  const ADMIN_PASSWORD = "dumo_admin_2025"; 

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddProduct = () => {
    if (!name || !price || !stock) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setFormLoading(true);
    setTimeout(() => {
      const newProduct = {
        id: Date.now(),
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        image: image || "https://via.placeholder.com/150"
      };
      setProducts([newProduct, ...products]);
      setName(""); setPrice(""); setStock(""); setImage("");
      showToast("Product added successfully!");
      setFormLoading(false);
    }, 1000);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setProducts(products.filter(p => p.id !== id));
      showToast("Product deleted successfully!");
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      showToast("Invalid Admin Password", "error");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white relative">
        {toast.show && (
          <div className={`fixed top-10 flex items-center gap-2 px-6 py-3 rounded-2xl font-black z-50 animate-bounce border-2 ${toast.type === 'error' ? 'bg-white text-black border-red-500' : 'bg-white text-black border-green-500'}`}>
            {toast.message}
          </div>
        )}

        <div className="bg-black border-2 border-white p-12 rounded-3xl w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-8 text-white bg-white/10 w-24 h-24 items-center rounded-full mx-auto border-2 border-white">
            <Lock size={48} />
          </div>
          <h2 className="text-4xl font-black text-center mb-10 uppercase tracking-wider">
            DUMO ADMIN
          </h2>
          <div className="space-y-6">
            <input 
              type="password" 
              placeholder="ENTER ACCESS KEY"
              className="w-full bg-black border-2 border-white p-5 rounded-2xl outline-none text-center font-bold text-xl focus:border-amber-500 transition-all placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-black py-5 rounded-2xl font-black hover:bg-amber-500 hover:scale-105 transition-all uppercase shadow-xl"
            >
              Unlock Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStock = products.filter(p => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-black text-white flex relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-10 right-10 flex items-center gap-3 px-8 py-4 rounded-2xl font-black z-[100] shadow-2xl animate-bounce border-2 ${toast.type === 'error' ? 'bg-white text-black border-red-500' : 'bg-white text-black border-green-500'}`}>
          {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
          {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="w-80 border-r-2 border-white p-10 flex flex-col">
        <div className="mb-12">
          <Package className="w-12 h-12 text-white mb-4" />
          <h1 className="text-3xl font-black">DUMO</h1>
          <p className="text-gray-500 font-bold text-sm">ADMIN CONSOLE</p>
        </div>

        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all border-2 ${
              activeTab === 'dashboard' 
                ? 'bg-white text-black border-white' 
                : 'text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <LayoutDashboard size={22} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`w-full flex items-center gap-4 p-5 rounded-2xl font-black transition-all border-2 ${
              activeTab === 'inventory' 
                ? 'bg-white text-black border-white' 
                : 'text-white border-white hover:bg-white hover:text-black'
            }`}
          >
            <Package size={22} /> Inventory
          </button>
        </nav>

        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="flex items-center gap-4 p-5 text-white font-black hover:bg-white hover:text-black rounded-2xl transition-all border-2 border-white"
        >
          <LogOut size={22} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-12 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-10">
            <div className="border-b-2 border-white pb-6">
              <h1 className="text-7xl font-black uppercase tracking-tight">DASHBOARD</h1>
              <p className="text-gray-500 font-bold text-lg mt-2">System Overview & Analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black border-2 border-white p-8 rounded-3xl hover:bg-white hover:text-black hover:border-amber-500 transition-all group">
                <Package className="w-10 h-10 mb-4 group-hover:text-black" />
                <p className="text-gray-500 group-hover:text-gray-700 font-black text-sm uppercase">Total Products</p>
                <p className="text-5xl font-black mt-2">{products.length}</p>
              </div>

              <div className="bg-black border-2 border-white p-8 rounded-3xl hover:bg-white hover:text-black hover:border-amber-500 transition-all group">
                <TrendingUp className="w-10 h-10 mb-4 group-hover:text-black" />
                <p className="text-gray-500 group-hover:text-gray-700 font-black text-sm uppercase">Inventory Value</p>
                <p className="text-5xl font-black mt-2">LKR {(totalValue / 1000000).toFixed(1)}M</p>
              </div>

              <div className="bg-black border-2 border-white p-8 rounded-3xl hover:bg-white hover:text-black hover:border-red-500 transition-all group">
                <AlertTriangle className="w-10 h-10 mb-4 text-red-500 group-hover:text-red-600" />
                <p className="text-gray-500 group-hover:text-gray-700 font-black text-sm uppercase">Low Stock Alert</p>
                <p className="text-5xl font-black mt-2 text-red-500">{lowStock}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="border-t-2 border-white pt-10">
              <h2 className="text-4xl font-black mb-6 uppercase">Recent Activity</h2>
              <div className="space-y-4">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="bg-black border-2 border-white p-6 rounded-2xl hover:bg-white hover:text-black transition-all group flex items-center gap-6">
                    <img src={p.image} className="w-16 h-16 rounded-xl border-2 border-white" alt={p.name} />
                    <div className="flex-1">
                      <p className="font-black text-lg">{p.name}</p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-700 font-bold">{p.category}</p>
                    </div>
                    <p className="font-black text-xl">LKR {p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="border-b-2 border-white pb-6">
              <h1 className="text-7xl font-black uppercase tracking-tight">INVENTORY</h1>
              <p className="text-gray-500 font-bold text-lg mt-2">Manage Products & Stock</p>
            </div>

            {/* PRODUCT FORM */}
            <div className="bg-black border-2 border-white p-8 rounded-3xl space-y-6">
              <h3 className="text-2xl font-black uppercase mb-6">Add New Product</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-2 block">Product Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full bg-black border-2 border-white p-4 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="RTX 4080 Super" 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-2 block">Price (LKR)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full bg-black border-2 border-white p-4 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-2 block">Stock Qty</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    className="w-full bg-black border-2 border-white p-4 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-2 block">Category</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="w-full bg-black border-2 border-white p-4 rounded-2xl outline-none focus:border-amber-500 font-bold uppercase transition-all"
                  >
                    {['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooling'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 mb-2 block flex items-center gap-2">
                    <Image size={14} /> Image URL (Optional)
                  </label>
                  <input 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    className="w-full bg-black border-2 border-white p-4 rounded-2xl outline-none focus:border-amber-500 font-bold transition-all" 
                    placeholder="https://..." 
                  />
                </div>
                <button 
                  disabled={formLoading} 
                  onClick={handleAddProduct}
                  className="bg-white text-black h-[60px] px-12 rounded-2xl font-black hover:bg-amber-500 hover:scale-105 transition-all flex items-center justify-center uppercase border-2 border-black disabled:opacity-50"
                >
                  {formLoading ? <RefreshCw className="animate-spin" /> : "Add Product"}
                </button>
              </div>
            </div>

            {/* INVENTORY TABLE */}
            <div className="bg-black border-2 border-white rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-black">
                    <tr>
                      <th className="p-6 font-black uppercase text-sm">Image</th>
                      <th className="p-6 font-black uppercase text-sm">Product</th>
                      <th className="p-6 font-black uppercase text-sm">Price</th>
                      <th className="p-6 font-black uppercase text-sm">Stock</th>
                      <th className="p-6 font-black uppercase text-sm text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-white">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-white hover:text-black transition-all group">
                        <td className="p-6">
                          <img src={product.image} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-white" />
                        </td>
                        <td className="p-6">
                          <p className="font-black text-lg">{product.name}</p>
                          <span className="text-xs text-gray-500 group-hover:text-gray-700 font-bold uppercase">{product.category}</span>
                        </td>
                        <td className="p-6 font-black text-xl group-hover:text-amber-600">
                          LKR {product.price.toLocaleString()}
                        </td>
                        <td className="p-6 font-black">
                          <div className={`flex items-center gap-2 ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                            <span className={`w-3 h-3 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                            {product.stock} Units
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <button 
                            onClick={() => handleDelete(product.id)} 
                            className="p-4 bg-black group-hover:bg-red-500 text-white rounded-2xl hover:scale-110 transition-all border-2 border-white"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;