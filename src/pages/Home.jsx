import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ShoppingCart, Search, Package, Loader2 } from "lucide-react";

export default function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(items);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white italic font-black uppercase tracking-widest">
      <Loader2 className="animate-spin mr-2" /> Loading Shop...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black italic mb-12 uppercase tracking-tighter">Inventory</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="group bg-zinc-900/40 border border-white/5 p-5 rounded-[35px] hover:bg-zinc-800/50 transition-all">
              
              {/* --- පින්තූරය පෙන්වන කොටස --- */}
              <div className="aspect-square bg-black rounded-[25px] overflow-hidden mb-6 border border-white/5">
                <img 
                  src={p.image || "https://via.placeholder.com/300?text=No+Image"} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Invalid+URL"; }} // URL එක වැඩ නොකරයි නම්
                />
              </div>
              {/* --------------------------- */}

              <div className="space-y-2 mb-6">
                <span className="text-[10px] font-black text-amber-500 uppercase">{p.category}</span>
                <h3 className="text-xl font-black italic uppercase leading-tight">{p.name}</h3>
                <p className="text-2xl font-black tracking-tighter text-white">LKR {p.sellingPrice?.toLocaleString()}</p>
              </div>

              <button 
                onClick={() => addToCart(p)}
                className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-amber-500 transition-all flex items-center justify-center gap-2 uppercase italic"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}