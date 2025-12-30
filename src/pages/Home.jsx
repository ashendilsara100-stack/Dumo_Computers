import { useEffect, useState } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
// Animation සඳහා framer-motion පාවිච්චි කර ඇත
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  // --- BACKGROUND INTERACTION LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mouse move එක smooth කිරීමට spring config එකක්
  const springConfig = { damping: 25, stiffness: 150 };
  const shadowX = useSpring(mouseX, springConfig);
  const shadowY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMove = (e) => {
      // Desktop mouse position
      if (e.clientX) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      } 
      // Mobile touch position
      else if (e.touches && e.touches[0]) {
        mouseX.set(e.touches[0].clientX);
        mouseY.set(e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

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

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
    };
  }, [mouseX, mouseY]);

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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* --- NEW: GAMING BACKGROUND ANIMATIONS --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Mouse/Touch Follower Glow */}
        <motion.div 
          style={{ x: shadowX, y: shadowY, translateX: '-50%', translateY: '-50%' }}
          className="absolute w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]"
        />
        
        {/* Animated Cyber Grid Layer */}
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{ 
            backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <div className="relative h-[85vh] flex items-center overflow-hidden border-b-2 border-white/10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 text-center lg:text-left">
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse uppercase">
                NEW ARRIVALS 2025
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium">
                Sri Lanka's most trusted destination for high-end gaming PC components and custom builds.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic">
                  SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD YOUR PC
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: IMAGE WITH FLOATING ANIMATION */}
            <div className="hidden lg:flex justify-center relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <motion.div 
                  animate={{ y: [0, -25, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 flex justify-center items-center"
                >
                  <img 
                    src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" 
                    alt="High End PC" 
                    className="w-[500px] h-auto drop-shadow-[0_35px_35px_rgba(245,158,11,0.4)]"
                  />
                  <div className="absolute -top-4 -right-4 bg-white text-black p-6 rounded-2xl font-black shadow-2xl rotate-12 uppercase italic">
                      Premium Hardware
                  </div>
                </motion.div>
            </div>
          </div>
        </div>

        {/* 2. TRUST BADGES SECTION */}
        <div className="bg-white text-black py-10 px-6 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8">
            <div className="flex items-center gap-4">
              <Truck className="w-10 h-10" />
              <div><p className="font-black leading-none uppercase">ISLANDWIDE DELIVERY</p><p className="text-sm font-bold opacity-70 italic">Safe & Secure Shipping</p></div>
            </div>
            <div className="flex items-center gap-4 border-x-0 md:border-x border-black/10 px-0 md:px-12">
              <ShieldCheck className="w-10 h-10" />
              <div><p className="font-black leading-none uppercase">GENUINE WARRANTY</p><p className="text-sm font-bold opacity-70 italic">Official Brand Warranty</p></div>
            </div>
            <div className="flex items-center gap-4">
              <Zap className="w-10 h-10" />
              <div><p className="font-black leading-none uppercase">TECH SUPPORT</p><p className="text-sm font-bold opacity-70 italic">Expert Advice Anytime</p></div>
            </div>
          </div>
        </div>

        {/* 3. FEATURED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter">FEATURED HARDWARE</h2>
              <div className="w-20 h-2 bg-amber-500"></div>
            </div>
            <button onClick={() => setPage("shop")} className="hidden md:flex items-center gap-2 text-amber-500 font-black hover:underline uppercase italic text-sm">
              VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <div key={p.id} className="group relative bg-zinc-900/40 border border-white/10 p-6 rounded-3xl hover:bg-zinc-800/60 backdrop-blur-md transition-all">
                <div className="aspect-square bg-black/50 rounded-2xl flex items-center justify-center mb-6 border border-white/5 overflow-hidden">
                  <img src={p.image || "https://via.placeholder.com/150?text=DUMO"} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-amber-500 transition-colors truncate uppercase italic">{p.name}</h3>
                <p className="text-2xl font-black mb-6 tracking-tight italic">LKR {p.price.toLocaleString()}</p>
                <button onClick={() => addToCart(p)} className="w-full py-4 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-amber-500 active:scale-95 transition-all uppercase italic">
                  <ShoppingCart className="w-5 h-5" /> ADD
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CALL TO ACTION */}
        <div className="bg-amber-500 py-20 px-6 text-black text-center mx-6 mb-12 rounded-[50px] relative z-10 overflow-hidden">
           <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">READY TO BUILD YOUR DREAM RIG?</h2>
           <p className="text-xl font-bold mb-8 max-w-2xl mx-auto opacity-80 uppercase italic">Free professional advice and setup support.</p>
           <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer">
              <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all uppercase italic shadow-2xl">GET A QUOTE NOW</button>
           </a>
        </div>
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
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1, x: -5 }}
                  className={`${social.color} text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center group relative`}
                >
                  {social.icon}
                  <span className="absolute right-16 bg-white text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase italic opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-black/5 whitespace-nowrap">
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