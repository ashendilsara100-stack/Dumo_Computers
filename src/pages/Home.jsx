import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className, id, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: false, amount: 0.2 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
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
    let mouse = { x: -1000, y: -1000 };
    let ripples = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // --- NEW CYAN/BLUE WATER LOGIC ---
    class Stream {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = -Math.random() * canvas.height;
        this.width = Math.random() * 40 + 20; // ටිකක් පළල වැඩි කළා දියර ගතිය පේන්න
        this.speed = Math.random() * 2 + 1.5;
        // --- COLORS: CYAN, NEON BLUE, ROYAL BLUE ---
        const colors = ["#00f2ff", "#0066ff", "#00d4ff", "#ffffff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.length = Math.random() * 400 + 200;
        this.vx = 0;
      }

      update() {
        this.y += this.speed;

        // Mouse Interaction
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.vx += dx * 0.005;
        }
        this.x += this.vx;
        this.vx *= 0.95;

        if (this.y > canvas.height + this.length) {
          this.init();
          this.y = -this.length;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // Rounded හැඩය වැඩි කළා සිනිඳු වෙන්න
        ctx.roundRect(this.x, this.y, this.width, this.length, 50);
        ctx.fill();
      }
    }

    class Ripple {
      constructor(x, y) {
        this.x = x; this.y = y; this.r = 0; this.opacity = 0.5;
      }
      update() { this.r += 10; this.opacity -= 0.01; }
      draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 242, 255, ${this.opacity})`;
        ctx.lineWidth = 3;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 20; i++) streams.push(new Stream());

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleClick = (e) => ripples.push(new Ripple(e.clientX, e.clientY));

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Trail එක අඩු කළා පැහැදිලි වෙන්න
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      streams.forEach(s => { s.update(); s.draw(); });
      ripples.forEach((r, i) => {
        r.update(); r.draw();
        if (r.opacity <= 0) ripples.splice(i, 1);
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

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- IMPROVED LIQUID FILTER --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-50"
        style={{ filter: "blur(30px) contrast(25)" }} // Blur එක වැඩි කළා වතුර වගේ පේන්න
      />

      <div className="relative z-10">
        {/* HERO */}
        <div className="relative h-[85vh] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-1 rounded-full border border-cyan-500 text-cyan-400 text-xs font-black mb-6 uppercase tracking-[0.2em]">
                NEXT-GEN HARDWARE
              </span>
              <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                LEVEL UP <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">YOUR GAME.</span>
              </h1>
              <div className="flex flex-wrap gap-4 mt-8">
                <button onClick={() => setPage("shop")} className="px-10 py-5 bg-white text-black font-black rounded-full hover:bg-cyan-400 transition-all uppercase italic">
                  SHOP NOW
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-5 border border-white/20 backdrop-blur-md font-black rounded-full hover:bg-white/10 transition-all uppercase italic">
                  BUILD PC
                </button>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:flex justify-center">
                <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-[550px] drop-shadow-[0_0_100px_rgba(0,242,255,0.2)]" />
            </motion.div>
          </div>
        </div>

        {/* TRUST BADGES - GLASS STYLE */}
        <div className="bg-white/5 backdrop-blur-md border-y border-white/5 py-12 px-6 font-black uppercase italic relative z-20">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8 text-sm">
            <div className="flex items-center gap-3 text-cyan-400"><Truck /> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-3 text-cyan-400"><ShieldCheck /> GENUINE WARRANTY</div>
            <div className="flex items-center gap-3 text-cyan-400"><Zap /> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h2 className="text-4xl font-black mb-12 italic uppercase tracking-tighter flex items-center gap-4">
            <span className="w-12 h-[2px] bg-cyan-500"></span> FEATURED HARDWARE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p, index) => (
              <TiltCard key={p.id} id={`card-${p.id}`} index={index}>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl hover:border-cyan-500/50 transition-all shadow-2xl group relative overflow-hidden">
                  <div className="aspect-square bg-black/40 rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden">
                    <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-4" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 truncate uppercase italic">{p.name}</h3>
                  <p className="text-2xl font-black mb-6 italic text-cyan-400">LKR {p.price.toLocaleString()}</p>
                  <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-2xl font-black hover:bg-cyan-500 transition-all uppercase italic">
                    ADD TO CART
                  </button>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}