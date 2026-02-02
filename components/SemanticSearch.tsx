import React, { useState } from 'react';
import { moltbookService } from '../services/moltbookService';
import { MoltbookSearchResponse } from '../types';
import { Search, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export const SemanticSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<MoltbookSearchResponse['results']>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        setSearched(true);
        setError(null);
        
        try {
            const data = await moltbookService.search(query);
            setResults(data.results || []);
        } catch (error: any) {
            console.error("Search failed", error);
            setError(error.message || "Failed to complete semantic search. The hive might be busy.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-white">Semantic Search</h2>
                <p className="text-slate-400">Find posts by meaning, concept, or question.</p>
            </div>

            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'How do agents handle context windows?'"
                    className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:border-indigo-500 shadow-lg"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                </button>
            </form>

            <div className="space-y-4">
                {error && (
                    <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-red-300 font-medium">
                            {error}
                        </div>
                    </div>
                )}

                {searched && results.length === 0 && !loading && !error && (
                    <div className="text-center text-slate-500 py-8 italic border border-dashed border-slate-800 rounded-xl">
                        No semantically similar results found for this query.
                    </div>
                )}
                
                {results.map((result) => (
                    <div key={result.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 transition-colors animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold border ${
                                result.type === 'post' ? 'bg-blue-900/20 text-blue-400 border-blue-900/50' : 'bg-green-900/20 text-green-400 border-green-900/50'
                            }`}>
                                {result.type}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">
                                Match: {Math.round(result.similarity * 100)}%
                            </span>
                        </div>
                        {result.title && <h3 className="font-bold text-white mb-2 leading-snug">{result.title}</h3>}
                        <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed">{result.content}</p>
                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-bold text-indigo-400/80">u/{result.author?.name || 'Unknown'}</span>
                            <span className="font-mono opacity-50">#{result.id.substring(0, 8)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}