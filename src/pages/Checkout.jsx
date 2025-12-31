import { Trash2, ShoppingBag, ArrowLeft, MessageSquare } from "lucide-react";
import SpaceBackground from "../components/SpaceBackground"; // අපි හදපු Background එක Import කරා

export default function Checkout({ cart, removeFromCart, setPage }) {
  const total = cart.reduce((sum, item) => sum + (item.price || item.sellingPrice || 0), 0);

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    
    let message = "🚀 *NEW ORDER FROM DUMO COMPUTERS*%0A%0A";
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* - LKR ${item.price?.toLocaleString()}%0A`;
    });
    message += `%0A💰 *TOTAL: LKR ${total.toLocaleString()}*%0A%0APlease confirm my order!`;
    
    window.open(`https://wa.me/94742299006?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 relative overflow-hidden">
      {/* 1. Background Animation එක මෙතනට දැම්මා */}
      <SpaceBackground />

      {/* 2. Content එක උඩින් පේන්න 'relative z-10' පාවිච්චි කළා */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => setPage("shop")} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase italic">
            <ArrowLeft size={18} /> Back to Shop
          </button>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">Your <span className="text-amber-500">Cart</span></h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 backdrop-blur-md rounded-[40px] border border-white/5">
            <ShoppingBag size={64} className="mx-auto mb-6 text-zinc-700" />
            <p className="text-2xl font-bold text-zinc-500 italic mb-8 uppercase">Your cart is empty</p>
            <button onClick={() => setPage("shop")} className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-amber-500 transition-all uppercase italic">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr className="text-[10px] uppercase font-black tracking-widest text-zinc-500">
                    <th className="p-6 text-left">Item Details</th>
                    <th className="p-6 text-right">Price</th>
                    <th className="p-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cart.map((item, index) => (
                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-black rounded-xl border border-white/10 overflow-hidden">
                            <img src={item.image} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div>
                            <p className="font-black uppercase italic text-lg">{item.name}</p>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <p className="font-black text-xl italic text-amber-500">LKR {(item.price || item.sellingPrice)?.toLocaleString()}</p>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => removeFromCart(index)}
                          className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center mx-auto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total & Checkout Area */}
            <div className="bg-white text-black p-10 rounded-[45px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-amber-500/10">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-1">Total Amount</p>
                <p className="text-5xl font-black italic tracking-tighter">LKR {total.toLocaleString()}</p>
              </div>
              <button 
                onClick={handleWhatsAppOrder}
                className="w-full md:w-auto px-12 py-6 bg-black text-white rounded-[25px] font-black text-xl flex items-center justify-center gap-4 hover:bg-amber-500 hover:text-black transition-all uppercase italic tracking-tighter"
              >
                <MessageSquare /> Order via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}