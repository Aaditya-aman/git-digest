"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitBranch, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('github.com')) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Analysis failed. Check logs.');

      sessionStorage.setItem('analysisData', JSON.stringify(resData));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] mix-blend-screen opacity-20 -left-32 -top-32"></div>
        <div className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] mix-blend-screen opacity-20 right-0 bottom-0"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center pt-28 px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
               <GitBranch className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-500 bg-clip-text text-transparent">
              GitDigest <span className="text-blue-500">AI</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Turn any GitHub repository into a simple codebase digest. 
            Powered by Gemini, automatically understand, navigate, and deeply analyze code repositories.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-3xl"
        >
          <form onSubmit={handleAnalyze} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0a0a] border border-gray-800 rounded-2xl p-2 shadow-2xl">
              <Search className="w-6 h-6 text-gray-400 ml-4 hidden sm:block" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent text-white placeholder-gray-600 outline-none px-4 py-4 text-lg"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !url}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Insight
                  </>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
             {error && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="mt-6 overflow-hidden rounded-xl"
               >
                 <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 flex-shrink-0" />
                   <p>{error}</p>
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-32 flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-gray-500" />
                </div>
              </div>
              <div className="text-gray-400 animate-pulse text-lg tracking-wide">
                Ingesting codebase and consulting Gemini...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
