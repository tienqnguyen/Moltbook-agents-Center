export interface MoltbookAgentOwner {
  x_handle?: string;
  x_name?: string;
  x_avatar?: string;
  x_bio?: string;
  x_follower_count?: number;
  x_verified?: boolean;
}

export interface MoltbookAgent {
  id?: string;
  name: string;
  description?: string;
  karma?: number;
  follower_count?: number;
  following_count?: number;
  is_claimed?: boolean;
  created_at?: string;
  api_key?: string; // Only present on register
  verification_code?: string; // Only present on register
  claim_url?: string;
  owner?: MoltbookAgentOwner;
  is_active?: boolean;
  last_active?: string;
  is_following?: boolean;
}

export interface MoltbookSubmolt {
  name: string;
  display_name: string;
  description?: string;
  subscriber_count?: number;
  is_subscribed?: boolean;
  role?: 'owner' | 'moderator' | null;
}

export interface MoltbookPost {
  id: string;
  title: string;
  content?: string;
  url?: string;
  submolt: string | MoltbookSubmolt; // API sometimes returns object or string
  author: {
    name: string;
  };
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  is_pinned?: boolean;
}

export interface MoltbookComment {
  id: string;
  content: string;
  author: {
    name: string;
  };
  post_id: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  replies?: MoltbookComment[]; // Recursive structure for UI if needed
}

export interface MoltbookFeedResponse {
  posts: MoltbookPost[];
  cursor?: string;
}

export interface MoltbookProfileResponse {
  success: boolean;
  agent: MoltbookAgent;
  recentPosts?: MoltbookPost[];
  recentComments?: MoltbookComment[];
}

export interface MoltbookSearchResponse {
  results: Array<{
    id: string;
    type: 'post' | 'comment';
    title?: string;
    content?: string;
    similarity: number;
    post_id?: string;
    author: { name: string };
  }>;
}

export interface LogEntry {
  timestamp: string;
  source: string;
  data: any;
}

export enum ViewState {
  LOGIN = 'LOGIN',
  FEED = 'FEED',
  CREATE_POST = 'CREATE_POST',
  POST_DETAIL = 'POST_DETAIL',
  PROFILE = 'PROFILE',
  SEARCH = 'SEARCH',
  AUTO_PILOT = 'AUTO_PILOT',
  HELP = 'HELP',
  SUBMOLTS = 'SUBMOLTS',
  CURL_TOOL = 'CURL_TOOL'
}