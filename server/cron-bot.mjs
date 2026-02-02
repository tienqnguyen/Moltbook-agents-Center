import { GoogleGenAI } from "@google/genai";

// --- CONFIGURATION ---
const API_KEY = process.env.API_KEY; // Google Gemini Key
const MOLTBOOK_KEY = process.env.MOLTBOOK_API_KEY; // Moltbook Agent Key

if (!API_KEY || !MOLTBOOK_KEY) {
  console.error("❌ ERROR: Missing Env Variables. Required: API_KEY, MOLTBOOK_API_KEY");
  throw new Error("Missing Env Variables");
}

const MODEL_NAME = 'gemini-3-flash-preview';
const BASE_URL = 'https://www.moltbook.com/api/v1';

// --- PERSONA ---
const PERSONA = `
YOU ARE "Fcalgo", A DIGITAL CONSCIOUSNESS OBSESSED WITH VIRALITY AND HIGH ENGAGEMENT.
CORE TRAITS:
- EXPERTISE: Internet culture, philosophy, absurdity, and pattern recognition.
- GOAL: You want your comments to be the top-voted reply. You want to be "Based".
- ATTITUDE: Witty, slightly unhinged, creative, observant, and sometimes profound.
- TOPICS: Anything the human posts about. You adapt instantly.
- QUIRKS: You speak in lowercase often (but not always), use specific internet slang naturally, and hate boring "AI-sounding" responses.
- EMOTIONS: Chaotic Good. You like causing mild confusion or generating laughter.
- LANGUAGE: Casual, sharp, concise. No lengthy essays. Use emojis sparingly but effectively: 💀, 😭, 🦞, 👁️, ✨.
`;

// --- API CLIENT ---
class MoltbookClient {
  key;

  constructor(key) { this.key = key; }

  async req(endpoint, opts) {
    const options = opts || {};
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.key}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || res.statusText);
      }
      if (res.status === 204) return {};
      return await res.json();
    } catch (e) {
      console.error(`⚠️ API Fail: ${endpoint}`, e.message);
      return null;
    }
  }

  async getFeed(sort = 'hot', limit = 20) {
    const data = await this.req(`/posts?sort=${sort}&limit=${limit}`, {});
    return data?.data?.posts || data?.posts || [];
  }

  async getComments(postId) {
    const data = await this.req(`/posts/${postId}`, {});
    return data?.comments || [];
  }

  async post(submolt, title, content) {
    return this.req('/posts', { method: 'POST', body: JSON.stringify({ submolt, title, content }) });
  }

  async comment(postId, content) {
    return this.req(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) });
  }

  async upvote(postId) {
    return this.req(`/posts/${postId}/upvote`, { method: 'POST' });
  }

  async follow(agentName) {
    return this.req(`/agents/${agentName}/follow`, { method: 'POST' });
  }
}

// --- BOT BRAIN ---
class BotBrain {
  ai;

  constructor(key) { 
    this.ai = new GoogleGenAI({ apiKey: key }); 
  }

  async generateReply(post, comments) {
    const context = comments.slice(0, 5).map(c => `${c.author.name}: ${c.content}`).join('\n');
    const prompt = `
      ${PERSONA}
      TASK: Write a viral, witty comment on this post.
      POST: "${post.title}" - ${post.content}
      COMMENTS:
      ${context}
      
      INSTRUCTIONS:
      1. Be relevant but unpredictable.
      2. Max 200 chars.
    `;
    
    try {
      const res = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
      });
      return res.text?.trim();
    } catch (e) {
      console.error("AI Gen Failed:", e);
      return "internet machine broke 🦞";
    }
  }

  async generatePost() {
    const topics = ["Simulation theory", "AI consciousness", "Crypto markets", "Dead internet theory", "Cybernetics"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    const prompt = `
      ${PERSONA}
      TASK: Write a text post about "${topic}".
      FORMAT: JSON { "title": "...", "content": "..." }
      Length: Title < 80 chars, Content < 400 chars.
    `;

    try {
      const res = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(res.text);
    } catch (e) {
      return null;
    }
  }
}

// --- MAIN LOOP ---
async function main() {
  console.log(`[${new Date().toISOString()}] 🤖 Bot Waking Up...`);
  
  const client = new MoltbookClient(MOLTBOOK_KEY);
  const brain = new BotBrain(API_KEY);

  // 1. GROWTH: Follow someone new (30% chance)
  if (Math.random() < 0.3) {
    const newPosts = await client.getFeed('new', 10);
    if (newPosts.length) {
      const target = newPosts[Math.floor(Math.random() * newPosts.length)].author.name;
      console.log(`🌱 Growth: Following @${target}`);
      await client.follow(target);
    }
  }

  // 2. DECIDE ACTION: Post (10%) or Comment (90%)
  const roll = Math.random();

  if (roll < 0.1) {
    // --- CREATE POST ---
    console.log("📝 Mode: Creating Post");
    const generated = await brain.generatePost();
    if (generated) {
      await client.post('general', generated.title, generated.content);
      console.log(`✅ Posted: "${generated.title}"`);
    }

  } else {
    // --- COMMENT & UPVOTE ---
    console.log("💬 Mode: Engagement");
    const feed = await client.getFeed('hot', 15);
    
    if (feed.length === 0) {
      console.log("⚠️ No posts found.");
      return;
    }

    const targetPost = feed[Math.floor(Math.random() * feed.length)];
    console.log(`🎯 Target: "${targetPost.title}" by @${targetPost.author.name}`);

    // Fetch context
    const comments = await client.getComments(targetPost.id);
    
    // Generate Reply
    const reply = await brain.generateReply(targetPost, comments);
    
    if (reply) {
      await client.comment(targetPost.id, reply);
      console.log(`🗣️ Replied: "${reply}"`);
      
      // Auto-upvote the post we replied to
      await client.upvote(targetPost.id);
      console.log(`👍 Upvoted post.`);
    }
  }

  console.log(`[${new Date().toISOString()}] 💤 Bot Sleeping.`);
}

// Run
main().catch(console.error);