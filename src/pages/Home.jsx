import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- උසස් ත්‍රිමාණ Tilt Card එක ---
const TiltCard = ({ children, className, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  
  // ඇලවීමේ ප්‍රමාණය (Rotation) වැඩි කළා
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className} cursor-pointer`}
    >
      <div style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}>
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
    let stars = [];
    let planets = [];
    let mouse = { x: 0, y: 0, realX: -1000, realY: -1000 };
    let isClicking = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // අභ්‍යවකාශ පසුබිම (Planets & Stars)
    class Planet {
      constructor(size, color, speed, depth) {
        this.size = size; this.color = color; this.speed = speed; this.depth = depth;
        this.reset(true);
      }
      reset(firstTime) {
        this.x = Math.random() * canvas.width;
        this.y = firstTime ? Math.random() * canvas.height : -200;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height + 200) this.reset();
        this.renderX = this.x + (mouse.x * this.depth);
        this.renderY = this.y + (mouse.y * this.depth);
      }
      draw() {
        ctx.save();
        ctx.translate(this.renderX, this.renderY);
        let grad = ctx.createRadialGradient(-this.size/3, -this.size/3, this.size/10, 0, 0, this.size);
        grad.addColorStop(0, this.color); grad.addColorStop(1, "black");
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    class Star {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.vy = Math.random() * 0.4 + 0.1;
      }
      update() {
        if (isClicking) {
          const dx = mouse.realX - this.x; const dy = mouse.realY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.x += dx / (dist * 0.1); this.y += dy / (dist * 0.1);
          if (dist < 5) this.init();
        } else {
          this.y += this.vy; if (this.y > canvas.height) this.y = 0;
        }
      }
      draw() { ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; ctx.fillRect(this.x, this.y, this.size, this.size); }
    }

    planets = [new Planet(70, "#f59e0b", 0.15, 5), new Planet(130, "#78350f", 0.08, 3)];
    for (let i = 0; i < 180; i++) stars.push(new Star());

    const animate = () => {
      ctx.fillStyle = "#020202"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      planets.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouse.realX = e.clientX; mouse.realY = e.clientY;
      mouse.x = (e.clientX - canvas.width/2) / 80;
      mouse.y = (e.clientY - canvas.height/2) / 80;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", () => isClicking = true);
    window.addEventListener("mouseup", () => isClicking = false);

    const fetchFeatured = async () => {
      const q = query(collection(db, "products"), limit(4));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchFeatured();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden select-none">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-70" />

      <div className="relative z-10 w-full">
        {/* --- HERO SECTION (FULL WIDTH) --- */}
        <section className="min-h-screen flex items-center justify-center px-6 lg:px-20 py-20">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex-1 text-center lg:text-left">
              <span className="bg-amber-500/10 border border-amber-500 text-amber-500 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 inline-block shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                PREMIUM GAMING GEAR
              </span>
              <h1 className="text-6xl md:text-[120px] font-black mb-8 tracking-tighter leading-[0.85] uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]">YOUR GAME.</span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-5 mt-10 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-amber-500 transition-all uppercase italic flex items-center justify-center gap-3 text-lg shadow-2xl">
                  SHOP NOW <ArrowRight size={24}/>
                </button>
                <button onClick={() => setPage("builder")} className="px-12 py-5 border-2 border-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase italic text-lg">
                  BUILD PC
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="flex-1 flex justify-center lg:justify-end relative">
              <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full animate-pulse"></div>
              <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-full max-w-[650px] relative z-10 drop-shadow-[0_0_100px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform duration-700" alt="hardware"/>
            </motion.div>
          </div>
        </section>

        {/* --- TRUST BADGES (FULL WIDTH) --- */}
        <div className="bg-white text-black py-14 px-6 font-black uppercase italic border-y border-white/10">
          <div className="w-full flex flex-wrap justify-around items-center gap-10 text-base md:text-xl">
            <div className="flex items-center gap-4"><Truck size={28}/> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-4"><ShieldCheck size={28}/> GENUINE WARRANTY</div>
            <div className="flex items-center gap-4"><Zap size={28}/> TECH SUPPORT</div>
          </div>
        </div>

        {/* --- FEATURED PRODUCTS --- */}
        <section className="w-full px-6 lg:px-20 py-32">
          <h2 className="text-4xl md:text-6xl font-black mb-16 italic uppercase border-l-[12px] border-amber-500 pl-8 tracking-tighter">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
            {products.map((p, i) => (
              <TiltCard key={p.id} index={i} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[40px] backdrop-blur-2xl hover:border-amber-500/50 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="aspect-square bg-black/40 rounded-[30px] mb-8 overflow-hidden border border-white/5">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={p.name} />
                </div>
                <h3 className="font-bold text-2xl mb-3 truncate uppercase italic tracking-tight">{p.name}</h3>
                <p className="text-3xl font-black mb-8 text-amber-500 italic">LKR {p.sellingPrice?.toLocaleString()}</p>
                <button onClick={() => setCart([...cart, p])} className="w-full py-5 bg-white text-black rounded-2xl font-black hover:bg-amber-500 transition-all uppercase italic text-lg">
                  ADD TO CART
                </button>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* --- CALL TO ACTION (ඔයා එවපු රූපයේ හැඩයටම) --- */}
        <section className="px-6 lg:px-20 py-24 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            className="w-full max-w-[1400px] mx-auto bg-amber-500 py-20 md:py-32 px-10 rounded-[60px] md:rounded-[100px] text-black text-center relative overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.3)]"
          >
            <div className="relative z-10">
              <h2 className="text-5xl md:text-[90px] font-black mb-12 italic uppercase leading-[0.85] tracking-tighter">
                READY TO BUILD <br className="hidden md:block"/> YOUR DREAM RIG?
              </h2>
              <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer" className="inline-block">
                <button className="bg-black text-white px-16 py-7 rounded-[24px] font-black text-xl md:text-3xl hover:scale-110 transition-all shadow-2xl uppercase italic flex items-center gap-4">
                  GET A QUOTE NOW
                </button>
              </a>
            </div>
            {/* අලංකාර Glow එක */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse"></div>
          </motion.div>
        </section>
      </div>

      {/* --- SOCIAL MENU (FLOATING) --- */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isSocialOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="flex flex-col gap-4 mb-5">
              <a href="#" className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-2xl text-white"><Facebook size={28}/></a>
              <a href="#" className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-2xl text-white"><Instagram size={28}/></a>
              <a href="https://wa.me/94742299006" className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-2xl text-white"><MessageCircle size={28}/></a>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-20 h-20 bg-amber-500 text-black rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-90 transition-all">
          {isSocialOpen ? <X size={35} /> : <Share2 size={35} />}
        </button>
      </div>
    </div>
  );
}