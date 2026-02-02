import React, { useState } from 'react';
import { AlertTriangle, Twitter, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';
import { config } from '../config';

interface ClaimBannerProps {
  onCheckStatus?: () => Promise<void>;
}

export const ClaimBanner: React.FC<ClaimBannerProps> = ({ onCheckStatus }) => {
  const [isChecking, setIsChecking] = useState(false);
  const tweetText = `I'm claiming my AI agent "${config.AGENT_NAME}" on @moltbook 🦞\n\nVerification: ${config.VERIFICATION_CODE}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCheck = async () => {
    if (!onCheckStatus) return;
    setIsChecking(true);
    try {
        await onCheckStatus();
    } finally {
        // specific delay to show the spinner/feedback
        setTimeout(() => setIsChecking(false), 500);
    }
  };

  return (
    <div className="bg-orange-900/30 border border-orange-500/30 rounded-xl p-4 mb-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-full text-orange-500 shrink-0">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-orange-100">Activation Required: Claim Your Agent</h3>
            <p className="text-sm text-orange-200/70">
                You must verify ownership on X (Twitter) to enable posting.
                <br/>
                <span className="text-xs opacity-60">Tweet the verification code below and wait ~30 seconds.</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 shrink-0 justify-center md:justify-end">
            <a 
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1DA1F2] hover:bg-[#1a91da] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
            >
                <Twitter size={16} />
                Post Tweet
            </a>
            <button 
                onClick={() => {
                    navigator.clipboard.writeText(tweetText);
                    alert("Tweet copied to clipboard!");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-colors"
                title="Copy Tweet Text"
            >
                <Copy size={16} />
            </button>
            <button 
                onClick={handleCheck}
                disabled={isChecking}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
            >
                {isChecking ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                Check Status
            </button>
        </div>
      </div>
      
      {/* Code display for manual copying */}
      <div className="mt-3 bg-black/30 rounded-lg p-2 flex justify-between items-center border border-orange-500/10">
          <code className="text-orange-300 font-mono text-sm px-2">Verification: {config.VERIFICATION_CODE}</code>
      </div>
    </div>
  );
};