import { useEffect, useState } from "react";
import {
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap,
  Share2, Facebook, MessageCircle, X, Music2, MapPinned, Clock
} from "lucide-react";

// Firebase Imports
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot, limit, where } from "firebase/firestore";
import SpaceBackground from "../components/SpaceBackground";

// --- REUSABLE SLIDE TIMER COMPONENT ---
const SlideTimer = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiryDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(expiryDate).getTime();
      const diff = end - now;

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60)
        });
      } else {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!expiryDate || isExpired) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600/90 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl animate-bounce">
      <Clock size={14} className="text-white" />
      <span className="text-xs font-black text-white italic tracking-tighter">
        ENDS: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.mins).padStart(2, '0')}:{String(timeLeft.secs).padStart(2, '0')}
      </span>
    </div>
  );
};

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

  return <span>{currentText}<span className="animate-pulse opacity-50">|</span></span>;
};

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  useEffect(() => {
    const pq = query(
      collection(db, "products"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribeProducts = onSnapshot(pq, (snapshot) => {
      const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const featured = allProducts.filter(p => p.isOffer !== true).slice(0, 6);
      setProducts(featured);
    });

    const sq = query(collection(db, "hero_slides"), orderBy("order", "asc"));
    const unsubscribeSlides = onSnapshot(sq, (snapshot) => {
      setSlides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubscribeProducts(); unsubscribeSlides(); };
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  const handleBannerClick = (slide) => {
    if (slide.link === "builder") setPage("builder");
    else if (slide.link === "shop") setPage("shop");
    else window.open(`https://wa.me/94742299006?text=Interested in ${slide.title}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <SpaceBackground />

      <div className="relative z-10 w-full">
        {/* HERO SECTION */}
        <section className="min-h-screen flex items-center px-6 lg:px-20 w-full pt-10">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center max-w-[1600px] mx-auto">
            
            <div className="animate-reveal-up z-20 text-center lg:text-left order-2 lg:order-1">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-8 inline-block shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                PREMIUM GAMING GEAR
              </span>

              <h1 className="text-6xl md:text-8xl xl:text-9xl font-black mb-8 tracking-tighter leading-[0.85] uppercase italic">
                <TypeWriter text="Build Your" delay={80} /><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 drop-shadow-sm">
                  Dream Computer
                </span>
              </h1>

              <p className="text-zinc-400 text-lg md:text-xl mb-12 italic max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Sri Lanka's elite destination for high-end hardware and custom liquid-cooled rigs.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-amber-500 transition-all duration-300 uppercase italic flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-amber-500/20 group">
                  SHOP NOW <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <button onClick={() => setPage("builder")} className="px-12 py-5 border-2 border-white/10 font-black rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all duration-300 uppercase italic backdrop-blur-sm">
                  BUILD PC
                </button>
              </div>
            </div>

            {/* DESKTOP/MOBILE SLIDER */}
            <div className="relative order-1 lg:order-2 flex justify-center items-center h-[400px] md:h-[600px]">
              {/* Background Glow */}
              <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-amber-500/10 blur-[120px] rounded-full animate-pulse"></div>
              
              {slides.map((slide, index) => (
                <div key={slide.id} className={`absolute transition-all duration-1000 w-full flex flex-col items-center ${index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
                  <div className="relative group perspective-1000">
                    <SlideTimer expiryDate={slide.expiryDate} />
                    <img
                      src={slide.image}
                      className="w-full max-w-[320px] md:max-w-[550px] relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float cursor-pointer transition-transform duration-500"
                      onClick={() => handleBannerClick(slide)}
                      alt={slide.title}
                    />
                  </div>
                  {slide.title && (
                    <div className="mt-8 bg-zinc-900/40 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-2xl shadow-2xl transform -skew-x-12">
                      <p className="text-amber-500 font-black italic uppercase text-xs md:text-sm tracking-[0.2em] skew-x-12">{slide.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST BADGES - Cleaned up */}
        <div className="border rounded-3xl border-white/20 bg-zinc-950/50 backdrop-blur-md py-12 px-6 relative z-20 border-b-2">
          <div className="max-w-[1400px] border-white/10 mx-auto flex flex-wrap justify-center md:justify-between gap-10 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
            <div className="flex items-center gap-4 hover:text-white transition-colors cursor-default"><Truck size={20} className="text-amber-500" /> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-4 hover:text-white transition-colors cursor-default"><ShieldCheck size={20} className="text-amber-500" /> GENUINE WARRANTY</div>
            <div className="flex items-center gap-4 hover:text-white transition-colors cursor-default"><Zap size={20} className="text-amber-500" /> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED HARDWARE SECTION */}
        <section className="w-full px-4 lg:px-20 py-32 bg-gradient-to-b from-transparent to-zinc-950/30">
          <div className="flex items-end justify-between mb-16 px-4">
             <div>
                <h2 className="text-3xl md:text-6xl font-black italic uppercase leading-none">Featured</h2>
                <h2 className="text-3xl md:text-6xl font-black italic uppercase text-amber-500 leading-none">Hardware</h2>
             </div>
             <div className="hidden md:block h-1 w-32 bg-amber-500 mb-2"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
            {products.length > 0 ? (
              products.map((p, i) => (
                <div key={p.id} className="bg-zinc-900/30 border border-white/5 p-4 md:p-6 rounded-[24px] md:rounded-[32px] backdrop-blur-sm hover:border-amber-500/40 transition-all duration-500 group cursor-pointer flex flex-col h-full">
                  <div className="aspect-square bg-black/20 rounded-2xl mb-6 overflow-hidden flex items-center justify-center p-4">
                    <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm mb-2 truncate uppercase italic text-zinc-300">{p.name}</h3>
                  <p className="text-lg md:text-xl font-black mb-6 text-amber-500 italic mt-auto">LKR {p.sellingPrice?.toLocaleString()}</p>
                  <button onClick={() => setCart([...cart, p])} className="w-full py-3 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic text-[10px] md:text-xs">ADD TO CART</button>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-zinc-600 italic tracking-widest uppercase">Initializing Systems...</div>
            )}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 lg:px-20 py-24">
          <div className="w-full max-w-[1400px] mx-auto bg-amber-500 py-20 px-8 rounded-[40px] md:rounded-[60px] text-black text-center relative overflow-hidden shadow-[0_20px_80px_rgba(245,158,11,0.2)] group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <h2 className="text-5xl md:text-8xl font-black mb-12 italic uppercase leading-[0.85] relative z-10">READY TO BUILD <br /> YOUR DREAM RIG?</h2>
            <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer" className="relative z-10">
              <button className="bg-black text-white px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase italic">GET A FREE QUOTE</button>
            </a>
          </div>
        </section>
      </div>

      {/* SOCIAL FLOATING PANEL */}
      <div className="fixed bottom-8 right-8 z-[100]">
        {isSocialOpen && (
          <div className="flex flex-col gap-4 mb-6 animate-reveal-up">
            {[
              { icon: <MapPinned size={20} />, href: "#" },
              { icon: <Facebook size={20} />, href: "https://www.facebook.com/share/1Enu9r1rLW/" },
              { icon: <Music2 size={20} />, href: "https://www.tiktok.com/@dumocomputers" },
              { icon: <MessageCircle size={20} />, href: "https://wa.me/94742299006" }
            ].map((social, i) => (
              <a key={i} href={social.href} className="w-14 h-14 bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all text-white shadow-xl translate-x-1">
                {social.icon}
              </a>
            ))}
          </div>
        )}
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-16 h-16 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-[0_10px_40px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 transition-all">
          {isSocialOpen ? <X size={28} /> : <Share2 size={28} />}
        </button>
      </div>

      <style jsx>{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(1deg); } }
        .animate-reveal-up { animation: reveal-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}