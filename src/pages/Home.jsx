import { useEffect, useState, useRef } from "react";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, Instagram, MessageCircle, X, Music2, Users, Award, TrendingUp
} from "lucide-react";

// Firebase Imports
import { db } from "../firebase/config"; 
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

const TypeWriter = ({ text, delay = 100 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}<span className="animate-pulse">|</span></span>;
};

export default function Home({ setPage, cart, setCart }) {
  // Admin එකෙන් එන Products ලබා ගැනීමට State එක
  const [products, setProducts] = useState([]);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const canvasRef = useRef(null);

  // --- Firebase Real-time Data Fetching Logic ---
  useEffect(() => {
    // Firestore එකෙන් අලුත්ම products 4ක් ලබා ගැනීම
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let planets = [];
    let shootingStars = [];
    let particles = [];
    let mouse = { x: 0, y: 0, realX: -1000, realY: -1000 };
    let isClicking = false;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = (Math.random() * canvas.height) / 2;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 6;
        this.size = Math.random() * 1 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.5;
      }
      update() {
        this.x += this.speed;
        this.y += this.speed;
        this.opacity -= 0.01;
        if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
          if (Math.random() < 0.03) this.reset();
        }
      }
      draw() {
        if (this.opacity > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.lineWidth = this.size;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.length, this.y - this.length);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    class Particle {
      constructor(x, y) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= 0.02; }
      draw() {
        ctx.fillStyle = `rgba(245, 158, 11, ${this.life})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

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
      constructor() { 
        this.init(); 
        this.twinkle = Math.random() * Math.PI * 2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
      }
      init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.vy = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.twinkle += this.twinkleSpeed;
        if (isClicking) {
          const dx = mouse.realX - this.x; const dy = mouse.realY - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          this.x += dx / (dist * 0.1); this.y += dy / (dist * 0.1);
          if (dist < 5) this.init();
        } else {
          this.y += this.vy; if (this.y > canvas.height) this.y = 0;
        }
      }
      draw() { 
        const opacity = 0.8 + Math.sin(this.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`; 
        ctx.fillRect(this.x, this.y, this.size, this.size); 
      }
    }

    planets = [new Planet(60, "#f59e0b", 0.1, 5), new Planet(110, "#78350f", 0.05, 3)];
    for (let i = 0; i < 300; i++) stars.push(new Star());
    for (let i = 0; i < 5; i++) shootingStars.push(new ShootingStar());

    const animate = () => {
      ctx.fillStyle = "#020202"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => { s.update(); s.draw(); });
      planets.forEach(p => { p.update(); p.draw(); });
      shootingStars.forEach(s => { s.update(); s.draw(); });
      particles = particles.filter(p => { p.update(); p.draw(); return p.life > 0; });
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouse.realX = e.clientX; mouse.realY = e.clientY;
      mouse.x = (e.clientX - canvas.width/2) / 80;
      mouse.y = (e.clientY - canvas.height/2) / 80;
    };
    const handleClick = (e) => {
      for (let i = 0; i < 20; i++) particles.push(new Particle(e.clientX, e.clientY));
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", () => isClicking = true);
    window.addEventListener("mouseup", () => isClicking = false);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[200]">
        <div className="text-center">
          <div className="mb-8"><Package className="w-20 h-20 text-amber-500 mx-auto animate-bounce" /></div>
          <h1 className="text-4xl md:text-6xl font-black mb-8 italic uppercase tracking-tight text-white">
            DUMO <span className="text-amber-500">COMPUTERS</span>
          </h1>
          <div className="w-64 h-2 bg-zinc-900 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-600 transition-all duration-300 rounded-full" style={{ width: `${loadProgress}%` }}></div>
          </div>
          <p className="text-white font-black text-xl mt-4">{loadProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden select-none font-sans">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-100" />

      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="min-h-[90vh] flex items-center px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 inline-block shadow-lg animate-pulse">
                PREMIUM GAMING GEAR
              </span>
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">
                <TypeWriter text="LEVEL UP" delay={80} /><br /> 
                <span className="text-amber-500">YOUR GAME.</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl mb-10 italic max-w-lg">Sri Lanka's elite destination for high-end hardware.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setPage("shop")} className="group px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all uppercase italic flex items-center justify-center gap-2 text-base relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">SHOP NOW <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-4 border-2 border-white/20 font-black rounded-xl hover:bg-white/10 hover:border-amber-500 transition-all uppercase italic text-base">BUILD PC</button>
              </div>
            </div>
            <div className="hidden lg:flex justify-end relative animate-fade-in-delayed">
              <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full animate-pulse"></div>
              <img src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" className="w-full max-w-[500px] relative z-10 drop-shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-float" alt="gaming pc" />
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-around gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Truck size={22}/> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><ShieldCheck size={22}/> GENUINE WARRANTY</div>
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Zap size={22}/> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl md:text-5xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-6 tracking-tight">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? products.map((p, i) => (
              <div key={p.id} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl overflow-hidden group cursor-pointer hover:scale-105 duration-300">
                <div className="aspect-square bg-black/40 rounded-2xl mb-6 overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                <h3 className="font-bold text-xl mb-2 truncate uppercase italic group-hover:text-amber-500 transition-colors">{p.name}</h3>
                <p className="text-2xl font-black mb-6 text-amber-500 italic">LKR {p.sellingPrice?.toLocaleString()}</p>
                <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm relative overflow-hidden group">
                  <span className="relative z-10">ADD TO CART</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </button>
              </div>
            )) : (
              // Products Load වෙනකම් පෙන්වන empty placeholders
              [1,2,3,4].map(n => <div key={n} className="h-[400px] bg-zinc-900/20 rounded-[35px] animate-pulse border border-white/5"></div>)
            )}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto bg-amber-500 py-16 md:py-24 px-8 rounded-[50px] md:rounded-[70px] text-black text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-10 italic uppercase leading-[0.9] tracking-tighter">READY TO BUILD <br className="hidden md:block"/> YOUR DREAM RIG?</h2>
              <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer">
                <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 transition-all shadow-2xl uppercase italic">GET A QUOTE NOW</button>
              </a>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          </div>
        </section>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {isSocialOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-fade-in">
            <a href="https://www.facebook.com/share/1Enu9r1rLW/" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Facebook size={20}/></a>
            <a href="https://www.tiktok.com/@dumocomputers" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><Music2 size={20}/></a>
            <a href="https://wa.me/94742299006" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><MessageCircle size={20}/></a>
          </div>
        )}
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
          {isSocialOpen ? <X size={26} /> : <Share2 size={26} />}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delayed { animation: fade-in 1s ease-out 0.3s both; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}