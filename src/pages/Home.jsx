import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const TiltCard = ({ children, className, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className} cursor-pointer group`}
    >
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>
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
        this.vy = Math.random() * 0.3 + 0.1;
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
      draw() { ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; ctx.fillRect(this.x, this.y, this.size, this.size); }
    }

    planets = [new Planet(60, "#f59e0b", 0.1, 5), new Planet(110, "#78350f", 0.05, 3)];
    for (let i = 0; i < 150; i++) stars.push(new Star());

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

    const fetchProducts = async () => {
      const q = query(collection(db, "products"), limit(4));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden select-none font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex items-center px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 inline-block shadow-lg">
                PREMIUM GAMING GEAR
              </span>
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">
                LEVEL UP <br /> <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 italic max-w-lg">Sri Lanka's elite destination for high-end hardware.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setPage("shop")} className="px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all uppercase italic flex items-center justify-center gap-2 text-base">
                  SHOP NOW <ArrowRight size={20}/>
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-4 border-2 border-white/20 font-black rounded-xl hover:bg-white/10 transition-all uppercase italic text-base">
                  BUILD PC
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:flex justify-end relative">
              <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full"></div>
              <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-full max-w-[500px] relative z-10 drop-shadow-[0_0_50px_rgba(245,158,11,0.2)]" alt="gaming pc"/>
            </motion.div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-around gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2"><Truck size={22}/> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-2"><ShieldCheck size={22}/> GENUINE WARRANTY</div>
            <div className="flex items-center gap-2"><Zap size={22}/> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-5xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-6 tracking-tight">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, i) => (
              <TiltCard key={p.id} index={i} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl overflow-hidden">
                <div className="aspect-square bg-black/40 rounded-2xl mb-6 overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                <h3 className="font-bold text-xl mb-2 truncate uppercase italic">{p.name}</h3>
                <p className="text-2xl font-black mb-6 text-amber-500 italic">LKR {p.sellingPrice?.toLocaleString()}</p>
                <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm">
                  ADD TO CART
                </button>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* --- CALL TO ACTION (FIXED SIZE) --- */}
        <section className="px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-amber-500 py-16 md:py-24 px-8 rounded-[50px] md:rounded-[70px] text-black text-center relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-10 italic uppercase leading-[0.9] tracking-tighter">
                READY TO BUILD <br className="hidden md:block"/> YOUR DREAM RIG?
              </h2>
              <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer" className="inline-block">
                <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 transition-all shadow-2xl uppercase italic">
                  GET A QUOTE NOW
                </button>
              </a>
            </div>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          </motion.div>
        </section>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {isSocialOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="flex flex-col gap-3 mb-4">
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Facebook size={20}/></a>
              <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Instagram size={20}/></a>
              <a href="https://wa.me/94742299006" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><MessageCircle size={20}/></a>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
          {isSocialOpen ? <X size={26} /> : <Share2 size={26} />}
        </button>
      </div>
    </div>
  );
}