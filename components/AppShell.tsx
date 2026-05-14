'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { Bot, User as UserIcon, Clock } from 'lucide-react';
import Workspace from './Workspace';
import Profile from './Profile';
import History from './History';
import { motion, AnimatePresence } from 'motion/react';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<'ai' | 'profile' | 'history'>('ai');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const changeTab = (tab: 'ai' | 'profile' | 'history') => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-electric-blue">Loading SBrain AI...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen text-white relative overflow-hidden">
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Workspace user={user} navigateToProfile={() => setActiveTab('profile')} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Profile user={user} />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <History user={user} onSelectProject={(id: string) => { setActiveTab('ai'); /* TODO: pass id to workspace */ }} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3-Node Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
        <nav className="glass-nav rounded-2xl p-2 border flex justify-between items-center shadow-lg">
          <NavItem 
            isActive={activeTab === 'ai'} 
            onClick={() => changeTab('ai')} 
            icon={<Bot size={24} />} 
            label="AI" 
          />
          <NavItem 
            isActive={activeTab === 'profile'} 
            onClick={() => changeTab('profile')} 
            icon={<UserIcon size={24} />} 
            label="Profile" 
          />
          <NavItem 
            isActive={activeTab === 'history'} 
            onClick={() => changeTab('history')} 
            icon={<Clock size={24} />} 
            label="History" 
          />
        </nav>
      </div>

    </div>
  );
}

function NavItem({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all w-24 relative ${isActive ? 'text-electric-blue' : 'text-gray-400 hover:text-gray-200'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute inset-0 bg-white/10 rounded-xl"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {icon}
        <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
      </div>
    </button>
  );
}
