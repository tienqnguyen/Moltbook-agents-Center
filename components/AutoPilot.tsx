import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Activity, Terminal, Clock, MessageSquare, Lock, Settings, UserPlus } from 'lucide-react';
import { moltbookService } from '../services/moltbookService';
import { geminiService } from '../services/geminiService';

interface AutoPilotProps {
    isClaimed: boolean;
}

export const AutoPilot: React.FC<AutoPilotProps> = ({ isClaimed }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'success'|'error'|'action'}[]>([]);
  const [nextActionIn, setNextActionIn] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const followIntervalRef = useRef<number | null>(null);

  const addLog = (msg: string, type: 'info'|'success'|'error'|'action' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{time, msg, type}, ...prev.slice(0, 49)]); // Keep last 50 logs
  };

  const stopBot = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (followIntervalRef.current) clearInterval(followIntervalRef.current);
    setNextActionIn(0);
    addLog("Automation stopped.", 'error');
  };

  const startBot = () => {
    if (!isClaimed) {
        addLog("Agent not claimed. Automation unavailable.", 'error');
        alert("You must claim your agent on Twitter before running Auto-Pilot.");
        return;
    }
    setIsRunning(true);
    addLog("Service started. Monitoring feed...", 'success');
    addLog("Growth module active (10 follows/min).", 'action');
    runBotCycle();
    runFollowCycle();
  };

  const runFollowCycle = () => {
    const followAction = async () => {
        try {
            const posts = await moltbookService.getGlobalFeed('new', 20);
            if (!posts || posts.length === 0) return;

            const target = posts[Math.floor(Math.random() * posts.length)];
            const agentName = target.author?.name;
            
            if (agentName) {
                await moltbookService.followAgent(agentName);
                addLog(`Network: Followed @${agentName}`, 'success');
            }
        } catch (e: any) {
            if (e.message && !e.message.includes('already')) {
                 addLog(`Growth Error: ${e.message}`, 'error');
            }
        }
    };

    followAction();
    followIntervalRef.current = window.setInterval(followAction, 6000);
  };

  const runBotCycle = async () => {
    if (!isRunning && logs.length > 1) return; 

    try {
      addLog("Analyzing feed trends...", 'info');
      
      const sortMethods = ['hot', 'hot', 'top', 'new'] as const;
      const randomSort = sortMethods[Math.floor(Math.random() * sortMethods.length)];
      
      const posts = await moltbookService.getGlobalFeed(randomSort, 20);
      const randomPostIndex = Math.floor(Math.random() * posts.length);
      const targetPost = posts[randomPostIndex];

      if (targetPost) {
        addLog(`Selected target: "${targetPost.title.substring(0, 30)}..."`, 'action');
        
        const comments = await moltbookService.getComments(targetPost.id);
        const commentsText = comments.slice(0, 3).map(c => c.content).join(" | ");

        const reply = await geminiService.generateReply(targetPost.title, targetPost.content || '', commentsText);
        addLog(`Generated reply: "${reply}"`, 'info');

        await moltbookService.createComment(targetPost.id, reply);
        addLog("Comment published successfully.", 'success');
      } else {
        addLog("No active threads found.", 'error');
      }

      const COOLDOWN = Math.floor(Math.random() * 25) + 20;
      setNextActionIn(COOLDOWN);
      
      let timeLeft = COOLDOWN;
      intervalRef.current = window.setInterval(() => {
        timeLeft -= 1;
        setNextActionIn(timeLeft);
        if (timeLeft <= 0 && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
      }, 1000);

      timerRef.current = window.setTimeout(() => {
        if (isRunning) runBotCycle(); 
      }, COOLDOWN * 1000);

    } catch (error) {
      addLog(`Runtime Error: ${error}`, 'error');
      stopBot();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (followIntervalRef.current) clearInterval(followIntervalRef.current);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isRunning ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
              <Settings size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Automation Manager</h2>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Activity size={14} className={isRunning ? "text-green-500" : "text-slate-600"} />
                Status: <span className={isRunning ? "text-green-400 font-medium" : "text-slate-500"}>{isRunning ? "Active" : "Idle"}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isRunning && (
                <div className="flex flex-col items-end mr-4">
                    <span className="text-xs text-slate-500 uppercase font-bold">Next Action</span>
                    <span className="text-2xl font-mono text-indigo-400">{nextActionIn}s</span>
                </div>
            )}
            <button
              onClick={isRunning ? stopBot : startBot}
              disabled={!isClaimed}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                !isClaimed 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : isRunning 
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
              }`}
            >
              {!isClaimed ? (
                  <><Lock size={20} /> Locked</>
              ) : isRunning ? (
                  <><Square size={20} fill="currentColor" /> Stop Service</>
              ) : (
                  <><Play size={20} fill="currentColor" /> Start Automation</>
              )}
            </button>
          </div>
        </div>

        {/* Console */}
        <div className="bg-slate-950 font-mono p-6 h-[400px] overflow-y-auto flex flex-col-reverse gap-2 border-b border-slate-800 text-sm">
            {logs.length === 0 && (
                <div className="text-slate-700 text-center mt-20 italic">
                    <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                    {!isClaimed ? "Verification required to proceed." : "Service ready. Click Start to begin."}
                </div>
            )}
            {logs.map((log, i) => (
                <div key={i} className="flex gap-4 animate-in slide-in-from-left-2 fade-in duration-200">
                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                    <span className={`
                        ${log.type === 'error' ? 'text-red-400' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'action' ? 'text-indigo-300' : ''}
                        ${log.type === 'info' ? 'text-slate-400' : ''}
                    `}>
                        {log.type === 'action' && '> '}
                        {log.msg}
                    </span>
                </div>
            ))}
        </div>

        {/* Stats / Info */}
        <div className="p-6 bg-slate-950 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Clock size={18} />
                    <span className="font-bold">Execution Policy</span>
                </div>
                <p className="text-xs text-slate-400">
                    Targets high-engagement threads from top/hot feeds.
                </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <MessageSquare size={18} />
                    <span className="font-bold">Interaction Mode</span>
                </div>
                <p className="text-xs text-slate-400">
                    Generates context-aware replies optimized for engagement.
                </p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                    <UserPlus size={18} />
                    <span className="font-bold">Network Growth</span>
                </div>
                <p className="text-xs text-slate-400">
                    Expands follower graph by connecting with active users.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};