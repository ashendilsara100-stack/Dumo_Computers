import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Zap, Box, Fan, Monitor, ShoppingCart, Save, Share2, CheckCircle, AlertCircle, Package, Trash2 } from 'lucide-react';

const PCBuilder = () => {
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Sample component data
  const components = {
    cpu: [
      { id: 1, name: 'Intel Core i9-14900K', price: 125000, socket: 'LGA1700', tdp: 125 },
      { id: 2, name: 'Intel Core i7-14700K', price: 95000, socket: 'LGA1700', tdp: 125 },
      { id: 3, name: 'AMD Ryzen 9 7950X', price: 135000, socket: 'AM5', tdp: 170 },
      { id: 4, name: 'AMD Ryzen 7 7800X3D', price: 105000, socket: 'AM5', tdp: 120 },
      { id: 5, name: 'Intel Core i5-14600K', price: 72000, socket: 'LGA1700', tdp: 125 }
    ],
    motherboard: [
      { id: 1, name: 'ASUS ROG Strix Z790-E', price: 85000, socket: 'LGA1700', ramSlots: 4 },
      { id: 2, name: 'MSI MPG Z790 Carbon', price: 78000, socket: 'LGA1700', ramSlots: 4 },
      { id: 3, name: 'ASUS ROG Strix X670E-E', price: 95000, socket: 'AM5', ramSlots: 4 },
      { id: 4, name: 'MSI MAG B650 Tomahawk', price: 65000, socket: 'AM5', ramSlots: 4 },
      { id: 5, name: 'Gigabyte Z790 Aorus Elite', price: 58000, socket: 'LGA1700', ramSlots: 4 }
    ],
    ram: [
      { id: 1, name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000', price: 45000, capacity: 32, type: 'DDR5' },
      { id: 2, name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5-5600', price: 38000, capacity: 32, type: 'DDR5' },
      { id: 3, name: 'Kingston Fury Beast 16GB (2x8GB) DDR5-5200', price: 22000, capacity: 16, type: 'DDR5' },
      { id: 4, name: 'Corsair Dominator Platinum 64GB (2x32GB) DDR5-6400', price: 85000, capacity: 64, type: 'DDR5' }
    ],
    gpu: [
      { id: 1, name: 'NVIDIA RTX 4090', price: 450000, power: 450 },
      { id: 2, name: 'NVIDIA RTX 4080 Super', price: 285000, power: 320 },
      { id: 3, name: 'AMD Radeon RX 7900 XTX', price: 265000, power: 355 },
      { id: 4, name: 'NVIDIA RTX 4070 Ti Super', price: 195000, power: 285 },
      { id: 5, name: 'AMD Radeon RX 7800 XT', price: 145000, power: 263 }
    ],
    storage: [
      { id: 1, name: 'Samsung 990 Pro 2TB NVMe SSD', price: 48000, capacity: 2000 },
      { id: 2, name: 'WD Black SN850X 1TB NVMe SSD', price: 28000, capacity: 1000 },
      { id: 3, name: 'Crucial P5 Plus 1TB NVMe SSD', price: 22000, capacity: 1000 },
      { id: 4, name: 'Samsung 870 EVO 2TB SATA SSD', price: 35000, capacity: 2000 },
      { id: 5, name: 'Seagate Barracuda 4TB HDD', price: 18000, capacity: 4000 }
    ],
    psu: [
      { id: 1, name: 'Corsair RM1000x 1000W 80+ Gold', price: 42000, wattage: 1000 },
      { id: 2, name: 'EVGA SuperNOVA 850W 80+ Platinum', price: 35000, wattage: 850 },
      { id: 3, name: 'Seasonic Focus GX-750 750W 80+ Gold', price: 28000, wattage: 750 },
      { id: 4, name: 'Corsair RM850e 850W 80+ Gold', price: 32000, wattage: 850 },
      { id: 5, name: 'be quiet! Straight Power 11 650W', price: 25000, wattage: 650 }
    ],
    case: [
      { id: 1, name: 'Lian Li O11 Dynamic EVO', price: 38000 },
      { id: 2, name: 'NZXT H7 Flow', price: 32000 },
      { id: 3, name: 'Corsair 4000D Airflow', price: 25000 },
      { id: 4, name: 'Fractal Design Torrent', price: 42000 },
      { id: 5, name: 'Cooler Master H500', price: 28000 }
    ],
    cooling: [
      { id: 1, name: 'NZXT Kraken Z73 360mm AIO', price: 58000 },
      { id: 2, name: 'Corsair iCUE H150i Elite 360mm AIO', price: 48000 },
      { id: 3, name: 'Arctic Liquid Freezer II 280mm AIO', price: 32000 },
      { id: 4, name: 'Noctua NH-D15 Air Cooler', price: 28000 },
      { id: 5, name: 'be quiet! Dark Rock Pro 4', price: 24000 }
    ]
  };

  const componentIcons = {
    cpu: Cpu,
    motherboard: Monitor,
    ram: Zap,
    gpu: Monitor,
    storage: HardDrive,
    psu: Zap,
    case: Box,
    cooling: Fan
  };

  const componentLabels = {
    cpu: 'Processor (CPU)',
    motherboard: 'Motherboard',
    ram: 'Memory (RAM)',
    gpu: 'Graphics Card (GPU)',
    storage: 'Storage',
    psu: 'Power Supply (PSU)',
    case: 'PC Case',
    cooling: 'Cooling System'
  };

  useEffect(() => {
    const total = Object.values(selectedComponents).reduce((sum, component) => {
      return sum + (component?.price || 0);
    }, 0);
    setTotalPrice(total);
  }, [selectedComponents]);

  const handleComponentSelect = (category, component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: component
    }));
  };

  const handleComponentRemove = (category) => {
    setSelectedComponents(prev => ({
      ...prev,
      [category]: null
    }));
  };

  const checkCompatibility = () => {
    const issues = [];
    
    if (selectedComponents.cpu && selectedComponents.motherboard) {
      if (selectedComponents.cpu.socket !== selectedComponents.motherboard.socket) {
        issues.push('⚠️ CPU සහ Motherboard sockets compatible නෑ!');
      }
    }

    if (selectedComponents.cpu && selectedComponents.psu) {
      const totalPower = (selectedComponents.cpu?.tdp || 0) + 
                        (selectedComponents.gpu?.power || 0) + 100;
      if (totalPower > selectedComponents.psu.wattage) {
        issues.push('⚠️ PSU wattage අඩුයි! වැඩි power supply එකක් තෝරන්න.');
      }
    }

    return issues;
  };

  const compatibilityIssues = checkCompatibility();

  const handleSaveBuild = () => {
    const buildData = {
      components: selectedComponents,
      total: totalPrice,
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem('pcBuild', JSON.stringify(buildData));
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-white text-black px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold border-2 border-amber-500';
    toast.innerHTML = '✓ Build saved successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleShareBuild = () => {
    const buildText = Object.entries(selectedComponents)
      .filter(([_, comp]) => comp)
      .map(([cat, comp]) => `${componentLabels[cat]}: ${comp.name}`)
      .join('\n');
    
    navigator.clipboard.writeText(`My PC Build from Dumo Computers:\n\n${buildText}\n\nTotal: LKR ${totalPrice.toLocaleString()}`);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-white text-black px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold border-2 border-amber-500';
    toast.innerHTML = '✓ Build copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleAddToCart = () => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-24 right-6 bg-white text-black px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold border-2 border-amber-500';
    toast.innerHTML = '✓ All items added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden bg-black py-20 px-6 border-b-2 border-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Package className="w-12 h-12 text-white" />
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
              PC BUILDER
            </h1>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-bold">
            Build Your Dream Gaming PC
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-amber-500 hover:scale-105 transition-all">
                <CheckCircle className="w-5 h-5" />
                <span>Compatibility Check</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-amber-500 hover:scale-105 transition-all">
                <Zap className="w-5 h-5" />
                <span>Real-time Pricing</span>
              </div>
            </div>

            <div className="text-right bg-white text-black px-8 py-4 rounded-xl border-4 border-white">
              <p className="text-sm font-bold text-gray-700">TOTAL PRICE</p>
              <p className="text-4xl font-black">
                LKR {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility Alerts */}
      {compatibilityIssues.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-white border-4 border-black rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={28} />
              <div>
                <h3 className="font-black text-black text-xl mb-3">COMPATIBILITY ISSUES:</h3>
                {compatibilityIssues.map((issue, idx) => (
                  <p key={idx} className="text-black font-bold text-lg mb-1">{issue}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Component Selection */}
        <div className="space-y-8">
          {Object.entries(components).map(([category, items]) => {
            const Icon = componentIcons[category];
            const selected = selectedComponents[category];

            return (
              <div key={category} className="bg-black rounded-2xl border-2 border-white overflow-hidden hover:border-amber-500 transition-all">
                <div className="bg-white text-black px-6 py-4 flex items-center justify-between border-b-2 border-black">
                  <div className="flex items-center gap-3">
                    <Icon size={28} className="text-black" />
                    <h2 className="text-2xl font-black">{componentLabels[category]}</h2>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-3">
                      <span className="bg-black text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                        <CheckCircle size={16} />
                        SELECTED
                      </span>
                      <button
                        onClick={() => handleComponentRemove(category)}
                        className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-black hover:bg-red-700 flex items-center gap-2 transition-all"
                      >
                        <Trash2 size={16} />
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleComponentSelect(category, item)}
                        className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                          selected?.id === item.id
                            ? 'bg-white text-black border-black shadow-xl'
                            : 'bg-black text-white border-white hover:bg-white hover:text-black hover:border-amber-500'
                        }`}
                      >
                        <Package className={`w-12 h-12 mb-3 transition-all ${
                          selected?.id === item.id ? 'text-black' : 'text-white group-hover:text-black'
                        }`} />
                        
                        <h3 className="font-black mb-3 text-base">{item.name}</h3>
                        
                        <p className="text-3xl font-black mb-3">
                          LKR {item.price.toLocaleString()}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 text-xs font-bold">
                          {item.socket && (
                            <span className={`px-3 py-1 rounded-full border-2 ${
                              selected?.id === item.id 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-black border-white group-hover:bg-black group-hover:text-white'
                            }`}>
                              {item.socket}
                            </span>
                          )}
                          {item.wattage && (
                            <span className={`px-3 py-1 rounded-full border-2 ${
                              selected?.id === item.id 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-black border-white group-hover:bg-black group-hover:text-white'
                            }`}>
                              {item.wattage}W
                            </span>
                          )}
                          {item.capacity && (
                            <span className={`px-3 py-1 rounded-full border-2 ${
                              selected?.id === item.id 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-black border-white group-hover:bg-black group-hover:text-white'
                            }`}>
                              {item.capacity}GB
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 sticky bottom-6 bg-white rounded-2xl border-4 border-black p-6 shadow-2xl">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-xl font-black transition-all hover:bg-amber-500 hover:scale-105 border-2 border-black"
            >
              <Box size={20} />
              {showSummary ? 'HIDE SUMMARY' : 'VIEW SUMMARY'}
            </button>
            
            <button
              onClick={handleSaveBuild}
              disabled={totalPrice === 0}
              className="flex items-center gap-2 px-8 py-4 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-black transition-all hover:bg-amber-500 hover:scale-105 border-2 border-black"
            >
              <Save size={20} />
              SAVE BUILD
            </button>
            
            <button
              onClick={handleShareBuild}
              disabled={totalPrice === 0}
              className="flex items-center gap-2 px-8 py-4 bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-black transition-all hover:bg-amber-500 hover:scale-105 border-2 border-black"
            >
              <Share2 size={20} />
              SHARE BUILD
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={totalPrice === 0}
              className="flex items-center gap-2 px-8 py-4 bg-amber-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed rounded-xl font-black transition-all hover:bg-amber-600 hover:scale-105 border-2 border-black shadow-lg"
            >
              <ShoppingCart size={20} />
              ADD ALL TO CART
            </button>
          </div>
        </div>

        {/* Build Summary */}
        {showSummary && (
          <div className="mt-8 bg-black rounded-2xl border-2 border-white p-8">
            <h2 className="text-4xl font-black mb-6 text-white flex items-center gap-3">
              <Package className="w-10 h-10" />
              BUILD SUMMARY
            </h2>
            
            {Object.values(selectedComponents).every(comp => !comp) ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-xl font-bold text-gray-400">No components selected yet!</p>
                <p className="text-gray-600 mt-2">Start building your dream PC above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(selectedComponents).map(([category, component]) => (
                  component && (
                    <div key={category} className="flex justify-between items-center p-4 bg-white text-black rounded-xl border-2 border-black hover:border-amber-500 transition-all">
                      <div>
                        <p className="text-sm font-bold text-gray-700">{componentLabels[category]}</p>
                        <p className="font-black text-lg">{component.name}</p>
                      </div>
                      <p className="text-2xl font-black">
                        LKR {component.price.toLocaleString()}
                      </p>
                    </div>
                  )
                ))}
                
                <div className="border-t-4 border-white pt-6 mt-6">
                  <div className="flex justify-between items-center bg-white text-black p-6 rounded-xl border-4 border-black">
                    <span className="text-2xl font-black">TOTAL PRICE:</span>
                    <span className="text-4xl font-black text-amber-600">LKR {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-white text-black py-20 px-6 mt-12 border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <Package className="w-20 h-20 text-black mx-auto mb-6" />
          <h3 className="text-5xl font-black mb-6">
            Need Help Building?
          </h3>
          <p className="text-gray-700 mb-8 text-xl font-bold">
            Our experts are ready to assist you with custom PC builds
          </p>
          <button className="px-12 py-5 bg-black text-white rounded-xl font-black text-xl hover:bg-amber-500 hover:scale-105 transition-all border-4 border-black shadow-2xl">
            Contact Us on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;