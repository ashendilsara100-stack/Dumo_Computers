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
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
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
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Context Menu Block
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    // 2. LIQUID FLUID EFFECT LOGIC
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let mouse = { x: null, y: null };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = Math.random() > 0.5 ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.2)";
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(mouse.x, mouse.y));
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].size <= 0.2) {
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();

    // 3. Data Fetching
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
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const addToCart = (p) => setCart([...cart, p]);

  const socials = [
    { name: 'Facebook', icon: <Facebook size={20} />, color: 'bg-[#1877F2]', link: '#' },
    { name: 'Instagram', icon: <Instagram size={20} />, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', link: '#' },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, color: 'bg-[#25D366]', link: 'https://wa.me/94742299006' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- LIQUID FLUID CANVAS BACKGROUND --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-60"
        style={{ filter: "blur(20px)" }}
      />

      {/* Static Cyber Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10">
        {/* 1. HERO SECTION */}
        <div className="relative h-[85vh] flex items-center border-b-2 border-white/10">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 animate-pulse uppercase">
                NEW ARRIVALS 2025
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium italic">
                Sri Lanka's most trusted destination for high-end gaming PC components.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic">
                  SHOP NOW <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD YOUR PC
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="hidden lg:flex justify-center">
                <motion.img 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" 
                  className="w-[500px] drop-shadow-[0_0_80px_rgba(245,158,11,0.2)]"
                />
            </motion.div>
          </div>
        </div>

        {/* 2. TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8">
            <div className="flex items-center gap-3"><Truck className="w-8 h-8"/> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-3"><ShieldCheck className="w-8 h-8"/> GENUINE WARRANTY</div>
            <div className="flex items-center gap-3"><Zap className="w-8 h-8"/> TECH SUPPORT</div>
          </div>
        </div>

        {/* 3. FEATURED PRODUCTS (3D TILT ENABLED) */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-4 tracking-tighter">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <TiltCard key={p.id} className="group">
                <div className="bg-zinc-900/40 border border-white/10 p-6 rounded-3xl backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl">
                  <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 truncate uppercase italic">{p.name}</h3>
                  <p className="text-2xl font-black mb-6 italic text-amber-500">LKR {p.price.toLocaleString()}</p>
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
            <div className="bg-amber-500 p-16 text-black text-center rounded-[50px] shadow-[0_0_100px_rgba(245,158,11,0.2)]">
               <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">READY TO BUILD YOUR DREAM RIG?</h2>
               <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer">
                  <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all uppercase italic">GET A QUOTE NOW</button>
               </a>
            </div>
        </div>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-8 right-8 z-[999] flex flex-col items-center gap-4">
        <AnimatePresence>
          {isSocialOpen && (
            <div className="flex flex-col gap-3 mb-2">
              {socials.map((social) => (
                <motion.a key={social.name} href={social.link} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${social.color} text-white p-4 rounded-2xl shadow-xl`}>
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