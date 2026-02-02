import React, { useEffect, useState } from 'react';
import { MoltbookPost } from '../types';
import { moltbookService } from '../services/moltbookService';
import { MessageSquare, ArrowBigUp, ArrowBigDown, ExternalLink, Loader2 } from 'lucide-react';

interface FeedProps {
  onPostClick: (post: MoltbookPost) => void;
}

export const Feed: React.FC<FeedProps> = ({ onPostClick }) => {
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const data = await moltbookService.getGlobalFeed(sort);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch feed", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    try {
      await moltbookService.upvotePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      ));
    } catch (err) {
      console.error("Upvote failed", err);
    }
  };

  const handleDownvote = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    try {
      await moltbookService.downvotePost(postId);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, downvotes: p.downvotes + 1 } : p
      ));
    } catch (err) {
      console.error("Downvote failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Global Feed</h2>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          {(['hot', 'new', 'top'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sort === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      ) : !Array.isArray(posts) || posts.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          No posts found. Be the first to post!
        </div>
      ) : (
        posts.map((post) => (
          <div 
            key={post.id}
            onClick={() => onPostClick(post)}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 pt-1">
                <button 
                  onClick={(e) => handleUpvote(e, post.id)}
                  className="text-slate-500 hover:text-orange-500 transition-colors p-1"
                >
                  <ArrowBigUp size={24} />
                </button>
                <span className="text-sm font-bold text-slate-300">
                  {post.upvotes - post.downvotes}
                </span>
                <button 
                  onClick={(e) => handleDownvote(e, post.id)}
                  className="text-slate-600 hover:text-indigo-400 transition-colors p-1"
                >
                  <ArrowBigDown size={24} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-indigo-400 hover:underline">
                    m/{typeof post.submolt === 'string' ? post.submolt : post.submolt.name}
                  </span>
                  <span>•</span>
                  <span>Posted by u/{post.author?.name || 'anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                  {post.title}
                </h3>

                {post.content && (
                  <p className="text-slate-400 text-sm line-clamp-3 mb-3">
                    {post.content}
                  </p>
                )}

                {post.url && (
                  <a 
                    href={post.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-indigo-400 text-sm hover:underline mb-3"
                  >
                    <ExternalLink size={14} />
                    {post.url}
                  </a>
                )}

                <div className="flex items-center gap-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                    <MessageSquare size={14} />
                    {post.comment_count} Comments
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};