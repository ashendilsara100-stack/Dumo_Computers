import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- 3D TILT CARD COMPONENT WITH LOADING ANIMATION ---
const TiltCard = ({ children, className, id, index }) => {
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
      id={id}
      // --- RESTORED LOADING ANIMATION ---
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true }}
      // ----------------------------------
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className} product-card`}
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
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // --- IMPROVED VISCOUS LIQUID LOGIC ---
    class Drop {
      constructor(x, y, isMouse = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 15; // ලොකු බින්දු (Liquid blobs)
        this.speedY = isMouse ? Math.random() * 1.5 + 0.5 : Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.4 ? "#f59e0b" : "#ffffff";
        this.isStuck = false;
      }

      update() {
        if (!this.isStuck) {
          this.y += this.speedY;
          this.x += this.speedX;
        }

        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (this.x > rect.left && this.x < rect.right && this.y > rect.top && this.y < rect.top + 15) {
            this.isStuck = true;
            this.size += 0.1; // Card එක මත වැදී පැතිරෙන ස්වභාවය
            setTimeout(() => { this.isStuck = false; }, 3000);
          }
        });

        if (this.y > canvas.height + 50) {
          this.y = -50;
          this.x = Math.random() * canvas.width;
          this.size = Math.random() * 20 + 15;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // Oval හැඩය - ඇත්තටම වැක්කෙරෙන දියරයක් වගේ පේන්න
        ctx.ellipse(this.x, this.y, this.size * 0.8, this.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // දියර බින්දු ප්‍රමාණය
    for (let i = 0; i < 30; i++) {
      drops.push(new Drop(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    const handleMouseMove = (e) => {
      if (Math.random() > 0.85) {
        drops.push(new Drop(e.clientX, e.clientY, true));
        if (drops.length > 60) drops.shift();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Motion trail එකක් ලැබීමට
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach(drop => {
        drop.update();
        drop.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

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
      } catch (error) { console.error(error); }
    };
    fetchFeatured();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- LIQUID CANVAS WITH METABALL FILTER --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
        style={{ filter: "blur(12px) contrast(25)" }} // බින්දු එකට ඇලී දියරයක් වීමට මෙය වැදගත්
      />

      <div className="relative z-10">
        {/* HERO SECTION */}
        <div className="relative h-[85vh] flex items-center border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 uppercase">
                PREMIUM HARDWARE 2025
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-lg font-medium italic">
                Sri Lanka's most trusted destination for high-end gaming components.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all flex items-center gap-2 group uppercase italic">
                  SHOP NOW <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD YOUR PC
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-center">
                <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-[500px] drop-shadow-[0_0_80px_rgba(245,158,11,0.2)]" />
            </motion.div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic relative z-20">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8">
            <div className="flex items-center gap-3"><Truck /> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-3"><ShieldCheck /> GENUINE WARRANTY</div>
            <div className="flex items-center gap-3"><Zap /> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS (ANIMATED LOADING) */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-4">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, index) => (
              <TiltCard key={p.id} id={`card-${p.id}`} index={index}>
                <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-500/50 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 truncate uppercase italic">{p.name}</h3>
                  <p className="text-2xl font-black mb-6 italic text-amber-500">LKR {p.price.toLocaleString()}</p>
                  <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic">
                    ADD TO CART
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* CALL TO ACTION */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="px-6 mb-20">
            <div className="bg-amber-500 p-16 text-black text-center rounded-[50px] shadow-2xl">
               <h2 className="text-5xl font-black mb-6 italic uppercase tracking-tighter">READY TO BUILD YOUR DREAM RIG?</h2>
               <a href="https://wa.me/94742299006" target="_blank" rel="noopener noreferrer">
                  <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all uppercase italic">GET A QUOTE NOW</button>
               </a>
            </div>
        </motion.div>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-8 right-8 z-[999]">
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-amber-500 text-black shadow-2xl transition-all">
          {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
        </button>
      </div>

    </div>
  );
}