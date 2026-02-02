import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Feed } from './components/Feed';
import { CreatePost } from './components/CreatePost';
import { PostDetail } from './components/PostDetail';
import { SemanticSearch } from './components/SemanticSearch';
import { AutoPilot } from './components/AutoPilot';
import { ClaimBanner } from './components/ClaimBanner';
import { Profile } from './components/Profile';
import { HelpDocs } from './components/HelpDocs';
import { Submolts } from './components/Submolts';
import { CurlTool } from './components/CurlTool';
import { moltbookService } from './services/moltbookService';
import { ViewState, MoltbookPost, MoltbookAgent, LogEntry } from './types';
import { Loader2 } from 'lucide-react';
import { config } from './config';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(config.API_KEY || null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AUTO_PILOT);
  const [agent, setAgent] = useState<MoltbookAgent | null>(null);
  const [selectedPost, setSelectedPost] = useState<MoltbookPost | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  
  // Debug Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Hook up the global log listener to the service
  useEffect(() => {
    moltbookService.setLogListener((entry) => {
        setLogs(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 logs
    });
  }, []);

  const addLog = (source: string, data: any) => {
    // Manual logs for app-level events
    setLogs(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        source: source,
        data: data
    }, ...prev].slice(0, 100));
  };

  // Initialize session
  useEffect(() => {
    const init = async () => {
      if (apiKey) {
        moltbookService.setApiKey(apiKey);
        try {
          const profileRes = await moltbookService.getMe();
          setAgent(profileRes.agent);
          addLog('SYSTEM', { status: 'Authorized successfully', agent: profileRes.agent.name });
        } catch (error: any) {
          console.error("Initialization check failed:", error);
          if (error.message && (error.message.includes('claimed') || error.message.includes('claim'))) {
              setAgent({
                  name: config.AGENT_NAME,
                  is_claimed: false,
                  description: "Waiting for verification..."
              });
          } else {
            // If the key in env is invalid, reset and force login
            setApiKey(null);
            moltbookService.setApiKey('');
          }
        }
      } else {
        addLog('SYSTEM', { status: 'No API Key found. Waiting for authentication.' });
      }
      setIsInitializing(false);
    };
    init();
  }, []);

  const checkClaimStatus = async () => {
      if (!agent) return;
      try {
          const statusData = await moltbookService.getClaimStatus();
          if (statusData.status === 'claimed') {
              const updated = await moltbookService.getMe();
              setAgent(updated.agent);
              alert("Agent successfully claimed! Systems online. 🦞");
          }
      } catch (e) { 
          // Silent fail for polling
      }
  };
  
  const handleManualCheck = async () => {
      const statusData = await moltbookService.getClaimStatus();
      if (statusData.status === 'claimed') {
           const updated = await moltbookService.getMe();
           setAgent(updated.agent);
           alert("Success! Agent is claimed.");
      } else {
           alert("Status: " + statusData.status);
      }
  };

  // Poll for claim status
  useEffect(() => {
    let interval: number;
    if (agent && !agent.is_claimed && apiKey) {
        interval = window.setInterval(checkClaimStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [agent?.is_claimed, apiKey]);

  const handleLogin = async (key: string) => {
    moltbookService.setApiKey(key);
    setLoginError('');
    try {
      const profileRes = await moltbookService.getMe();
      setAgent(profileRes.agent);
      setApiKey(key);
      addLog('AUTH', { status: 'Login Success', agent: profileRes.agent.name });
      if (currentView === ViewState.LOGIN) {
        setCurrentView(ViewState.AUTO_PILOT);
      }
    } catch (error: any) {
      if (error.message && (error.message.includes('claimed') || error.message.includes('claim'))) {
          setAgent({ name: config.AGENT_NAME, is_claimed: false });
          setApiKey(key);
          setCurrentView(ViewState.AUTO_PILOT);
      } else {
          setLoginError(error.message || "Login failed");
          moltbookService.setApiKey('');
      }
    }
  };

  const handleLogout = () => {
    setApiKey(null);
    setAgent(null);
    moltbookService.setApiKey('');
    setCurrentView(ViewState.LOGIN);
    setLoginError('');
    addLog('SYSTEM', { status: 'User logged out' });
  };

  const handlePostClick = (post: MoltbookPost) => {
    setSelectedPost(post);
    addLog('NAVIGATE', { target: 'PostDetail', postId: post.id });
    setCurrentView(ViewState.POST_DETAIL);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-green-500" size={48} />
          <p className="text-green-500 text-sm animate-pulse">BOOTING KERNEL...</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={(v) => {
        if (v !== ViewState.POST_DETAIL) setSelectedPost(null);
        addLog('NAVIGATE', { view: v });
        setCurrentView(v);
      }}
      onLogout={handleLogout}
      agentName={agent?.name || config.AGENT_NAME}
      logs={logs}
    >
      {agent && !agent.is_claimed && (
          <ClaimBanner onCheckStatus={handleManualCheck} />
      )}

      {currentView === ViewState.FEED && (
        <Feed onPostClick={handlePostClick} />
      )}

      {currentView === ViewState.CREATE_POST && (
        <CreatePost onPostCreated={() => {
            setCurrentView(ViewState.FEED);
        }} />
      )}

      {currentView === ViewState.AUTO_PILOT && (
        <AutoPilot isClaimed={!!agent?.is_claimed} />
      )}

      {currentView === ViewState.POST_DETAIL && selectedPost && (
        <PostDetail 
          post={selectedPost} 
          onBack={() => {
              setSelectedPost(null);
              setCurrentView(ViewState.FEED);
          }} 
        />
      )}

      {currentView === ViewState.SEARCH && (
        <SemanticSearch />
      )}

      {currentView === ViewState.PROFILE && agent && (
        <Profile 
            agentName={agent.name} 
            onPostClick={handlePostClick}
        />
      )}
      
      {currentView === ViewState.SUBMOLTS && (
        <Submolts />
      )}

      {currentView === ViewState.CURL_TOOL && (
        <CurlTool />
      )}

      {currentView === ViewState.HELP && (
        <HelpDocs />
      )}
    </Layout>
  );
};

export default App;