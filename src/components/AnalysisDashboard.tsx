/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion } from 'framer-motion';
import { 
  FileText, FolderTree, Activity, FileCode2,
  Workflow, BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisData {
  project: string | string[];
  structure: string | string[];
  features: string | string[];
  keyFiles: string | string[];
  dataFlow: string | string[];
  summary: string | string[];
  [key: string]: any;
}

export default function AnalysisDashboard({ data }: { data: AnalysisData }) {
  const cards = [
    {
      title: "1. Project Overview",
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      content: data.project,
      delay: 0.1
    },
    {
      title: "2. Structure",
      icon: <FolderTree className="w-5 h-5 text-emerald-400" />,
      content: data.structure,
      delay: 0.15
    },
    {
      title: "3. Features",
      icon: <Activity className="w-5 h-5 text-purple-400" />,
      content: data.features,
      delay: 0.2
    },
    {
      title: "4. Key Files",
      icon: <FileCode2 className="w-5 h-5 text-orange-400" />,
      content: data.keyFiles,
      delay: 0.25
    },
    {
      title: "5. Data Flow",
      icon: <Workflow className="w-5 h-5 text-pink-400" />,
      content: data.dataFlow,
      delay: 0.3
    },
    {
      title: "6. Summary",
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      content: data.summary,
      delay: 0.35
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto mt-16 pb-24">
      {cards.map((card, idx) => (
        <motion.div
           key={idx}
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: card.delay }}
           className="bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors shadow-2xl flex flex-col h-full"
        >
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-800">
             <div className="p-2.5 bg-gray-800 rounded-xl">
                {card.icon}
             </div>
             <h3 className="text-lg font-semibold text-white tracking-wide">{card.title}</h3>
          </div>
          <div className="leading-relaxed text-[14px] flex-grow overflow-y-auto custom-scrollbar pr-2">
             <ReactMarkdown
               components={{
                 ul: ({node: _node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                 ol: ({node: _node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                 li: ({node: _node, ...props}) => <li className="text-gray-300 marker:text-gray-500" {...props} />,
                 p: ({node: _node, ...props}) => <p className="mb-3 text-gray-300" {...props} />,
                 strong: ({node: _node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                 a: ({node: _node, ...props}) => <a className="text-blue-400 hover:underline" {...props} />
               }}
             >
               {typeof card.content === 'string'
                 ? card.content
                 : Array.isArray(card.content)
                 ? card.content.map(opt => typeof opt === 'string' && opt.trim().startsWith('-') ? opt : `- ${opt}`).join('\n')
                 : JSON.stringify(card.content || '')}
             </ReactMarkdown>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
