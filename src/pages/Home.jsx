import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
};

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  
  // Mouse Trail State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("mousemove", handleMouseMove);

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
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const addToCart = (p) => setCart([...cart, p]);

  const socials = [
    { name: 'Facebook', icon: <Facebook size={20} />, color: 'bg-[#1877F2]', link: '#' },
    { name: 'TikTok', icon: <span className="font-black text-[10px]">TT</span>, color: 'bg-black border border-white/20', link: '#' },
    { name: 'Instagram', icon: <Instagram size={20} />, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', link: '#' },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'bg-[#25D366]', link: 'https://wa.me/94742299006' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- IDEA 1: INTERACTIVE MOUSE GLOW BACKGROUND --- */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: useTransform(
            [springX, springY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(245, 158, 11, 0.15), transparent 80%)`
          )
        }}
      />

      {/* Static Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <div className="relative h-[85vh] flex items-center overflow-hidden border-b-2 border-white/10">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse uppercase">
                NEW ARRIVALS 2025
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium">
                Sri Lanka's most trusted destination for high-end gaming PC components.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic">
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
              className="hidden lg:flex justify-center relative"
            >
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <img 
                    src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" 
                    className="w-[500px] h-auto drop-shadow-[0_0_50px_rgba(245,158,11,0.3)] pointer-events-none"
                  />
                </motion.div>
            </motion.div>
          </div>
        </div>

        {/* 2. TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 relative">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between gap-8 font-black uppercase italic">
            <div className="flex items-center gap-4"><Truck className="w-8 h-8"/> <span>Islandwide Delivery</span></div>
            <div className="flex items-center gap-4"><ShieldCheck className="w-8 h-8"/> <span>Genuine Warranty</span></div>
            <div className="flex items-center gap-4"><Zap className="w-8 h-8"/> <span>Tech Support</span></div>
          </div>
        </div>

        {/* 3. FEATURED PRODUCTS WITH 3D TILT */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-black mb-12 italic uppercase tracking-tighter border-l-8 border-amber-500 pl-4">FEATURED HARDWARE</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, i) => (
              <TiltCard key={p.id} className="group relative">
                <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-500 transition-colors">
                  <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 truncate uppercase italic">{p.name}</h3>
                  <p className="text-2xl font-black mb-6 italic">LKR {p.price.toLocaleString()}</p>
                  <button onClick={() => addToCart(p)} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic">
                    ADD TO CART
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* 4. CALL TO ACTION */}
        <div className="px-6 mb-20">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-amber-500 p-16 text-black text-center rounded-[40px] shadow-[0_0_50px_rgba(245,158,11,0.2)]"
            >
               <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">READY TO BUILD YOUR DREAM RIG?</h2>
               <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer">
                  <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-zinc-900 transition-all uppercase italic">GET A QUOTE NOW</button>
               </a>
            </motion.div>
        </div>
      </div>

      {/* SOCIAL MENU (Remains same) */}
      <div className="fixed bottom-8 right-8 z-[999] flex flex-col items-center gap-4">
        <AnimatePresence>
          {isSocialOpen && (
            <div className="flex flex-col gap-3 mb-2">
              {socials.map((social) => (
                <motion.a key={social.name} href={social.link} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`${social.color} text-white p-4 rounded-2xl shadow-xl flex items-center justify-center`}>
                  {social.icon}
                </motion.a>
              ))}
            </div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all ${isSocialOpen ? 'bg-white text-black' : 'bg-amber-500 text-black'}`}>
          {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
        </button>
      </div>

    </div>
  );
}