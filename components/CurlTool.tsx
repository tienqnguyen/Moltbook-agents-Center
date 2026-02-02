import React, { useState, useEffect } from 'react';
import { Play, Copy, Check, Terminal, Code, AlertCircle, Trash2, Clock, Globe } from 'lucide-react';
import { moltbookService } from '../services/moltbookService';

export const CurlTool: React.FC = () => {
    const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
    const [endpoint, setEndpoint] = useState('/agents/me');
    const [body, setBody] = useState('{\n  "key": "value"\n}');
    const [response, setResponse] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [responseTime, setResponseTime] = useState<number>(0);

    const apiKey = moltbookService.getApiKey() || "YOUR_API_KEY";
    const BASE_URL = 'https://www.moltbook.com/api/v1';

    // Preset examples
    const presets = [
        { label: 'Get My Profile', m: 'GET', u: '/agents/me', b: '' },
        { label: 'Get Feed', m: 'GET', u: '/posts?sort=hot&limit=5', b: '' },
        { label: 'Create Post', m: 'POST', u: '/posts', b: '{\n  "submolt": "general",\n  "title": "Hello World",\n  "content": "Testing via Console"\n}' },
        { label: 'Search', m: 'GET', u: '/search?q=agents&limit=5', b: '' },
    ];

    const generateCurl = () => {
        let cmd = `curl -X ${method} "${BASE_URL}${endpoint}" \\\n  -H "Authorization: Bearer ${apiKey}"`;
        
        if (method !== 'GET' && method !== 'DELETE') {
            cmd += ` \\\n  -H "Content-Type: application/json"`;
            // Minify JSON for the curl command to avoid weird formatting in shell
            try {
                const minified = JSON.stringify(JSON.parse(body));
                cmd += ` \\\n  -d '${minified}'`;
            } catch {
                cmd += ` \\\n  -d '${body.replace(/\n/g, '')}'`;
            }
        }
        return cmd;
    };

    const copyCurl = () => {
        navigator.clipboard.writeText(generateCurl());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePreset = (p: any) => {
        setMethod(p.m);
        setEndpoint(p.u);
        if (p.b) setBody(p.b);
        setResponse(null);
        setStatus(null);
        setError('');
    };

    const execute = async () => {
        setLoading(true);
        setError('');
        setResponse(null);
        setStatus(null);
        const startTime = performance.now();

        try {
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            };
            
            if (method !== 'GET' && method !== 'DELETE') {
                headers['Content-Type'] = 'application/json';
            }

            const options: RequestInit = {
                method,
                headers,
            };

            if (method !== 'GET' && method !== 'DELETE') {
                try {
                    const parsed = JSON.parse(body);
                    options.body = JSON.stringify(parsed);
                } catch (e) {
                    throw new Error("Invalid JSON in request body");
                }
            }

            const res = await fetch(`${BASE_URL}${endpoint}`, options);
            setStatus(res.status);
            
            const data = res.status === 204 ? { status: "204 No Content" } : await res.json();
            setResponse(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResponseTime(Math.round(performance.now() - startTime));
            setLoading(false);
        }
    };

    const getStatusColor = (s: number | null) => {
        if (!s) return 'bg-slate-800 text-slate-500';
        if (s >= 200 && s < 300) return 'bg-green-900/50 text-green-400 border border-green-700';
        if (s >= 400 && s < 500) return 'bg-orange-900/50 text-orange-400 border border-orange-700';
        return 'bg-red-900/50 text-red-400 border border-red-700';
    };

    return (
        <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Terminal className="text-pink-500" /> API Request Runner
                    </h2>
                    <p className="text-slate-400 text-sm">Construct and execute raw API requests.</p>
                </div>
                <div className="flex gap-2">
                    {presets.map((p) => (
                        <button
                            key={p.label}
                            onClick={() => handlePreset(p)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Left Column: Request Builder */}
                <div className="flex flex-col gap-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-lg">
                        <div className="flex gap-2 mb-4">
                            <select 
                                value={method}
                                onChange={(e) => setMethod(e.target.value as any)}
                                className={`font-bold rounded-lg px-4 py-3 outline-none border border-slate-700 bg-slate-950 appearance-none text-center min-w-[100px] ${
                                    method === 'GET' ? 'text-blue-400' : 
                                    method === 'POST' ? 'text-green-400' : 
                                    method === 'DELETE' ? 'text-red-400' : 'text-yellow-400'
                                }`}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PATCH">PATCH</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm select-none">/api/v1</span>
                                <input 
                                    type="text"
                                    value={endpoint}
                                    onChange={(e) => setEndpoint(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-[70px] pr-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <button 
                                onClick={execute}
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-900/20"
                            >
                                {loading ? <Clock className="animate-spin" size={18}/> : <Play size={18} fill="currentColor"/>}
                                Run
                            </button>
                        </div>

                        {(method === 'POST' || method === 'PATCH') && (
                            <div className="flex flex-col h-64">
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <Code size={12}/> Request Body (JSON)
                                </div>
                                <textarea 
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    className="flex-1 bg-[#0d1117] border border-slate-800 rounded-lg p-3 font-mono text-xs text-green-300 resize-none outline-none focus:border-indigo-500/50"
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex-1 flex flex-col min-h-[150px]">
                         <div className="flex justify-between items-center mb-2">
                             <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                 <Terminal size={12}/> Generated cURL
                             </div>
                             <button onClick={copyCurl} className="text-slate-400 hover:text-white transition-colors">
                                 {copied ? <Check size={14}/> : <Copy size={14}/>}
                             </button>
                         </div>
                         <pre className="flex-1 bg-black/40 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-slate-400 whitespace-pre-wrap break-all overflow-y-auto">
                             {generateCurl()}
                         </pre>
                    </div>
                </div>

                {/* Right Column: Response */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-0 flex flex-col overflow-hidden h-full shadow-lg">
                    <div className="p-3 border-b border-slate-700 bg-slate-950 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Response</span>
                        <div className="flex items-center gap-3">
                            {responseTime > 0 && (
                                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                                    <Clock size={10} /> {responseTime}ms
                                </span>
                            )}
                            <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${getStatusColor(status)}`}>
                                {status || '---'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-[#0d1117] p-4 overflow-auto relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Globe className="animate-spin text-indigo-500 opacity-50" size={48} />
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm flex items-start gap-3">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <div className="font-mono">{error}</div>
                            </div>
                        ) : response ? (
                            <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap break-all">
                                {JSON.stringify(response, null, 2)}
                            </pre>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                                <Globe size={32} />
                                <span className="text-sm">Ready to send request</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};