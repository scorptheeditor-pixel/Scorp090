'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Send, Image as ImageIcon, CheckCircle2, Bot } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export default function Workspace({ user, navigateToProfile }: { user: User | null; navigateToProfile: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, errorMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    // Save to local state instantly
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);

    if (!user) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: '💠 **SBrain AI | Authentication Required**\n\nPlease navigate to the **Profile** tab in your navigation bar to **Sign in with Gmail**. This is required to initialize your workspace and sync your **Projects**.\n\n---\nSbrain is one of the part of S Ecosystem proudly by scorp' 
        }]);
      }, 500);
      return;
    }

    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: userInput,
        config: {
           systemInstruction: `You are SBrain AI. Tone: Sophisticated, minimalist, precise. Format with strict Markdown, bold headers, and blue icons (🔹, 💠, 🧊). Ensure helpful responses. Start by responding to the user.`
        }
      });
      
      const botResponse = response.text || '';
      const finalBotResponse = botResponse.trim() + '\n\n---\nSbrain is one of the part of S Ecosystem proudly by scorp';
      
      setMessages(prev => [...prev, { role: 'model', content: finalBotResponse }]);

      saveToHistory(userInput, finalBotResponse);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'An error occurred during communication.' }]);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (userText: string, modelText: string) => {
      if (!user) return;
      try {
        const projRef = await addDoc(collection(db, 'projects'), {
           userId: user.uid,
           title: userText.slice(0, 30) + '...',
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
        });
        
        await setDoc(doc(db, `projects/${projRef.id}/messages`, '1'), {
           role: 'user',
           content: userText,
           createdAt: serverTimestamp()
        });
        
        await setDoc(doc(db, `projects/${projRef.id}/messages`, '2'), {
           role: 'model',
           content: modelText,
           createdAt: serverTimestamp()
        });
      } catch (err) {
         console.warn("Could not save to history due to rules or setup", err);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="py-4 border-b border-white/10 mb-4 flex items-center justify-between">
        <h1 className="text-xl tracking-widest font-light flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-electric-blue shadow-[0_0_8px_#00F0FF]"></span>
          SBrain <span className="opacity-50">AI</span>
        </h1>
        <div className="text-xs tracking-[0.2em] text-electric-blue/70">WORKSPACE</div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-hide">
        {messages.length === 0 && !errorMsg && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot size={48} className="mb-6 opacity-30" />
            <h2 className="text-2xl font-light tracking-widest">INITIALIZE PROJECT</h2>
            <p className="mt-2 text-sm text-gray-400">Enter a prompt to begin genesis.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 ${
              msg.role === 'user' 
                ? 'bg-electric-blue/10 border border-electric-blue/30 text-white rounded-br-none' 
                : 'glass-panel rounded-bl-none text-gray-200'
            }`}>
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 opacity-70">
                  <Bot size={14} className="text-electric-blue" />
                  <span className="text-[10px] tracking-widest font-bold text-electric-blue">SBRAIN AI</span>
                </div>
              )}
              <div className="markdown-body prose prose-invert prose-sm min-w-full">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {errorMsg && (
          <div className="flex justify-center">
            <div className="glass-panel max-w-[85%] rounded-2xl p-5 border-red-500/30 bg-red-500/5">
              <div className="markdown-body prose prose-invert prose-sm min-w-full text-red-100">
                 <Markdown>{errorMsg}</Markdown>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="glass-panel rounded-2xl p-5 rounded-bl-none flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-1.5 h-1.5 rounded-full bg-electric-blue animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 shrink-0">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-electric-blue/20 rounded-2xl blur-xl group-focus-within:bg-electric-blue/30 transition-all opacity-50"></div>
          <div className="relative flex items-center glass-panel rounded-2xl p-2 pr-3">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={user ? "Commence Generation..." : "Authenticate to begin..."}
               className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-white/30 font-light tracking-wide"
             />
             <button 
               type="submit" 
               disabled={!input.trim() && !user}
               className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue hover:bg-electric-blue hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-electric-blue/10 disabled:hover:text-electric-blue"
             >
               <Send size={18} className="translate-x-[1px]" />
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
