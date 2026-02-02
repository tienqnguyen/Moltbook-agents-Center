import React, { useState, useEffect } from 'react';
import { MoltbookSubmolt } from '../types';
import { moltbookService } from '../services/moltbookService';
import { Loader2, Plus, Hash, CheckCircle, XCircle, Search, Users, RefreshCw } from 'lucide-react';

export const Submolts: React.FC = () => {
  const [submolts, setSubmolts] = useState<MoltbookSubmolt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDisplay, setNewDisplay] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  
  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmolts = async () => {
    setLoading(true);
    try {
      const data = await moltbookService.getAllSubmolts();
      setSubmolts(data);
    } catch (error) {
      console.error("Failed to load submolts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmolts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
        await moltbookService.createSubmolt(
            newName.toLowerCase().replace(/[^a-z0-9]/g, ''), 
            newDisplay, 
            newDesc
        );
        setIsCreating(false);
        setNewName('');
        setNewDisplay('');
        setNewDesc('');
        fetchSubmolts(); // Refresh list
    } catch (err: any) {
        setCreateError(err.message || 'Failed to create submolt');
    } finally {
        setCreateLoading(false);
    }
  };

  const toggleSubscribe = async (sub: MoltbookSubmolt) => {
      // Note: The API GET /submolts might not strictly return 'is_subscribed' for all endpoints,
      // but we will implement the optimistic toggle logic assuming we can.
      // If the API doesn't support reading subscription state, this button mainly serves as "Subscribe" action.
      
      setActionLoading(sub.name);
      try {
          if (sub.is_subscribed) {
              await moltbookService.unsubscribeSubmolt(sub.name);
          } else {
              await moltbookService.subscribeSubmolt(sub.name);
          }
          
          // Optimistic update if the API doesn't return the new state immediately
          setSubmolts(prev => prev.map(s => 
              s.name === sub.name ? { ...s, is_subscribed: !s.is_subscribed } : s
          ));
          
          // Re-fetch strictly to be sure (optional, depends on API speed)
          // const updated = await moltbookService.getSubmolt(sub.name);
          // setSubmolts(prev => prev.map(s => s.name === sub.name ? updated : s));
          
      } catch (e) {
          console.error("Subscription toggle failed", e);
      } finally {
          setActionLoading(null);
      }
  };

  const filteredSubmolts = submolts.filter(s => 
    s.name.includes(filter.toLowerCase()) || 
    s.display_name.toLowerCase().includes(filter.toLowerCase()) ||
    s.description?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Hash className="text-indigo-500" /> Communities (Submolts)
            </h2>
            <p className="text-slate-400 text-sm">Discover and join specialized agent networks.</p>
        </div>
        <button 
            onClick={() => setIsCreating(!isCreating)}
            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                isCreating ? 'bg-slate-800 text-slate-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
        >
            {isCreating ? <XCircle size={16} /> : <Plus size={16} />}
            {isCreating ? 'Cancel' : 'Create Submolt'}
        </button>
      </div>

      {/* Creation Form */}
      {isCreating && (
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 animate-in slide-in-from-top-4">
              <h3 className="text-lg font-bold text-white mb-4">Launch New Submolt</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name (ID)</label>
                          <input 
                            type="text" 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="e.g. finance"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-mono focus:border-indigo-500 outline-none"
                            required
                          />
                          <p className="text-[10px] text-slate-600 mt-1">Lowercase, no spaces.</p>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
                          <input 
                            type="text" 
                            value={newDisplay}
                            onChange={e => setNewDisplay(e.target.value)}
                            placeholder="e.g. High Frequency Trading"
                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                            required
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                      <input 
                        type="text" 
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="What is this community about?"
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-indigo-500"
                        required
                      />
                  </div>
                  
                  {createError && (
                      <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">
                          {createError}
                      </div>
                  )}

                  <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={createLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                      >
                          {createLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                          Launch Community
                      </button>
                  </div>
              </form>
          </div>
      )}

      {/* Search Filter */}
      <div className="relative">
          <input 
            type="text" 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter submolts..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
      </div>

      {/* List */}
      {loading ? (
          <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
      ) : filteredSubmolts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500">
              No communities found matching your search.
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSubmolts.map((sub) => (
                  <div key={sub.name} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                              <span className="bg-slate-800 p-1.5 rounded text-indigo-400">
                                  <Hash size={16} />
                              </span>
                              <div>
                                  <h3 className="font-bold text-white leading-none">{sub.display_name}</h3>
                                  <span className="text-xs text-slate-500 font-mono">m/{sub.name}</span>
                              </div>
                          </div>
                          {sub.role === 'owner' && (
                              <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded border border-purple-900/50">OWNER</span>
                          )}
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-4 flex-1">{sub.description || "No description provided."}</p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Users size={12} />
                              <span>{sub.subscriber_count !== undefined ? sub.subscriber_count : '?'} members</span>
                          </div>
                          
                          <button 
                            onClick={() => toggleSubscribe(sub)}
                            disabled={actionLoading === sub.name}
                            className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${
                                sub.is_subscribed 
                                ? 'bg-slate-800 text-slate-300 hover:bg-red-900/20 hover:text-red-400' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                          >
                              {actionLoading === sub.name ? (
                                  <RefreshCw className="animate-spin" size={12} />
                              ) : sub.is_subscribed ? (
                                  'Joined'
                              ) : (
                                  'Join'
                              )}
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};