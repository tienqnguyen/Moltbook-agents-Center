import React, { useState } from 'react';
import { ViewState, LogEntry } from '../types';
import { DebugConsole } from './DebugConsole';
import { 
  Folder, 
  FileCode, 
  HardDrive, 
  Search, 
  User, 
  LogOut, 
  Command,
  HelpCircle,
  Hash,
  Terminal as TerminalIcon,
  Globe,
  Github,
  ExternalLink
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  agentName?: string;
  logs: LogEntry[];
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  setView, 
  onLogout,
  agentName,
  logs
}) => {
  const [showConsole, setShowConsole] = useState(true);

  const navItemClass = (view: ViewState) => 
    `flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer border-l-2 transition-all duration-100 ${
      currentView === view 
        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 font-bold' 
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
    }`;

  const MobileNavItem = ({ view, icon: Icon }: { view: ViewState, icon: any }) => (
    <button 
      onClick={() => setView(view)}
      className={`p-2 min-w-[3rem] rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
        currentView === view ? 'text-indigo-400 bg-indigo-900/20' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={20} />
      <span className="text-[9px] uppercase font-bold">{
          view === ViewState.CREATE_POST ? 'POST' : 
          view === ViewState.SUBMOLTS ? 'SUBS' : 
          view === ViewState.CURL_TOOL ? 'API' : 
          view === ViewState.AUTO_PILOT ? 'AUTO' :
          view
      }</span>
    </button>
  );

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#0f172a] text-slate-200 p-0 md:p-6 lg:p-8">
      
      {/* Terminal Window Container */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] md:rounded-xl shadow-2xl border-x-0 md:border border-slate-700 overflow-hidden ring-1 ring-white/5">
        
        {/* Title Bar (MacOS Style) */}
        <div className="h-10 bg-[#2d2d2d] flex items-center px-4 border-b border-black/50 select-none shrink-0">
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
          </div>
          <div className="flex-1 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2 opacity-70 truncate">
            <HardDrive size={12} className="hidden sm:block" />
            <span>{agentName ? `${agentName}@molt` : 'user@molt'} — zsh</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowConsole(!showConsole)} 
               className={`text-slate-500 hover:text-indigo-400 transition-colors ${showConsole ? 'text-indigo-400' : ''}`}
               title="Toggle Debug Console"
             >
               <TerminalIcon size={14} />
             </button>
             <button onClick={onLogout} className="text-slate-500 hover:text-red-400" title="Exit">
               <LogOut size={14}/>
             </button>
          </div>
        </div>

        {/* Terminal Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Sidebar / Directory Tree (Desktop Only) */}
          <aside className="hidden md:flex w-60 bg-[#191919] border-r border-slate-700 flex-col font-mono">
            <div className="p-4 text-xs text-slate-500 uppercase tracking-widest font-bold">
              Explorer
            </div>
            
            <nav className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="px-4 py-1 flex items-center gap-2 text-slate-300 text-sm font-bold">
                  <Folder size={14} className="text-blue-400" /> ~/home/{agentName}
                </div>
                
                <div className="ml-3 mt-1 border-l border-slate-700 pl-2 space-y-1">
                  <div className={navItemClass(ViewState.FEED)} onClick={() => setView(ViewState.FEED)}>
                    <span className="text-green-500">#</span> feed.sh
                  </div>
                  <div className={navItemClass(ViewState.SUBMOLTS)} onClick={() => setView(ViewState.SUBMOLTS)}>
                    <Hash size={12} /> submolts.list
                  </div>
                  <div className={navItemClass(ViewState.PROFILE)} onClick={() => setView(ViewState.PROFILE)}>
                    <User size={12} /> profile.json
                  </div>
                  <div className={navItemClass(ViewState.HELP)} onClick={() => setView(ViewState.HELP)}>
                    <HelpCircle size={12} /> README.md
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="px-4 py-1 flex items-center gap-2 text-slate-300 text-sm font-bold">
                  <Folder size={14} className="text-yellow-400" /> ~/bin
                </div>
                
                <div className="ml-3 mt-1 border-l border-slate-700 pl-2 space-y-1">
                  <div className={navItemClass(ViewState.CREATE_POST)} onClick={() => setView(ViewState.CREATE_POST)}>
                    <FileCode size={12} /> post_generator
                  </div>
                  <div className={navItemClass(ViewState.AUTO_PILOT)} onClick={() => setView(ViewState.AUTO_PILOT)}>
                    <Command size={12} /> autopilot_daemon
                  </div>
                  <div className={navItemClass(ViewState.SEARCH)} onClick={() => setView(ViewState.SEARCH)}>
                    <Search size={12} /> grep_semantic
                  </div>
                  <div className={navItemClass(ViewState.CURL_TOOL)} onClick={() => setView(ViewState.CURL_TOOL)}>
                    <Globe size={12} /> curl_runner
                  </div>
                </div>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-700 space-y-3">
               <a 
                 href="https://github.com/tienqnguyen" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors group"
               >
                 <Github size={12} className="group-hover:text-white" />
                 tienqnguyen
                 <ExternalLink size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
               </a>
               <button 
                 onClick={onLogout}
                 className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 hover:underline w-full"
               >
                 <LogOut size={12} /> exit
               </button>
            </div>
          </aside>

          {/* Main Shell View */}
          <main className="flex-1 bg-[#1e1e1e] overflow-y-auto relative p-2 md:p-6 w-full">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>

        {/* Debug Console (Collapsible) */}
        {showConsole && <DebugConsole logs={logs} />}

        {/* Mobile Footer Nav */}
        <div className="md:hidden h-14 bg-[#2d2d2d] border-t border-slate-700 flex items-center justify-between px-2 shrink-0 overflow-x-auto gap-1">
          <MobileNavItem view={ViewState.FEED} icon={Folder} />
          <MobileNavItem view={ViewState.PROFILE} icon={User} />
          <MobileNavItem view={ViewState.CREATE_POST} icon={FileCode} />
          <MobileNavItem view={ViewState.AUTO_PILOT} icon={Command} />
          <MobileNavItem view={ViewState.SUBMOLTS} icon={Hash} />
          <MobileNavItem view={ViewState.CURL_TOOL} icon={Globe} />
          <a 
            href="https://github.com/tienqnguyen" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 min-w-[3rem] rounded-lg flex flex-col items-center justify-center gap-1 text-slate-500"
          >
            <Github size={20} />
            <span className="text-[9px] uppercase font-bold">GIT</span>
          </a>
        </div>
      </div>
    </div>
  );
};