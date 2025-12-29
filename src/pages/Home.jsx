import { useState, useEffect } from 'react';
import { ShoppingCart, Cpu, Monitor, Gamepad2, Zap, CheckCircle, Star, ChevronRight, TrendingUp } from 'lucide-react';

export default function Home({ setPage }) {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    { icon: Cpu, title: "Custom PC Builder", desc: "Build your dream gaming rig", color: "from-cyan-500 to-blue-600" },
    { icon: Gamepad2, title: "Pre-Built Gaming PCs", desc: "Ready to game, right out of the box", color: "from-purple-500 to-pink-600" },
    { icon: Monitor, title: "Premium Components", desc: "Latest GPUs, CPUs & Peripherals", color: "from-orange-500 to-red-600" },
    { icon: Zap, title: "Fast Delivery", desc: "Island-wide delivery in Sri Lanka", color: "from-green-500 to-emerald-600" }
  ];

  const testimonials = [
    { name: "Kasun Silva", rating: 5, text: "Amazing service! Built my dream gaming PC." },
    { name: "Nuwan Perera", rating: 5, text: "Best prices in Sri Lanka. Highly recommended!" },
    { name: "Tharindu Fernando", rating: 5, text: "Fast delivery and excellent quality parts." }
  ];

  const popularBuilds = [
    { name: "Entry Gaming", price: "LKR 175,000", specs: "GTX 1650 • Ryzen 5 • 16GB RAM", tag: "Budget King" },
    { name: "Mid-Range Beast", price: "LKR 325,000", specs: "RTX 3060 • Ryzen 5 5600 • 16GB RAM", tag: "Best Value" },
    { name: "High-End Monster", price: "LKR 550,000", specs: "RTX 4070 • Ryzen 7 7800X3D • 32GB RAM", tag: "Performance" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[128px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[128px] animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full filter blur-[128px] animate-pulse delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-sm font-bold animate-bounce">
            🔥 New RTX 4000 Series Available
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            LEVEL UP YOUR GAME
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Sri Lanka's #1 destination for <span className="text-cyan-400 font-bold">Gaming PCs</span>, 
            <span className="text-purple-400 font-bold"> Custom Builds</span> & 
            <span className="text-pink-400 font-bold"> Premium Components</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={() => setPage("builder")}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-6 h-6" />
                Build Your PC
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button 
              onClick={() => setPage("shop")}
              className="group px-8 py-4 bg-white/10 backdrop-blur-lg border-2 border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Browse Shop
              </span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Genuine Parts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Island-wide Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Expert Support</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <div className="w-1 h-3 bg-white/50 rounded-full mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Why Choose PC HUB LK?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx}
                  className={`group relative p-8 rounded-2xl bg-gradient-to-br ${feature.color} hover:scale-105 transition-all duration-300 cursor-pointer ${activeFeature === idx ? 'ring-4 ring-white scale-105' : ''}`}
                  onClick={() => setActiveFeature(idx)}
                >
                  <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-white/80">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Builds Section */}
      <section className="py-20 px-6 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-full">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <span className="text-orange-400 font-bold">Most Popular</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Top Gaming Builds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {popularBuilds.map((build, idx) => (
              <div key={idx} className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:scale-105">
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-bold">
                  {build.tag}
                </div>
                
                <div className="mb-6">
                  <Gamepad2 className="w-16 h-16 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">{build.name}</h3>
                  <p className="text-3xl font-black text-cyan-400 mb-4">{build.price}</p>
                  <p className="text-gray-400 text-sm">{build.specs}</p>
                </div>

                <button 
                  onClick={() => setPage("builder")}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  Customize Build
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            What Gamers Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border-2 border-gray-700 hover:border-green-500 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <p className="font-bold text-cyan-400">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to Dominate?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Build your ultimate gaming setup today and join thousands of satisfied gamers across Sri Lanka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setPage("builder")}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/50"
            >
              Start Building Now
            </button>
            <button 
              onClick={() => setPage("shop")}
              className="px-10 py-5 bg-white text-black rounded-xl font-bold text-xl hover:scale-105 transition-all duration-300"
            >
              Shop Components
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}