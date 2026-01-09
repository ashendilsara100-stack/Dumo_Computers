import React, { useState, useEffect } from 'react';
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { 
  Trash2, Calendar, Box, ChevronRight, LayoutGrid, 
  Cpu, Monitor, Zap, HardDrive, Fan, AlertCircle, ArrowLeft 
} from 'lucide-react';
import SpaceBackground from "../components/SpaceBackground";

const MyBuilds = ({ setPage, setSelectedComponents }) => { // <--- setSelectedComponents එකතු කළා
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "savedBuilds"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribeBuilds = onSnapshot(q, (snapshot) => {
          setBuilds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setLoading(false);
        });

        return () => unsubscribeBuilds();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  // Build එක PC Builder එකට load කරන function එක
  const handleLoadBuild = (build) => {
    if (setSelectedComponents) {
      // සේව් කරපු පාට්ස් ටික builder එකේ state එකට දානවා
      setSelectedComponents(build.components);
      // Builder පේජ් එකට යවනවා
      setPage('builder');
      
      // පොඩි Toast මැසේජ් එකක් පෙන්වන්න (Optional)
      const t = document.createElement('div');
      t.className = `fixed top-24 right-6 bg-amber-500 text-black px-8 py-4 rounded-2xl shadow-2xl z-[150] font-black border-2 border-black uppercase italic animate-bounce`;
      t.innerHTML = "BUILD LOADED SUCCESSFULLY!";
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS BUILD?")) {
      try {
        await deleteDoc(doc(db, "savedBuilds", id));
      } catch (error) {
        console.error("Delete Error:", error);
      }
    }
  };

  const componentIcons = { 
    cpu: Cpu, motherboard: Monitor, ram: Zap, gpu: Monitor, 
    storage: HardDrive, psu: Zap, case: Box, cooling: Fan 
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin text-amber-500"><Zap size={40} /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      <SpaceBackground />
      
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <button 
              onClick={() => setPage('builder')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-black uppercase italic text-xs mb-4"
            >
              <ArrowLeft size={16} /> Back to Builder
            </button>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              MY <span className="text-amber-500">BUILDS</span>
            </h1>
          </div>
          <div className="bg-zinc-900/50 border border-white/10 px-6 py-4 rounded-3xl backdrop-blur-xl">
            <p className="text-[10px] text-zinc-500 font-black uppercase italic">Saved Projects</p>
            <p className="text-3xl font-black text-white italic">{builds.length}</p>
          </div>
        </div>

        {!user ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-[40px] border-2 border-dashed border-white/5">
            <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-black italic uppercase">Please Login to View Your Builds</h2>
          </div>
        ) : builds.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-[40px] border-2 border-dashed border-white/5">
            <LayoutGrid size={48} className="mx-auto mb-4 text-zinc-700" />
            <h2 className="text-2xl font-black italic uppercase text-zinc-500">No Saved Builds Yet</h2>
            <button onClick={() => setPage('builder')} className="mt-6 bg-white text-black px-8 py-3 rounded-xl font-black uppercase italic hover:bg-amber-500 transition-all">Start Building</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {builds.map((build) => (
              <div key={build.id} className="bg-zinc-900/40 border-2 border-white/5 hover:border-amber-500/30 rounded-[40px] p-8 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase italic mb-2">
                      <Calendar size={12} /> {build.createdAt?.toDate() ? new Date(build.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </div>
                    <h3 className="text-2xl font-black italic uppercase group-hover:text-amber-500 transition-colors">{build.buildName}</h3>
                  </div>
                  <button 
                    onClick={() => handleDelete(build.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Components Summary Icons */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {Object.entries(build.components).map(([key, val]) => (
                    val && (
                      <div key={key} className="w-10 h-10 bg-black/50 rounded-xl flex items-center justify-center border border-white/5 text-zinc-500" title={val.name}>
                        {React.createElement(componentIcons[key] || Box, { size: 18 })}
                      </div>
                    )
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase italic">Total Value</p>
                    <p className="text-2xl font-black text-white italic">LKR {build.totalPrice?.toLocaleString()}</p>
                  </div>
                  
                  {/* View Details බටන් එක Edit Build විදිහට වෙනස් කරලා load logic එක දැම්මා */}
                  <button 
                    onClick={() => handleLoadBuild(build)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-black uppercase italic text-xs hover:bg-amber-500 transition-all active:scale-95"
                  >
                    Load to Builder <ChevronRight size={16} />
                  </button>
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-4 -right-4 text-white/5 font-black italic text-8xl pointer-events-none">
                  #{build.id.slice(0,3).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBuilds;