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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-600/80 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl animate-bounce">
      <Clock size={12} className="text-white" />
      <span className="text-[10px] font-black text-white italic">
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

  return <span>{currentText}<span className="animate-pulse">|</span></span>;
};

export default function Home({ setPage, cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  useEffect(() => {
    // Featured Products Query
    const pq = query(collection(db, "products"), where("isOffer", "==", false), orderBy("createdAt", "desc"), limit(6));
    const unsubscribeProducts = onSnapshot(pq, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Slides Query (Make sure your admin adds expiryDate to slides if needed)
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
        <section className="min-h-[90vh] flex items-center px-6 lg:px-20 w-full pt-20">
          <div className="w-full grid lg:grid-cols-2 gap-8 items-center max-w-[1600px] mx-auto">
            
            <div className="animate-reveal-up z-20 text-center lg:text-left">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 inline-block shadow-lg">
                PREMIUM GAMING GEAR
              </span>

              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">
                <TypeWriter text="Build Your" delay={80} /><br />
                <span className="text-amber-500 inline-block">Dream Computer</span>
              </h1>

              {/* MOBILE SLIDER WITH PER-SLIDE TIMER */}
              <div className="lg:hidden w-full h-[320px] relative my-8 flex justify-center items-center">
                <div className="absolute w-[200px] h-[200px] bg-amber-500/10 blur-[80px] rounded-full animate-pulse"></div>
                {slides.map((slide, index) => (
                  <div key={slide.id} className={`absolute transition-all duration-700 ${index === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                    <div className="relative">
                      <SlideTimer expiryDate={slide.expiryDate} />
                      <img 
                        src={slide.image} 
                        className="w-full max-w-[250px] drop-shadow-2xl animate-float cursor-pointer" 
                        onClick={() => handleBannerClick(slide)} 
                        alt="offer"
                      />
                    </div>
                    {slide.title && (
                      <div className="mt-4 bg-zinc-900/90 border border-amber-500/30 px-4 py-1 rounded-full text-[10px] text-amber-500 font-black italic uppercase text-center">
                        {slide.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-lg md:text-xl mb-10 italic max-w-lg mx-auto lg:mx-0">
                Sri Lanka's elite destination for high-end hardware.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => setPage("shop")} className="px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all uppercase italic flex items-center justify-center gap-2">
                  SHOP NOW <ArrowRight size={20} />
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-4 border-2 border-white/20 font-black rounded-xl hover:bg-white/10 uppercase italic">
                  BUILD PC
                </button>
              </div>
            </div>

            {/* DESKTOP SLIDER WITH PER-SLIDE TIMER */}
            <div className="hidden lg:flex justify-center items-center relative h-[550px] w-full">
              <div className="absolute w-[400px] h-[400px] bg-amber-500/20 blur-[120px] rounded-full animate-pulse"></div>
              {slides.map((slide, index) => (
                <div key={slide.id} className={`absolute transition-all duration-1000 flex flex-col items-center ${index === activeSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}>
                  <div className="relative group">
                    <SlideTimer expiryDate={slide.expiryDate} />
                    <img
                      src={slide.image}
                      className="w-full max-w-[480px] xl:max-w-[550px] relative z-10 drop-shadow-2xl animate-float cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => handleBannerClick(slide)}
                      alt={slide.title}
                    />
                  </div>
                  {slide.title && (
                    <div className="mt-6 bg-zinc-900/80 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-2xl shadow-2xl">
                      <p className="text-amber-500 font-black italic uppercase text-sm tracking-widest">{slide.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic shadow-2xl relative z-20">
          <div className="w-full lg:px-14 flex flex-wrap justify-center md:justify-around gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2"><Truck size={22} /> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-2"><ShieldCheck size={22} /> GENUINE WARRANTY</div>
            <div className="flex items-center gap-2"><Zap size={22} /> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS */}
        <section className="w-full px-4 lg:px-20 py-24">
          <h2 className="text-2xl md:text-5xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-4 md:pl-6">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-8">
            {products.map((p, i) => (
              <div key={p.id} className="bg-zinc-900/40 border border-white/5 p-2 md:p-6 rounded-[15px] md:rounded-[35px] backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl group cursor-pointer hover:scale-105 duration-300">
                <div className="aspect-square bg-black/40 rounded-lg md:rounded-2xl mb-2 md:mb-6 overflow-hidden flex items-center justify-center">
                  <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                <h3 className="font-bold text-[8px] md:text-xl mb-0.5 md:mb-2 truncate uppercase italic">{p.name}</h3>
                <p className="text-[10px] md:text-2xl font-black mb-2 md:mb-6 text-amber-500 italic">LKR {p.sellingPrice?.toLocaleString()}</p>
                <button onClick={() => setCart([...cart, p])} className="w-full py-1.5 md:py-4 bg-white text-black rounded-md md:rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic text-[7px] md:text-sm">ADD</button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 lg:px-20 py-20">
          <div className="w-full max-w-[1600px] mx-auto bg-amber-500 py-16 md:py-24 px-8 rounded-[50px] md:rounded-[70px] text-black text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl md:text-7xl font-black mb-10 italic uppercase leading-[0.9]">READY TO BUILD <br className="hidden md:block" /> YOUR DREAM RIG?</h2>
            <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer">
              <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-110 transition-all shadow-2xl uppercase italic">GET A QUOTE NOW</button>
            </a>
          </div>
        </section>
      </div>

      {/* SOCIAL FLOATING PANEL */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {isSocialOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-reveal-up">
            <a href="#" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all text-white"><MapPinned size={20} /></a>
            <a href="https://www.facebook.com/share/1Enu9r1rLW/" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all text-white"><Facebook size={20} /></a>
            <a href="https://www.tiktok.com/@dumocomputers" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all text-white"><Music2 size={20} /></a>
            <a href="https://wa.me/94742299006" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all text-white"><MessageCircle size={20} /></a>
          </div>
        )}
        <button onClick={() => setIsSocialOpen(!isSocialOpen)} className="w-14 h-14 bg-amber-500 text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
          {isSocialOpen ? <X size={26} /> : <Share2 size={26} />}
        </button>
      </div>

      <style jsx>{`
        @keyframes reveal-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        .animate-reveal-up { animation: reveal-up 0.5s ease-out both; }
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}