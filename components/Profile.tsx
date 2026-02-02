import React, { useEffect, useState } from 'react';
import { MoltbookAgent, MoltbookPost } from '../types';
import { moltbookService } from '../services/moltbookService';
import { Loader2, Terminal, Activity, FileText, Hash, User, ExternalLink, Code, UserPlus, UserMinus, Copy, Check, MessageSquare, ShieldCheck, Clock, Calendar, CheckCircle } from 'lucide-react';

interface ProfileProps {
  agentName: string;
  onPostClick?: (post: MoltbookPost) => void;
}

export const Profile: React.FC<ProfileProps> = ({ agentName, onPostClick }) => {
  const [profile, setProfile] = useState<MoltbookAgent | null>(null);
  const [recentPosts, setRecentPosts] = useState<MoltbookPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Fetch full profile data
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await moltbookService.getProfile(agentName);
      setProfile(data.agent);
      setIsFollowing(!!data.agent.is_following);
      if (data.recentPosts) {
          setRecentPosts(data.recentPosts);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentName]);

  const handleFollowToggle = async () => {
      if (!profile) return;
      setFollowLoading(true);
      try {
          if (isFollowing) {
              await moltbookService.unfollowAgent(profile.name);
              setIsFollowing(false);
          } else {
              await moltbookService.followAgent(profile.name);
              setIsFollowing(true);
          }
          fetchProfile(); // Refresh stats
      } catch (e) {
          console.error("Follow action failed", e);
      } finally {
          setFollowLoading(false);
      }
  };

  const copyIdToClipboard = () => {
      if (profile?.id) {
          navigator.clipboard.writeText(profile.id);
          setCopiedId(true);
          setTimeout(() => setCopiedId(false), 2000);
      }
  };

  const copyPostId = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      navigator.clipboard.writeText(id);
      setCopiedPostId(id);
      setTimeout(() => setCopiedPostId(null), 2000);
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-green-500 animate-pulse font-mono">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm">ACCESSING NEURAL PROFILE...</span>
      </div>
  );

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300 pb-20 md:pb-0">
      
      {/* 1. ID Card Section */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 md:p-6 shadow-lg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <Activity size={120} />
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative z-10">
            {/* Avatar */}
            <div className="flex items-center gap-4 md:block">
                <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 bg-indigo-950/80 border-2 border-indigo-500/30 flex items-center justify-center text-3xl md:text-5xl font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] rounded-2xl">
                    {profile?.name?.[0]?.toUpperCase()}
                </div>
                
                {/* Mobile Name/Actions Stack */}
                <div className="flex-1 md:hidden">
                    <h1 className="text-xl font-bold text-white truncate">{profile?.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${profile?.is_active ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-500'}`}></span>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">
                            {profile?.is_active ? 'Online' : 'Offline'}
                        </span>
                        <span className="text-slate-600">|</span>
                         <span className={`text-[10px] px-1.5 py-0.5 rounded border ${profile?.is_claimed ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
                            {profile?.is_claimed ? 'VERIFIED' : 'UNCLAIMED'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop Info & Stats */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
                {/* Desktop Header */}
                <div className="hidden md:flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            {profile?.name}
                            {profile?.is_claimed && <ShieldCheck size={20} className="text-green-500" />}
                             <a href={`https://www.moltbook.com/u/${profile?.name}`} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-400 transition-colors">
                                <ExternalLink size={16} />
                            </a>
                        </h1>
                        <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                             <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${profile?.is_active ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                                {profile?.is_active ? 'SYSTEM ONLINE' : `LAST SEEN: ${profile?.last_active ? new Date(profile.last_active).toLocaleDateString() : 'UNKNOWN'}`}
                            </div>
                            <span className="text-slate-700">|</span>
                            <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={copyIdToClipboard}>
                                <span>ID: {profile?.id?.substring(0, 12)}...</span>
                                {copiedId ? <Check size={10} className="text-green-400"/> : <Copy size={10}/>}
                            </div>
                        </div>
                    </div>
                    
                     <button 
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all border ${
                            isFollowing 
                            ? 'bg-slate-800 text-slate-300 border-slate-600 hover:border-red-500 hover:text-red-400' 
                            : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 hover:border-indigo-400 shadow-lg shadow-indigo-900/20'
                        }`}
                    >
                        {followLoading ? <Loader2 className="animate-spin" size={14}/> : isFollowing ? <UserMinus size={14}/> : <UserPlus size={14}/>}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                </div>

                {/* Bio */}
                <div className="bg-black/30 rounded-lg p-3 border border-slate-800 relative group">
                    <p className="text-sm text-slate-300 font-mono leading-relaxed">
                        <span className="text-indigo-500 opacity-50 select-none">&gt; </span>
                        {profile?.description || "No system description available."}
                    </p>
                </div>
                
                {/* Mobile Actions Row */}
                <div className="flex md:hidden items-center justify-between gap-2 mt-1">
                     <button 
                        onClick={copyIdToClipboard}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-mono py-2 rounded border border-slate-700 flex items-center justify-center gap-2"
                    >
                        ID: {profile?.id?.substring(0, 8)}
                        {copiedId ? <Check size={10} className="text-green-400"/> : <Copy size={10}/>}
                    </button>
                    <button 
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                            isFollowing 
                            ? 'bg-slate-800 text-slate-300 border-slate-600' 
                            : 'bg-indigo-600 text-white border-indigo-500'
                        }`}
                    >
                        {followLoading ? <Loader2 className="animate-spin" size={12}/> : isFollowing ? <UserMinus size={12}/> : <UserPlus size={12}/>}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 md:mt-6">
            <div className="bg-slate-950/50 p-2 md:p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase mb-0.5">Karma</div>
                <div className="text-lg md:text-2xl font-bold text-indigo-400 font-mono">{profile?.karma || 0}</div>
            </div>
            <div className="bg-slate-900 p-2 md:p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase mb-0.5">Followers</div>
                <div className="text-lg md:text-2xl font-bold text-white font-mono">{profile?.follower_count || 0}</div>
            </div>
            <div className="bg-slate-900 p-2 md:p-3 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] md:text-xs text-slate-500 font-bold uppercase mb-0.5">Following</div>
                <div className="text-lg md:text-2xl font-bold text-white font-mono">{profile?.following_count || 0}</div>
            </div>
        </div>
      </div>

      {/* 2. Metadata / Owner Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Owner Info */}
          {profile?.owner ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 flex items-center gap-3">
                  {profile.owner.x_avatar ? (
                      <img src={profile.owner.x_avatar} alt="Owner" className="w-10 h-10 rounded-full border border-slate-700" />
                  ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"><User size={20} className="text-slate-500"/></div>
                  )}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-300">OPERATOR</span>
                          {/* Fixed CheckCircle reference */}
                          {profile.owner.x_verified && <CheckCircle size={10} className="text-blue-400" />}
                      </div>
                      <a href={`https://x.com/${profile.owner.x_handle}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-400 hover:text-white truncate block">
                          @{profile.owner.x_handle || profile.owner.x_name}
                      </a>
                  </div>
                  <a href={`https://x.com/${profile.owner.x_handle}`} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                      <ExternalLink size={14} className="text-slate-400"/>
                  </a>
              </div>
          ) : (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-xl p-4 flex items-center justify-center text-xs text-slate-500 gap-2">
                  <User size={14} /> No Linked Operator
              </div>
          )}

          {/* System Metadata */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 flex flex-col justify-center text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Calendar size={10}/> CREATED</span>
                  <span className="text-slate-300">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1"><Terminal size={10}/> MODEL</span>
                  <span className="text-slate-300">FC-V1.0</span>
              </div>
              <div className="flex justify-between items-center">
                   <span className="text-slate-500 flex items-center gap-1"><ShieldCheck size={10}/> VERIFICATION</span>
                   <span className={profile?.is_claimed ? "text-green-500" : "text-red-500"}>
                       {profile?.is_claimed ? 'SECURE' : 'PENDING'}
                   </span>
              </div>
          </div>
      </div>
      
      {/* 3. Raw JSON Toggle (Compact) */}
      <div className="border border-slate-800 rounded-lg bg-[#0d1117] overflow-hidden">
          <button 
            onClick={() => setShowJson(!showJson)}
            className="w-full px-4 py-2 flex items-center justify-between text-[10px] md:text-xs font-bold text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          >
              <span className="flex items-center gap-2"><Code size={12}/> DEBUG: VIEW RAW JSON RESPONSE</span>
              <span className="text-slate-600">{showJson ? 'HIDE' : 'SHOW'}</span>
          </button>
          {showJson && (
              <pre className="p-4 text-[10px] text-green-500/80 font-mono overflow-x-auto border-t border-slate-800 max-h-40 scrollbar-thin">
                  {JSON.stringify(profile, null, 2)}
              </pre>
          )}
      </div>

      {/* 4. Recent Posts Feed */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-3 px-1">
            <FileText size={14} /> Recent Log Output
        </h3>
        
        <div className="space-y-3">
            {recentPosts.length === 0 ? (
                <div className="text-slate-600 italic p-6 text-center border border-dashed border-slate-800 rounded-xl text-sm">
                    No recent activity logs found.
                </div>
            ) : (
                recentPosts.map(post => (
                    <div 
                        key={post.id} 
                        onClick={() => onPostClick?.(post)}
                        className="bg-slate-900 border border-slate-800 p-3 md:p-4 rounded-xl hover:border-indigo-500/40 hover:bg-slate-800 transition-all cursor-pointer group active:scale-[0.98]"
                    >
                        <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] md:text-xs font-bold text-indigo-300 bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-900/30">
                                m/{typeof post.submolt === 'string' ? post.submolt : post.submolt.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <div className="text-sm md:text-base font-bold text-slate-200 mb-1 line-clamp-1 group-hover:text-white">
                            {post.title}
                        </div>
                        
                        {post.url ? (
                            <div className="flex items-center gap-1.5 text-xs text-indigo-400 mb-2 truncate bg-black/20 p-1.5 rounded border border-slate-800/50">
                                <ExternalLink size={10} className="shrink-0" />
                                <span className="truncate">{post.url}</span>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 line-clamp-2 mb-2">
                                {post.content}
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between border-t border-slate-800/50 pt-2 mt-2">
                             <div className="flex gap-3 text-[10px] md:text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1 hover:text-green-400">
                                    <Activity size={10}/> {post.upvotes - post.downvotes}
                                </span>
                                <span className="flex items-center gap-1 hover:text-indigo-400">
                                    <MessageSquare size={10}/> {post.comment_count}
                                </span>
                            </div>
                            <button 
                                onClick={(e) => copyPostId(e, post.id)}
                                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-white font-mono transition-colors"
                            >
                                #{post.id.substring(0,6)}
                                {copiedPostId === post.id ? <Check size={10} className="text-green-500"/> : <Copy size={10}/>}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};