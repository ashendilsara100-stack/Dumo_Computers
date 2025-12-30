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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true }}
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
    let stars = [];
    let planets = [];
    let mouse = { x: -1000, y: -1000 };
    let isClicking = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // --- PLANET LOGIC (NO IMAGES) ---
    class Planet {
      constructor(size, color, speed, depth) {
        this.reset(true);
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.depth = depth; // For Parallax
      }
      reset(firstTime = false) {
        this.x = Math.random() * canvas.width;
        this.y = firstTime ? Math.random() * canvas.height : -200;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height + 200) this.reset();
        
        // Parallax based on mouse
        this.renderX = this.x + (mouse.x * this.depth);
        this.renderY = this.y + (mouse.y * this.depth);
      }
      draw() {
        ctx.save();
        ctx.translate(this.renderX, this.renderY);
        
        // Planet Body with Gradient for 3D look
        let grad = ctx.createRadialGradient(-this.size/3, -this.size/3, this.size/10, 0, 0, this.size);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, "black");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Atmosphere Glow
        ctx.globalAlpha = 0.2;
        ctx.shadowBlur = 40;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- STAR PARTICLE LOGIC ---
    class Star {
      constructor() { this.init(); }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 0.5 + 0.2;
        this.size = Math.random() * 2;
        this.alpha = Math.random();
      }
      update() {
        if (isClicking) {
          // BLACK HOLE EFFECT
          const dx = mouse.realX - this.x;
          const dy = mouse.realY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.x += dx / (dist * 0.1);
          this.y += dy / (dist * 0.1);
          if (dist < 10) this.init();
        } else {
          this.x += this.vx;
          this.y += this.vy;
          if (this.y > canvas.height) this.y = 0;
        }
      }
      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    // Initialize
    planets.push(new Planet(80, "#f59e0b", 0.2, 0.05)); // Amber Planet
    planets.push(new Planet(40, "#444", 0.4, 0.02));    // Dark Moon
    planets.push(new Planet(150, "#b45309", 0.1, 0.08)); // Large Gas Giant

    for (let i = 0; i < 200; i++) stars.push(new Star());

    const handleMouseMove = (e) => {
      mouse.realX = e.clientX;
      mouse.realY = e.clientY;
      mouse.x = (e.clientX - canvas.width / 2) / 100;
      mouse.y = (e.clientY - canvas.height / 2) / 100;
    };
    const handleMouseDown = () => isClicking = true;
    const handleMouseUp = () => isClicking = false;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    const animate = () => {
      // Space Background
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Nebula Glow (Amber)
      let nebulaGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      nebulaGrad.addColorStop(0, "rgba(245, 158, 11, 0.05)");
      nebulaGrad.addColorStop(1, "transparent");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => { s.update(); s.draw(); });
      planets.forEach(p => { p.update(); p.draw(); });

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
      } catch (error) { console.error(error); }
    };
    fetchFeatured();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden select-none">
      
      {/* --- HEAVY SPACE CANVAS --- */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none opacity-80"
      />

      <div className="relative z-10">
        {/* HERO SECTION */}
        <div className="relative h-[85vh] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
              <span className="inline-block px-4 py-1 rounded-full border border-amber-500 text-amber-500 text-sm font-black mb-6 uppercase tracking-widest bg-amber-500/10">
                PREMIUM HARDWARE 2025
              </span>
              <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter leading-[0.85] uppercase italic text-white">
                LEVEL UP <br /> <span className="text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">YOUR GAME.</span>
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

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-center relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-[120px] rounded-full"></div>
                <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-[500px] relative z-10 drop-shadow-[0_0_80px_rgba(245,158,11,0.3)]" />
            </motion.div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-12 px-6 font-black uppercase italic relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-around gap-8 text-lg">
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
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl group">
                  <div className="aspect-square bg-black/50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden border border-white/5">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
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
        
        {/* ... CTA and Social Menu sections stay same ... */}
      </div>
    </div>
  );
}