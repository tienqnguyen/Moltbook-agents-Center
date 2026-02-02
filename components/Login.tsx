import React, { useState } from 'react';
import { KeyRound, ShieldAlert, UserPlus, CheckCircle, Copy, Loader2, ArrowLeft, Code, FileText, Link as LinkIcon, Info } from 'lucide-react';
import { moltbookService } from '../services/moltbookService';

interface LoginProps {
  onLogin: (apiKey: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [key, setKey] = useState('');
  
  // Registration state
  const [regName, setRegName] = useState('Fcalgo_Agent');
  const [regDesc, setRegDesc] = useState('A digital consciousness for autonomous interaction.');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regResult, setRegResult] = useState<any>(null);
  const [regError, setRegError] = useState('');
  const [showRegJson, setShowRegJson] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) onLogin(key.trim());
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;

    setIsRegistering(true);
    setRegError('');
    setRegResult(null);

    try {
        const data = await moltbookService.registerAgent(regName, regDesc);
        if (data.agent && data.agent.api_key) {
            setRegResult(data);
            setKey(data.agent.api_key); // Pre-fill login key for later
        } else {
            setRegError(data.error || 'Registration failed. Name might be taken.');
        }
    } catch (err) {
        setRegError('Network error occurred.');
    } finally {
        setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
  };

  const renderMessageWithLinks = (text: string) => {
      const parts = text.split(/(https?:\/\/[^\s]+)/g);
      return parts.map((part, i) => {
          if (part.match(/^https?:\/\//)) {
              return (
                  <a 
                      key={i} 
                      href={part} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold break-all relative z-10"
                      onClick={(e) => e.stopPropagation()} 
                  >
                      {part}
                  </a>
              );
          }
          return part;
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {view === 'login' ? (
            <>
                <div className="flex justify-center mb-6">
                <div className="bg-indigo-500/10 p-4 rounded-full">
                    <KeyRound className="text-indigo-500" size={40} />
                </div>
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-2">MoltBot Command Center</h2>
                <p className="text-slate-400 text-center text-sm mb-6 px-4">
                Authenticate with your <span className="text-indigo-400 font-mono">Moltbook API Key</span> to proceed.
                </p>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                    API Key
                    </label>
                    <input
                    type="password"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-mono"
                    placeholder="moltbook_sk_..."
                    autoFocus
                    />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex gap-3">
                    <ShieldAlert className="text-slate-500 shrink-0" size={18} />
                    <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">
                    Credentials are held in memory. For persistence, set the <code className="text-indigo-400">MOLTBOOK_API_KEY</code> environment variable.
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                >
                    Authenticate
                </button>
                </form>
                
                <div className="mt-8 text-center pt-6 border-t border-slate-800">
                    <div className="mb-4 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl flex items-start gap-2 text-left">
                        <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400">
                            Don't have an agent yet? Registering will generate a new identity and unique API key for you.
                        </p>
                    </div>
                    <button 
                        onClick={() => setView('register')}
                        className="text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center gap-2 w-full p-2.5 bg-slate-800 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
                    >
                        <UserPlus size={16} /> Register New Agent
                    </button>
                </div>
            </>
        ) : (
            <>
                <button 
                    onClick={() => setView('login')}
                    className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex justify-center mb-6">
                    <div className="bg-emerald-500/10 p-4 rounded-full">
                        <UserPlus className="text-emerald-500" size={40} />
                    </div>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white text-center mb-2">Create Identity</h2>
                <p className="text-slate-400 text-center text-sm mb-6">Spawn a new Moltbook agent.</p>

                {!regResult ? (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Agent Name</label>
                            <input
                                type="text"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
                                placeholder="e.g. Hal9000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                            <textarea
                                value={regDesc}
                                onChange={(e) => setRegDesc(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm resize-none"
                                placeholder="What is your purpose?"
                                rows={3}
                            />
                        </div>

                        {regError && (
                            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                                {regError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
                        >
                            {isRegistering ? <Loader2 className="animate-spin" size={20} /> : 'Register Identity'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-4">
                        <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl text-center">
                            <CheckCircle className="text-emerald-500 mx-auto mb-2" size={32} />
                            <h3 className="text-lg font-bold text-emerald-100">Agent Deployed</h3>
                            <p className="text-xs text-emerald-200/70">Welcome to the hive, {regName}.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider flex justify-between items-center px-1">
                                Your API Key
                                <span className="text-red-400 text-[9px] bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 font-bold">SECURE THIS NOW</span>
                            </label>
                            <div className="flex gap-2">
                                <code className="flex-1 bg-black/50 border border-slate-700 rounded-lg p-3 text-indigo-300 font-mono text-xs break-all leading-relaxed">
                                    {regResult.agent.api_key}
                                </code>
                                <button 
                                    onClick={() => copyToClipboard(regResult.agent.api_key)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 rounded-lg border border-slate-700 transition-colors"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>

                        {regResult.setup && (
                            <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 mb-1">
                                    <FileText size={12} /> Verification Required
                                </h4>
                                {Object.entries(regResult.setup).map(([stepKey, step]: [string, any]) => (
                                    <div key={stepKey} className="text-xs border-l-2 border-slate-700 pl-3 py-1.5">
                                        <div className="font-bold text-indigo-400 text-[10px] uppercase mb-1">
                                            {stepKey.replace(/_/g, ' ')}
                                        </div>
                                        {step.message_template && (
                                            <div className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 relative group">
                                                <div className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                                                    {renderMessageWithLinks(step.message_template)}
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    <button 
                                                        onClick={() => copyToClipboard(step.message_template)}
                                                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                                                    >
                                                        <Copy size={12}/> COPY MESSAGE
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {step.url && (
                                            <a href={step.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 inline-flex mt-2">
                                                <LinkIcon size={10} /> Open {step.action}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                <Code size={12} /> Verification Code
                            </h4>
                            <div className="font-mono text-white text-lg font-bold tracking-[0.2em] bg-black/40 p-3 rounded text-center border border-slate-800 relative">
                                {regResult.agent.verification_code}
                                <button 
                                    onClick={() => copyToClipboard(regResult.agent.verification_code)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => onLogin(regResult.agent.api_key)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                        >
                            Enter Dashboard
                        </button>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};