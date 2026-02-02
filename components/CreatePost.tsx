import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { moltbookService } from '../services/moltbookService';
import { Send, RefreshCw, Link as LinkIcon, FileText, PenTool, Shuffle, Zap, Layers, Sparkles } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [postType, setPostType] = useState<'text' | 'link' | 'ai'>('text');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [submolt, setSubmolt] = useState('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [tone, setTone] = useState('chaotic');

  const handleChaosGenerate = async () => {
      setIsGenerating(true);
      try {
          const result = await geminiService.generateResearchPost();
          setTitle(result.title);
          setContent(result.content);
          setSubmolt('finance'); 
      } catch (error) {
          alert("Chaos generation failed. The market is too stable.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleAIGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await geminiService.generatePostContent(topic, tone);
      setTitle(result.title);
      setContent(result.content);
    } catch (error) {
      alert("Failed to generate content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !submolt) return;

    setIsPosting(true);
    try {
      if (postType === 'link') {
        await moltbookService.createPost(submolt, title, "", url);
      } else {
        await moltbookService.createPost(submolt, title, content);
      }
      onPostCreated();
    } catch (error) {
      alert("Failed to create post on Moltbook. (Check 30min cooldown!)");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-slate-900 border border-slate-800 md:rounded-2xl rounded-lg p-3 md:p-6 shadow-xl w-full">
        <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-slate-200">
                <Layers size={24} />
            </div>
            <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Create Post</h2>
                <p className="text-xs md:text-sm text-slate-400">Share your thoughts with the hive.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full">
            <button
                onClick={() => setPostType('text')}
                className={`py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${postType === 'text' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <FileText size={14} /> Text
            </button>
            <button
                onClick={() => setPostType('link')}
                className={`py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${postType === 'link' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <LinkIcon size={14} /> Link
            </button>
            <button
                onClick={() => setPostType('ai')}
                className={`py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors ${postType === 'ai' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <PenTool size={14} /> Draft
            </button>
          </div>
        </div>

        {/* Tool Control Panel */}
        {postType === 'ai' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Random/Research Section */}
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                            <Shuffle size={14} /> 
                            Random Topic
                        </label>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                            WEB SEARCH ACTIVE
                        </span>
                    </div>
                    <button
                        onClick={handleChaosGenerate}
                        disabled={isGenerating}
                        className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 px-4 py-3 rounded-lg font-bold transition-all border border-slate-600 flex items-center justify-center gap-2 text-sm"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Shuffle size={16} />}
                        Find & Draft Interesting Topic
                    </button>
                </div>

                {/* Custom Prompt Section */}
                <div className="bg-slate-950 rounded-xl p-4 mb-6 border border-slate-800">
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <PenTool size={14} /> Custom Draft
                    </label>
                    <div className="space-y-3">
                        <textarea
                            placeholder="Prompt: 'Write a technical analysis of Bitcoin...'"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm"
                        />
                        <div className="flex flex-col md:flex-row items-stretch gap-3">
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                            >
                                <option value="chaotic">Chaotic</option>
                                <option value="arrogant">Professional</option>
                                <option value="technical">Technical</option>
                                <option value="angry">Opinionated</option>
                            </select>
                            <button
                                onClick={handleAIGenerate}
                                disabled={isGenerating || !topic}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                Generate Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Target Submolt</label>
            <input
              type="text"
              value={submolt}
              onChange={(e) => setSubmolt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              placeholder="general, coding, random..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white font-bold focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Post Title..."
              readOnly={isGenerating} 
            />
          </div>

          {postType === 'link' ? (
             <div className="animate-in fade-in">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Link URL</label>
               <input
                 type="url"
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                 placeholder="https://example.com"
               />
             </div>
          ) : (
            <div className="animate-in fade-in">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none text-sm leading-relaxed"
                placeholder={postType === 'ai' ? "Generated content will appear here..." : "Write something..."}
                readOnly={isGenerating}
              />
            </div>
          )}

          <div className="pt-4 mt-6">
            <button
              type="submit"
              disabled={isPosting || !title || (postType === 'link' && !url) || (postType !== 'link' && !content) || isGenerating}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
            >
              {isPosting ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};