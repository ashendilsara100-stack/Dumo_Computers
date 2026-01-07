import { useEffect, useState } from "react";
import { 
  ShoppingCart, Package, ArrowRight, ShieldCheck, Truck, Zap, 
  Share2, Facebook, MessageCircle, X, Music2, MapPinned
} from "lucide-react";

// Firebase Imports
import { db } from "../firebase/config"; 
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import SpaceBackground from "../components/SpaceBackground";

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
  const [isSocialOpen, setIsSocialOpen] = useState(false);

  // --- Firebase Data Fetching ---
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    }, (error) => console.error("Firebase Error:", error));
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      <SpaceBackground />

      <div className="relative z-10 w-full">
        {/* HERO SECTION - Max-width අයින් කර පේළිය දිගු කරන ලදී */}
        <section className="min-h-[90vh] flex items-center px-6 lg:px-20 w-full pt-20">
          <div className="w-full grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text with Animations */}
            <div className="animate-reveal-up">
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 inline-block shadow-lg animate-fade-in">
                PREMIUM GAMING GEAR
              </span>
              
              <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase italic">
                <TypeWriter text="Build Your" delay={80} /><br /> 
                <span className="text-amber-500 inline-block animate-reveal-left" style={{ animationDelay: '0.5s' }}>Dream Computer</span>
              </h1>

              <p className="text-gray-400 text-lg md:text-xl mb-10 italic max-w-lg animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
                Sri Lanka's elite destination for high-end hardware.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-reveal-up" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
                <button onClick={() => setPage("shop")} className="group px-10 py-4 bg-white text-black font-black rounded-xl hover:bg-amber-500 transition-all uppercase italic flex items-center justify-center gap-2 text-base relative overflow-hidden active:scale-95">
                  SHOP NOW <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
                <button onClick={() => setPage("builder")} className="px-10 py-4 border-2 border-white/20 font-black rounded-xl hover:bg-white/10 hover:border-amber-500 transition-all uppercase italic text-base active:scale-95">
                  BUILD PC
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="hidden lg:flex justify-end relative animate-reveal-right" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-amber-500/10 blur-[80px] rounded-full animate-pulse"></div>
              <img 
                src="https://i.ibb.co/XrC6Y9fy/download-10-removebg-preview.png" 
                className="w-full max-w-[550px] relative z-10 drop-shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-float" 
                alt="gaming pc" 
              />
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <div className="bg-white text-black py-10 px-6 font-black uppercase italic shadow-2xl relative z-20 animate-reveal-up" style={{ animationDelay: '1.5s' }}>
          <div className="w-full lg:px-14 flex flex-wrap justify-center md:justify-around gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Truck size={22}/> ISLANDWIDE DELIVERY</div>
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><ShieldCheck size={22}/> GENUINE WARRANTY</div>
            <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer"><Zap size={22}/> TECH SUPPORT</div>
          </div>
        </div>

        {/* FEATURED PRODUCTS - Responsive Grid with full width */}
        <section className="w-full px-6 lg:px-20 py-24">
          <h2 className="text-3xl md:text-5xl font-black mb-12 italic uppercase border-l-8 border-amber-500 pl-6 tracking-tight animate-reveal-left">FEATURED HARDWARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {products.length > 0 ? products.map((p, i) => (
              <div 
                key={p.id} 
                style={{ animationDelay: `${(i * 0.2) + 1.8}s` }}
                className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-xl hover:border-amber-500/50 transition-all shadow-2xl overflow-hidden group cursor-pointer hover:scale-105 duration-300 animate-reveal-up fill-mode-both"
              >
                <div className="aspect-square bg-black/40 rounded-2xl mb-6 overflow-hidden border border-white/5 flex items-center justify-center">
                  <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                <h3 className="font-bold text-xl mb-2 truncate uppercase italic group-hover:text-amber-500 transition-colors">{p.name}</h3>
                <p className="text-2xl font-black mb-6 text-amber-500 italic">LKR {p.sellingPrice?.toLocaleString()}</p>
                <button onClick={() => setCart([...cart, p])} className="w-full py-4 bg-white text-black rounded-xl font-black hover:bg-amber-500 transition-all uppercase italic text-sm relative overflow-hidden">
                  ADD TO CART
                </button>
              </div>
            )) : (
              [1,2,3,4,5].map(n => <div key={n} className="h-[400px] bg-zinc-900/20 rounded-[35px] animate-pulse border border-white/5"></div>)
            )}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-6 lg:px-20 py-20 animate-reveal-up" style={{ animationDelay: '2.5s' }}>
          <div className="w-full max-w-[1600px] mx-auto bg-amber-500 py-16 md:py-24 px-8 rounded-[50px] md:rounded-[70px] text-black text-center relative overflow-hidden shadow-2xl group">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black mb-10 italic uppercase leading-[0.9] tracking-tighter">READY TO BUILD <br className="hidden md:block"/> YOUR DREAM RIG?</h2>
              <a href="https://wa.me/94742299006" target="_blank" rel="noreferrer">
                <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-110 transition-all shadow-2xl uppercase italic active:scale-95">GET A QUOTE NOW</button>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* SOCIAL MENU */}
      <div className="fixed bottom-6 right-6 z-[100]">
        {isSocialOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-reveal-up">
            <a href="https://maps.app.goo.gl/eGEG6g1KRz5un6R87" className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all shadow-xl text-white"><MapPinned size={20}/></a>
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
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reveal-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes reveal-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .animate-reveal-up { animation: reveal-up 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-reveal-right { animation: reveal-right 1s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-reveal-left { animation: reveal-left 1s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .animate-fade-in { animation: fade-in 1.2s ease-out both; }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .fill-mode-both { animation-fill-mode: both; }
      `}</style>
    </div>
  );
}