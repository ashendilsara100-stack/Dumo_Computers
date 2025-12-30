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
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- ADVANCED GAMING BACKGROUND ANIMATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* 1. Animated Cyber Grid (Moving Upwards) */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 0%, #111 100%), 
                              linear-gradient(to right, #333 1px, transparent 1px), 
                              linear-gradient(to bottom, #333 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 50px 50px, 50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />

        {/* 2. Floating Neon Dust (Particles) */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500 rounded-full"
            initial={{ 
              x: Math.random() * 1920, 
              y: Math.random() * 1080, 
              opacity: Math.random() 
            }}
            animate={{ 
              y: [null, Math.random() * -1000],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}

        {/* 3. Deep Ambient Glows */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-amber-600/20 rounded-full blur-[160px]" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-[10%] -right-[10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px]" 
        />
      </div>

      {/* CSS Animation for Grid */}
      <style>{`
        @keyframes grid-move {
          0% { background-position: 0 0, 0 0, 0 0; }
          100% { background-position: 0 0, 0 1000px, 0 1000px; }
        }
      `}</style>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <div className="relative h-[85vh] flex items-center overflow-hidden border-b-2 border-white/10">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
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
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD YOUR PC
                </button>
              </div>
            </motion.div>

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
                className="group relative bg-zinc-900/40 border border-white/10 p-6 rounded-3xl hover:bg-zinc-800/60 transition-all backdrop-blur-xl border-b-4 hover:border-amber-500 shadow-xl"
              >
                <div className="aspect-square bg-black/60 rounded-2xl flex items-center justify-center mb-6 border border-white/5 overflow-hidden">
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
          className="bg-amber-500 py-20 px-6 text-black text-center mx-6 mb-12 rounded-[50px] relative overflow-hidden group shadow-[0_0_50px_rgba(245,158,11,0.3)]"
        >
           <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter relative z-10">READY TO BUILD YOUR DREAM RIG?</h2>
           <p className="text-xl font-bold mb-8 max-w-2xl mx-auto opacity-80 uppercase italic relative z-10">Join the elite rank of gamers with our custom builds.</p>
           <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer" className="relative z-10">
              <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all uppercase italic shadow-2xl">GET A QUOTE NOW</button>
           </a>
           {/* CTA Background Glow */}
           <div className="absolute inset-0 bg-white/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
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
                  className={`${social.color} text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center group relative border border-white/10`}
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
          className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-colors duration-500 border-2 ${isSocialOpen ? 'bg-white text-black border-transparent' : 'bg-amber-500 text-black border-black/10'}`}
        >
          <motion.div animate={{ rotate: isSocialOpen ? 180 : 0 }}>
            {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
          </motion.div>
        </motion.button>
      </div>

    </div>
  );
}