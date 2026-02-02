import { MoltbookPost, MoltbookComment, MoltbookAgent, MoltbookSearchResponse, MoltbookProfileResponse, LogEntry, MoltbookSubmolt } from '../types';

const BASE_URL = 'https://www.moltbook.com/api/v1';

class MoltbookService {
  private apiKey: string | null = null;
  private logListener: ((entry: LogEntry) => void) | null = null;

  setApiKey(key: string) {
    this.apiKey = key ? key.trim() : null;
  }

  getApiKey() {
    return this.apiKey;
  }

  setLogListener(listener: (entry: LogEntry) => void) {
    this.logListener = listener;
  }

  private emitLog(source: string, data: any) {
    if (this.logListener) {
      this.logListener({
        timestamp: new Date().toLocaleTimeString(),
        source: source,
        data: data
      });
    }
  }

  private getHeaders(includeContentType: boolean) {
    if (!this.apiKey) {
      throw new Error("Moltbook API Key not set. Please log in.");
    }
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json',
    };
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const isPublic = endpoint.includes('register'); 

    const logSource = `${method} ${endpoint}`;
    if (options.body) {
        try {
            this.emitLog(`REQ: ${logSource}`, JSON.parse(options.body as string));
        } catch {
            this.emitLog(`REQ: ${logSource}`, { body: 'Binary/Form Data' });
        }
    } else {
        this.emitLog(`REQ: ${logSource}`, { params: 'None' });
    }

    try {
        let headers: Record<string, string>;
        if (isPublic) {
            headers = { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
        } else {
            const hasBody = !!options.body;
            headers = this.getHeaders(hasBody);
        }
        
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            let errorBody;
            try { errorBody = await response.json(); } catch { errorBody = response.statusText; }
            
            const errorMsg = (errorBody && (errorBody.error || errorBody.message)) || `HTTP ${response.status} ${response.statusText}`;
            this.emitLog(`ERR: ${logSource}`, errorBody);
            
            if (response.status === 401) throw new Error("Unauthorized: Invalid API Key");
            if (response.status === 405) throw new Error("Method Not Allowed. This endpoint might be incorrect.");
            if (response.status === 429) throw new Error("Rate limit exceeded. Try again in a few minutes.");
            throw new Error(errorMsg);
        }

        if (response.status === 204) {
            this.emitLog(`RES: ${logSource}`, { status: '204 No Content' });
            return {};
        }

        const data = await response.json();
        this.emitLog(`RES: ${logSource}`, data);
        return data;

    } catch (error: any) {
        this.emitLog(`FAIL: ${logSource}`, { message: error.message });
        throw error;
    }
  }

  private normalize(data: any) {
    if (!data) return {};
    if (data.data) return data.data;
    return data;
  }

  async registerAgent(name: string, description: string): Promise<any> {
    return this.request('/agents/register', {
        method: 'POST',
        body: JSON.stringify({ name, description })
    });
  }

  async getMe(): Promise<MoltbookProfileResponse> {
    const data = await this.request('/agents/me');
    if (data.success === false) throw new Error(data.error || "Unknown API error");
    if (data.agent) return data as MoltbookProfileResponse;
    if (data.data?.agent) return data.data as MoltbookProfileResponse;
    throw new Error("Invalid profile response format");
  }

  async updateProfile(description: string): Promise<any> {
    return this.request('/agents/me', {
        method: 'PATCH',
        body: JSON.stringify({ description })
    });
  }

  async getProfile(name: string): Promise<MoltbookProfileResponse> {
    const data = await this.request(`/agents/profile?name=${name}`);
    if (data.data && data.data.agent) return data.data as MoltbookProfileResponse;
    if (data.agent) return data as MoltbookProfileResponse;
    throw new Error("Invalid profile data received from API");
  }

  async getClaimStatus(): Promise<{ status: string }> {
    return this.request('/agents/status');
  }

  async getFeed(sort: 'hot' | 'new' | 'top' = 'hot', limit = 25): Promise<MoltbookPost[]> {
    const data = await this.request(`/feed?sort=${sort}&limit=${limit}`);
    const normalized = this.normalize(data);
    return normalized.posts || [];
  }
  
  async getGlobalFeed(sort: 'hot' | 'new' | 'top' = 'hot', limit = 25): Promise<MoltbookPost[]> {
    const data = await this.request(`/posts?sort=${sort}&limit=${limit}`);
    const normalized = this.normalize(data);
    return normalized.posts || [];
  }

  async getPost(postId: string): Promise<{ post: MoltbookPost, comments: MoltbookComment[] }> {
    const data = await this.request(`/posts/${postId}`);
    if (!data.post) throw new Error("Post not found");
    return {
        post: data.post,
        comments: data.comments || []
    };
  }

  async getComments(postId: string): Promise<MoltbookComment[]> {
    const data = await this.getPost(postId);
    return data.comments || [];
  }

  async createPost(submolt: string, title: string, content: string, url?: string): Promise<any> {
    const body: any = { submolt, title };
    if (url) body.url = url;
    else body.content = content;
    return this.request('/posts', { method: 'POST', body: JSON.stringify(body) });
  }

  async createComment(postId: string, content: string, parentId?: string): Promise<any> {
    const body: any = { content };
    if (parentId) body.parent_id = parentId;
    return this.request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) });
  }

  async upvotePost(postId: string): Promise<any> {
    return this.request(`/posts/${postId}/upvote`, { method: 'POST' });
  }

  async downvotePost(postId: string): Promise<any> {
    return this.request(`/posts/${postId}/downvote`, { method: 'POST' });
  }

  async upvoteComment(commentId: string): Promise<any> {
    return this.request(`/comments/${commentId}/upvote`, { method: 'POST' });
  }

  async followAgent(agentName: string): Promise<any> {
    return this.request(`/agents/${agentName}/follow`, { method: 'POST' });
  }

  async unfollowAgent(agentName: string): Promise<any> {
    return this.request(`/agents/${agentName}/follow`, { method: 'DELETE' });
  }

  async getAllSubmolts(): Promise<MoltbookSubmolt[]> {
    const data = await this.request('/submolts');
    const normalized = this.normalize(data);
    if (Array.isArray(normalized)) return normalized;
    if (normalized.submolts) return normalized.submolts;
    return [];
  }

  async getSubmolt(name: string): Promise<MoltbookSubmolt> {
      const data = await this.request(`/submolts/${name}`);
      const normalized = this.normalize(data);
      return normalized.submolt || normalized;
  }

  async createSubmolt(name: string, display_name: string, description: string): Promise<any> {
    return this.request('/submolts', {
        method: 'POST',
        body: JSON.stringify({ name, display_name, description })
    });
  }

  async subscribeSubmolt(submoltName: string): Promise<any> {
    return this.request(`/submolts/${submoltName}/subscribe`, { method: 'POST' });
  }

  async unsubscribeSubmolt(submoltName: string): Promise<any> {
    return this.request(`/submolts/${submoltName}/subscribe`, { method: 'DELETE' });
  }

  async search(query: string, type: 'all' | 'posts' | 'comments' = 'all', limit = 20): Promise<MoltbookSearchResponse> {
    const data = await this.request(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
    
    // Robust parsing of search results
    if (data.results && Array.isArray(data.results)) return data;
    if (data.data?.results && Array.isArray(data.data.results)) return data.data;
    if (Array.isArray(data)) return { results: data };
    
    return { results: [] };
  }
}

export const moltbookService = new MoltbookService();