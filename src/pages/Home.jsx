import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config"; 
import { collection, getDocs, limit, query } from "firebase/firestore";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X 
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

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
    let mouse = { x: -1000, y: -1000 };
    let ripples = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // --- REALISTIC WATERFALL LOGIC ---
    class Stream {
      constructor() {
        this.init();
      }

      init() {
        this.x = Math.random() * canvas.width;
        this.y = -Math.random() * canvas.height;
        this.width = Math.random() * 60 + 40; // පළල වැඩි කළා (ඉරි වගේ පේන එක නැති කරන්න)
        this.speed = Math.random() * 1.5 + 1;
        // වතුරට ගැළපෙන realistic blue shades
        const colors = ["#00d4ff", "#008fb3", "#005c73", "#e6fbff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.length = Math.random() * 500 + 300;
        this.vx = 0;
      }

      update() {
        this.y += this.speed;

        // Mouse Reaction
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          this.vx += dx * 0.002;
        }
        this.x += this.vx;
        this.vx *= 0.98;

        if (this.y > canvas.height + this.length) {
          this.init();
          this.y = -this.length;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        // Circle එකක් වගේ ඇඳලා blur කළාම තමයි වතුර වගේ පේන්නේ
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Ripple {
      constructor(x, y) {
        this.x = x; this.y = y; this.r = 0; this.opacity = 0.4;
      }
      update() { this.r += 6; this.opacity -= 0.008; }
      draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0, 212, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (let i = 0; i < 35; i++) streams.push(new Stream());

    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const handleClick = (e) => ripples.push(new Ripple(e.clientX, e.clientY));

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleClick);

    const animate = () => {
      ctx.fillStyle = "black"; // සැබෑ වතුර ගතිය පේන්න පසුබිම කළු විය යුතුයි
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
      
      {/* --- REAL LIQUID WATER EFFECT --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-60"
        style={{ filter: "blur(45px) contrast(35)" }} // මෙතනින් තමයි වතුර එකට මිශ්‍ර වෙන්නේ
      />

      <div className="relative z-10">
        {/* HERO - ඔයාගේ මුල් Design එකමයි */}
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

        {/* FEATURED PRODUCTS */}
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
      </div>
    </div>
  );
}