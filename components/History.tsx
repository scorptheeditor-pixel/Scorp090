'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Archive, Clock, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function History({ user, onSelectProject }: { user: User | null; onSelectProject: (id: string) => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'projects'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setProjects(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center opacity-50">
         <Archive size={48} className="mb-6 opacity-30" />
         <h2 className="text-2xl font-light tracking-widest">ARCHIVE LOCKED</h2>
         <p className="mt-2 text-sm text-gray-400">Authentication required to access History.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="py-4 border-b border-white/10 mb-6 flex items-center justify-between">
        <h1 className="text-xl tracking-widest font-light flex items-center gap-3">
          <Archive size={20} className="opacity-50" />
          HISTORY <span className="opacity-50">ARCHIVE</span>
        </h1>
        <div className="text-xs tracking-[0.2em] text-electric-blue/70">{projects.length} RECORDS</div>
      </div>

      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="w-6 h-6 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
           <Clock size={48} className="mb-6 opacity-30" />
           <h2 className="text-xl font-light tracking-widest">NO HISTORY FOUND</h2>
           <p className="mt-2 text-sm text-gray-400">Initialize a project in the AI workspace.</p>
        </div>
      ) : (
        <div className="grid gap-4 pr-2 pb-6 overflow-y-auto scrollbar-hide">
          {projects.map((proj) => (
             <div 
               key={proj.id} 
               onClick={() => onSelectProject(proj.id)}
               className="glass-panel p-5 rounded-2xl flex flex-col gap-2 cursor-pointer hover:bg-white/10 transition-colors group"
             >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg leading-tight truncate group-hover:text-electric-blue transition-colors">
                    {proj.title}
                  </h3>
                  <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-electric-blue shrink-0" />
                </div>
                <div className="flex items-center text-xs text-gray-500 font-mono tracking-widest">
                  {proj.updatedAt ? format(proj.updatedAt.toDate(), "MMM dd, yyyy • HH:mm") : "UNKNOWN TIME"}
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
