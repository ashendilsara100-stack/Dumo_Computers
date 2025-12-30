import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  useEffect(() => {
    // 1. Right Click Block කිරීම
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), limit(4));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().sellingPrice || 0 
        }));
        setProducts(items);
      } catch (error) {
        console.error("Firebase Fetch Error:", error);
      }
    };
    fetchFeatured();

    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const socials = [
    { name: 'Facebook', icon: <Facebook size={20} />, color: 'bg-[#1877F2]', link: 'https://facebook.com/yourpage' },
    { name: 'TikTok', icon: <span className="font-black text-[10px]">TT</span>, color: 'bg-black border border-white/20', link: 'https://tiktok.com/@yourprofile' },
    { name: 'Instagram', icon: <Instagram size={20} />, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', link: 'https://instagram.com/yourprofile' },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'bg-[#25D366]', link: 'https://wa.me/94742299006' },
  ];

  return (
    // select-none මගින් text/images select කිරීම block කරයි
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- PREMIUM BACKGROUND ANIMATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* පාවෙන ලොකු Glows - මේවා මෘදුව එහා මෙහා යයි */}
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-20, 20, -20], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [20, -20, 20], y: [20, -20, 20], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" 
        />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <div className="relative h-[85vh] flex items-center overflow-hidden border-b-2 border-white/10">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* TEXT REVEAL ANIMATION */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="z-10 text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse uppercase">
                NEW ARRIVALS 2025
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium">
                Sri Lanka's most trusted destination for high-end gaming PC components and custom builds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic shadow-2xl">
                  SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD YOUR PC
                </button>
              </div>
            </motion.div>

            {/* PC IMAGE WITH SMOOTH FLOAT */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="hidden lg:flex justify-center relative"
            >
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <motion.div 
                  animate={{ y: [0, -30, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <img 
                    src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" 
                    alt="High End PC" 
                    className="w-[500px] h-auto drop-shadow-[0_35px_35px_rgba(245,158,11,0.4)] pointer-events-none"
                  />
                  <div className="absolute -top-4 -right-4 bg-white text-black p-6 rounded-2xl font-black shadow-2xl rotate-12 uppercase italic">
                      Premium Hardware
                  </div>
                </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 2. TRUST BADGES SECTION */}
        <div className="bg-white text-black py-10 px-6 relative">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8">
            {[
              { icon: <Truck className="w-10 h-10" />, title: "ISLANDWIDE DELIVERY", desc: "Safe & Secure Shipping" },
              { icon: <ShieldCheck className="w-10 h-10" />, title: "GENUINE WARRANTY", desc: "Official Brand Warranty" },
              { icon: <Zap className="w-10 h-10" />, title: "TECH SUPPORT", desc: "Expert Advice Anytime" }
            ].map((badge, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4"
              >
                {badge.icon}
                <div><p className="font-black leading-none uppercase">{badge.title}</p><p className="text-sm font-bold opacity-70 italic">{badge.desc}</p></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. FEATURED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="flex justify-between items-end mb-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}>
              <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter">FEATURED HARDWARE</h2>
              <div className="w-20 h-2 bg-amber-500"></div>
            </motion.div>
            <button onClick={() => setPage("shop")} className="hidden md:flex items-center gap-2 text-amber-500 font-black hover:underline uppercase italic text-sm">
              VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, i) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-zinc-900/50 border border-white/10 p-6 rounded-3xl hover:bg-zinc-800 transition-all backdrop-blur-md"
              >
                <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 border border-white/5 overflow-hidden">
                  <img src={p.image || "https://via.placeholder.com/150?text=DUMO"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100 pointer-events-none" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-amber-500 transition-colors truncate uppercase italic">{p.name}</h3>
                <p className="text-2xl font-black mb-6 tracking-tight italic">LKR {p.price.toLocaleString()}</p>
                <button onClick={() => addToCart(p)} className="w-full py-4 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 active:scale-95 transition-all uppercase italic">
                  <ShoppingCart className="w-5 h-5" /> ADD
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 4. CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-amber-500 py-20 px-6 text-black text-center mx-6 mb-12 rounded-[50px] relative overflow-hidden"
        >
           <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">READY TO BUILD YOUR DREAM RIG?</h2>
           <p className="text-xl font-bold mb-8 max-w-2xl mx-auto opacity-80 uppercase italic">Join the elite rank of gamers with our custom builds.</p>
           <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer">
              <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all uppercase italic shadow-2xl">GET A QUOTE NOW</button>
           </a>
        </motion.div>
      </div>

      {/* --- FLOATING SOCIAL MENU --- */}
      <div className="fixed bottom-8 right-8 z-[999] flex flex-col items-center gap-4">
        <AnimatePresence>
          {isSocialOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              className="flex flex-col gap-3 mb-2"
            >
              {socials.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.link}
                  target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, x: -5 }}
                  className={`${social.color} text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center group relative`}
                >
                  {social.icon}
                  <span className="absolute right-16 bg-white text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase italic opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl whitespace-nowrap">
                    {social.name}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsSocialOpen(!isSocialOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-colors duration-500 ${isSocialOpen ? 'bg-white text-black' : 'bg-amber-500 text-black'}`}
        >
          <motion.div animate={{ rotate: isSocialOpen ? 180 : 0 }}>
            {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
          </motion.div>
        </motion.button>
      </div>

    </div>
  );
}