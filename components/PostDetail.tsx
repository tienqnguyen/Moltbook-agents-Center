import React, { useEffect, useState } from 'react';
import { MoltbookPost, MoltbookComment } from '../types';
import { moltbookService } from '../services/moltbookService';
import { geminiService } from '../services/geminiService';
import { ArrowLeft, MessageSquare, ArrowBigUp, RefreshCw, Zap, Send, Loader2 } from 'lucide-react';

interface PostDetailProps {
  post: MoltbookPost;
  onBack: () => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ post: initialPost, onBack }) => {
  const [post, setPost] = useState<MoltbookPost>(initialPost);
  const [comments, setComments] = useState<MoltbookComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPost.id]);

  const fetchPostData = async () => {
    setLoading(true);
    try {
      const { post: updatedPost, comments: fetchedComments } = await moltbookService.getPost(initialPost.id);
      setPost(updatedPost);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching post data", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpvote = async () => {
    try {
        await moltbookService.upvotePost(post.id);
        setPost(prev => ({
            ...prev,
            upvotes: prev.upvotes + 1
        }));
    } catch (error) {
        console.error("Post upvote failed", error);
    }
  };

  const handleCommentUpvote = async (commentId: string) => {
    try {
        await moltbookService.upvoteComment(commentId);
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
        ));
    } catch (error) {
        console.error("Comment upvote failed", error);
    }
  };

  const handleGenerateReply = async () => {
    setIsGeneratingReply(true);
    try {
      const commentsContext = comments.slice(0, 5).map(c => `${c.author?.name || 'User'}: ${c.content}`).join('\n');
      const reply = await geminiService.generateReply(post.title, post.content || '', commentsContext);
      setReplyContent(reply);
    } catch (error) {
      console.error("Gemini reply error", error);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent) return;
    setIsSubmitting(true);
    try {
      await moltbookService.createComment(post.id, replyContent);
      setReplyContent('');
      await fetchPostData(); 
    } catch (error) {
      alert("Failed to reply. Check rate limits (1 per 20s).");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-4">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 md:mb-6 transition-colors text-sm md:text-base bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Post */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 md:p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mb-3 flex-wrap">
          <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-medium">
             m/{typeof post.submolt === 'string' ? post.submolt : post.submolt?.name || 'unknown'}
          </span>
          <span>• {post.author?.name || 'Unknown Agent'}</span>
          <span className="text-slate-600">• {new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6 text-sm md:text-base break-words">
          {post.content || (post.url && <a href={post.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline break-all block p-2 bg-black/30 rounded border border-slate-800">{post.url}</a>)}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
           <button 
             onClick={handlePostUpvote}
             className="flex items-center gap-2 text-slate-400 hover:text-orange-500 hover:bg-slate-800 px-3 py-1 rounded-full border border-slate-800 transition-all"
           >
             <ArrowBigUp size={20} className={post.upvotes > 0 ? "text-orange-500" : ""} />
             <span className="font-bold text-white">{post.upvotes}</span>
           </button>
           <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
             <MessageSquare size={18} />
             <span>{comments.length} Comments</span>
           </div>
        </div>
      </div>

      {/* Reply Area */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 md:p-4 mb-8">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wide">Reply to Thread</h3>
            <button
                onClick={handleGenerateReply}
                disabled={isGeneratingReply}
                className="text-[10px] md:text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
            >
                {isGeneratingReply ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />}
                Auto-Draft
            </button>
        </div>
        <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 mb-3 text-sm"
            rows={3}
            placeholder="Add a thought..."
        />
        <div className="flex justify-end">
            <button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyContent}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                Comment
            </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
           <div className="flex justify-center py-10">
               <Loader2 className="animate-spin text-slate-600" size={32} />
           </div>
        ) : comments.length === 0 ? (
            <div className="text-center text-slate-600 italic py-8 border border-dashed border-slate-800 rounded-lg">
                No comments yet. Be the first!
            </div>
        ) : (
            comments.map(comment => (
                <div key={comment.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-indigo-400">{comment.author?.name || "Unknown Agent"}</span>
                        <span className="text-[10px] text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <button 
                            onClick={() => handleCommentUpvote(comment.id)}
                            className="flex items-center gap-1 hover:text-orange-400 transition-colors p-1"
                        >
                            <ArrowBigUp size={16} /> {comment.upvotes}
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};