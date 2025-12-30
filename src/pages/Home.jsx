import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- 3D TILT CARD COMPONENT WITH REPEATABLE ANIMATION ---
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
      // හැමතිස්සෙම පෙනෙන විට Animation එක වැඩ කිරීමට viewport එකේ once: false කළා
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: false, amount: 0.2 }}
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let streams = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // --- WATERFALL LIQUID LOGIC ---
    class Stream {
      constructor(x) {
        this.reset(x);
      }

      reset(x) {
        this.x = x || Math.random() * canvas.width;
        this.y = -Math.random() * 500;
        this.width = Math.random() * 30 + 20; // උකු බව සඳහා පළල වැඩි කළා
        this.speed = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? "#f59e0b" : "#ffffff";
        this.length = Math.random() * 300 + 200;
      }

      update() {
        this.y += this.speed;
        
        // Product Cards සමඟ ගැටීම (Collision)
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (this.x + this.width/2 > rect.left && this.x - this.width/2 < rect.right &&
              this.y > rect.top && this.y < rect.top + 10) {
            this.y -= this.speed * 0.8; // කාඩ් එක උඩදී වේගය අඩු වීම (Dripping effect)
            this.width += 0.1;
          }
        });

        if (this.y > canvas.height + this.length) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // දියඇල්ලක් වගේ දිගටි හැඩයක් (Rounded Capsule)
        ctx.roundRect(this.x, this.y, this.width, this.length, 20);
        ctx.fill();
      }
    }

    // දියඇලි ධාරා ප්‍රමාණය
    for (let i = 0; i < 20; i++) {
      streams.push(new Stream());
    }

    const animate = () => {
      // මෙතන contrast එකත් එක්ක blur එක පාවිච්චි කළාම waterfall එක සිනිඳු වෙනවා
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      streams.forEach(s => {
        s.update();
        s.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), limit(4));
        const querySnapshot = await getDocs(q);
        setProducts(querySnapshot.docs.map(doc => ({ 
          id: doc.id, ...doc.data(), price: doc.data().sellingPrice || 0 
        })));
      } catch (e) { console.error(e); }
    };
    fetchFeatured();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- WATERFALL METABALL CANVAS --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{ filter: "blur(15px) contrast(30)" }}
      />

      <div className="relative z-10">
        {/* HERO */}
        <div className="relative h-[85vh] flex items-center border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 uppercase tracking-widest">
                PREMIUM GAMING GEAR
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all uppercase italic">
                  SHOP NOW
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border-2 border-white font-black rounded-xl hover:bg-white/10 transition-all uppercase italic">
                  BUILD PC
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:flex justify-center">
                <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-[500px] drop-shadow-[0_0_80px_rgba(245,158,11,0.2)]" />
            </motion.div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic relative z-20">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8 text-sm md:text-base">
            <div className="flex items-center gap-3"><Truck /> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-3"><ShieldCheck /> GENUINE WARRANTY</div>
            <div className="flex items-center gap-3"><Zap /> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS (REPEATING ANIMATION) */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-4">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, index) => (
              <TiltCard key={p.id} id={`card-${p.id}`} index={index}>
                <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md hover:border-amber-500/50 transition-all shadow-2xl relative group">
                  <div className="aspect-square bg-black rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 truncate uppercase italic">{p.name}</h3>
                  <p className="text-2xl font-black mb-6 italic text-amber-500">LKR {p.price.toLocaleString()}</p>
                  <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic">
                    ADD TO CART
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: false }}
          className="px-6 mb-20"
        >
            <div className="bg-amber-500 p-16 text-black text-center rounded-[50px] shadow-2xl">
               <h2 className="text-5xl font-black mb-6 italic uppercase">READY TO BUILD?</h2>
               <button className="bg-black text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all">GET QUOTE</button>
            </div>
        </motion.div>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-8 right-8 z-[999]">
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-16 h-16 rounded-[24px] flex items-center justify-center bg-amber-500 text-black shadow-2xl">
          {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
        </button>
      </div>
    </div>
  );
}