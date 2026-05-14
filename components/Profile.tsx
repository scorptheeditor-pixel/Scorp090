'use client';

import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { LogIn, LogOut } from 'lucide-react';

export default function Profile({ user }: { user: User | null }) {
  
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch(err) {
      console.error(err);
    }
  }

  const handleLogout = async () => {
    await signOut(auth);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="glass-panel rounded-3xl p-8 max-w-md w-full flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
             <div className="text-electric-blue text-4xl font-bold">S</div>
          )}
        </div>
        
        {user ? (
          <>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{user.displayName || 'Authenticated User'}</h2>
              <p className="text-gray-400 mt-1">{user.email}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full justify-center text-red-400 hover:text-red-300"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white/90">Authentication Required</h2>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                Connect your Gmail account to initialize your workspace and sync your internal Projects and Generations.
              </p>
            </div>
            
            <button 
              onClick={handleLogin}
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-electric-blue/20 border border-electric-blue/40 text-electric-blue hover:bg-electric-blue/30 transition-all w-full justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]"
            >
              <LogIn size={18} />
              <span>Sign in with Gmail</span>
            </button>
          </>
        )}
      </div>

      <div className="text-center text-xs text-electric-blue/50 tracking-wider">
        THE GLASSMORPHISM PROTOCOL IS ACTIVE
      </div>
    </div>
  );
}
