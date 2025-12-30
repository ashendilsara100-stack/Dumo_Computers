import { useState, useEffect } from "react";
import { db, storage } from "../firebase/config"; 
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { PlusCircle, Trash2, Package, Tag, Layers, Image as ImageIcon, Briefcase } from "lucide-react";

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [loading, setLoading] = useState(false);

  // අලුත් Product එකක් සඳහා State එක
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "", // Intel, AMD, Nvidia, etc.
    costPrice: "",
    sellingPrice: "",
    stock: "",
    image: ""
  });

  // 1. Fetch Products & Categories (Real-time)
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProducts(); unsubCats(); };
  }, []);

  // 2. අලුත් Category එකක් ඇඩ් කිරීම
  const handleAddCategory = async () => {
    if (!newCat) return;
    await addDoc(collection(db, "categories"), { name: newCat });
    setNewCat("");
  };

  // 3. Product එකක් ඇඩ් කිරීම
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        ...formData,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock),
        createdAt: new Date()
      });
      setFormData({ name: "", category: "", brand: "", costPrice: "", sellingPrice: "", stock: "", image: "" });
      alert("Product Added Successfully!");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // 4. අයිතමයක් මකා දැමීම
  const deleteItem = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      await deleteDoc(doc(db, type === 'product' ? "products" : "categories", id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: Forms */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* A. ADD CATEGORY FORM */}
          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase">
              <Layers className="text-amber-500" /> Manage Categories
            </h2>
            <div className="flex gap-2">
              <input 
                type="text" placeholder="New Category Name" 
                value={newCat} onChange={(e) => setNewCat(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500 font-bold"
              />
              <button onClick={handleAddCategory} className="bg-white text-black p-3 rounded-xl hover:bg-amber-500 transition-all">
                <PlusCircle />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat.id} className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-white/5">
                  {cat.name} <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => deleteItem(cat.id, 'category')} />
                </span>
              ))}
            </div>
          </div>

          {/* B. ADD PRODUCT FORM */}
          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 italic uppercase">
              <Package className="text-amber-500" /> Add New Product
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input type="text" placeholder="Product Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
              
              <div className="grid grid-cols-2 gap-4">
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500 uppercase font-bold text-xs">
                  <option value="">Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
                <input type="text" placeholder="Brand (Intel/AMD)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Cost Price" required value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
                <input type="number" placeholder="Selling Price" required value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} className="bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
              </div>

              <input type="number" placeholder="Stock Quantity" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
              <input type="text" placeholder="Image URL (Direct link)" required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-amber-500" />
              
              <button disabled={loading} className="w-full bg-amber-500 text-black py-4 rounded-xl font-black uppercase italic hover:bg-white transition-all">
                {loading ? "Uploading..." : "Publish Product"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Inventory List */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 rounded-[40px] border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-black italic uppercase">Inventory List ({products.length})</h2>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <span>Value: LKR {products.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-xs font-black uppercase text-zinc-500">
                  <tr>
                    <th className="p-6">Product</th>
                    <th className="p-6">Brand</th>
                    <th className="p-6">Stock</th>
                    <th className="p-6 text-right">Selling Price</th>
                    <th className="p-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div>
                            <p className="font-bold uppercase italic text-sm">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6"><span className="text-xs font-black italic uppercase text-amber-500">{p.brand || 'N/A'}</span></td>
                      <td className="p-6 font-bold">{p.stock}</td>
                      <td className="p-6 text-right font-black italic text-lg">LKR {p.sellingPrice?.toLocaleString()}</td>
                      <td className="p-6 text-center">
                        <button onClick={() => deleteItem(p.id, 'product')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}