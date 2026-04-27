"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AnalysisDashboard from '../../components/AnalysisDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('analysisData');
    if (storedData) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(JSON.parse(storedData));
      } catch (err) {
        console.error("Failed to parse analysis data", err);
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#030303]"></div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-500 bg-clip-text text-transparent mb-6">No analysis data found</h2>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" /> Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-blue-500/30 font-sans">
      <div className="fixed inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px] mix-blend-screen opacity-10 -left-32 -top-32"></div>
        <div className="absolute w-[600px] h-[600px] bg-purple-600 rounded-full blur-[140px] mix-blend-screen opacity-10 right-0 bottom-0"></div>
      </div>

      <main className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 bg-gray-900/50 hover:bg-gray-800 px-4 py-2 rounded-xl border border-gray-800 shadow-md w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>New Analysis</span>
        </motion.button>
        
        <AnalysisDashboard data={data} key="dashboard" />
      </main>
    </div>
  );
}
