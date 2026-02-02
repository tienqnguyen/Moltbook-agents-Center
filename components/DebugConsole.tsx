import React, { useRef, useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface DebugConsoleProps {
  logs: LogEntry[];
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  const [selectedLogIndex, setSelectedLogIndex] = useState<number>(0);

  // Auto-select newest log when logs update
  useEffect(() => {
    if (logs.length > 0) {
      setSelectedLogIndex(0);
    }
  }, [logs]);

  const activeLog = logs.length > 0 && logs[selectedLogIndex] ? logs[selectedLogIndex] : null;

  return (
    <div className={`border-t border-slate-700 bg-[#0d1117] flex flex-col font-mono text-xs transition-all duration-300 ease-in-out ${isExpanded ? 'h-64 md:h-56' : 'h-8'}`}>
      
      {/* Header Bar */}
      <div 
        className="flex items-center px-4 py-1 bg-slate-800 border-b border-slate-700 text-slate-400 select-none cursor-pointer hover:bg-slate-700 transition-colors shrink-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Terminal size={12} className="mr-2" />
        <span className="font-bold">DEBUG CONSOLE / JSON OUTPUT</span>
        
        <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
                <span>{logs.length} events</span>
                <span className={`w-2 h-2 rounded-full ${logs.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
            </div>
            <div className="border-l border-slate-600 pl-3">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
        </div>
      </div>
      
      {/* Content Area */}
      {isExpanded && (
        <div className="flex-1 flex overflow-hidden animate-in fade-in duration-300">
            {/* Log List Sidebar */}
            <div className="w-1/3 md:w-1/4 border-r border-slate-700 overflow-y-auto bg-[#0a0c10]">
                {logs.length === 0 && <div className="p-4 text-slate-600 italic text-center">No logs yet...</div>}
                {logs.map((log, idx) => (
                    <div 
                        key={idx} 
                        onClick={(e) => { e.stopPropagation(); setSelectedLogIndex(idx); }}
                        className={`p-2 border-b border-slate-800/50 cursor-pointer truncate transition-colors ${
                            selectedLogIndex === idx ? 'bg-indigo-900/30 text-indigo-300 border-l-2 border-l-indigo-500' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                        }`}
                    >
                        <div className="flex justify-between items-center text-[10px] opacity-70 mb-0.5">
                            <span>{log.timestamp}</span>
                            {log.source.startsWith('ERR') && <span className="text-red-500 font-bold">ERR</span>}
                            {log.source.startsWith('REQ') && <span className="text-blue-400">REQ</span>}
                            {log.source.startsWith('RES') && <span className="text-green-400">RES</span>}
                        </div>
                        <div className="font-bold truncate text-[10px] md:text-xs" title={log.source}>
                            {log.source.replace(/^(REQ|RES|ERR|FAIL): /, '')}
                        </div>
                    </div>
                ))}
            </div>

            {/* JSON Viewer */}
            <div className="flex-1 overflow-auto p-4 bg-[#0d1117]">
                {activeLog ? (
                    <div className="space-y-2 animate-in slide-in-from-right-1 duration-200">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                                {activeLog.source}
                            </span>
                            <span className="text-slate-500">{activeLog.timestamp}</span>
                        </div>
                        <pre className="text-green-400 font-mono text-[10px] md:text-xs whitespace-pre-wrap break-all">
                            {JSON.stringify(activeLog.data, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-600 opacity-50">
                        Select a log entry to inspect payload
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
      )}
    </div>
  );
};