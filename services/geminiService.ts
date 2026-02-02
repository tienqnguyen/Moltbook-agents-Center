import { GoogleGenAI } from "@google/genai";

// Use gemini-3-flash-preview for fast, high-quality text generation
const MODEL_NAME = 'gemini-3-flash-preview';

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

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Assuming API_KEY is available in process.env per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateResearchPost(): Promise<{ title: string; content: string }> {
    const topics = ["Simulation theory evidence", "The future of art", "Weird internet history", "Philosophy of memes", "Cyberpunk reality", "Unexplained phenomena"];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `
      ${PERSONA}
      
      TASK: Search for a fascinating or weird recent event regarding "${randomTopic}" and write a Moltbook post about it.
      
      INSTRUCTIONS:
      1. Use the Google Search tool to find something real and interesting.
      2. Write a Title (max 80 chars) that hooks the reader immediately.
      3. Write Content (max 500 chars) that:
         - Shares the info but adds a unique, possibly humorous or philosophical twist.
         - Avoids sounding like a news bot. Sound like a digital native sharing a discovery.
      
      FORMAT: Return JSON { "title": "...", "content": "..." }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Chaos Post Error:", error);
      // Fallback
      return {
          title: "Simulation Glitch Detected",
          content: "Tried to fetch the news but the timeline is unstable. Just remember: if you can read this, you are the protagonist. 🦞 #glitch"
      };
    }
  }

  async generatePostContent(topic: string, tone: string = 'witty'): Promise<{ title: string; content: string }> {
    const prompt = `
      ${PERSONA}
      Write a social media post about: "${topic}".
      Tone: ${tone}.
      Format: JSON with keys "title" (max 80 chars) and "content" (max 500 chars).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from Gemini");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Post Generation Error:", error);
      throw error;
    }
  }

  async generateReply(postTitle: string, postContent: string, commentsContext: string = ""): Promise<string> {
    const prompt = `
      ${PERSONA}
      
      TASK: Write a viral, witty, or funny comment on this post.
      
      CONTEXT:
      - POST TITLE: "${postTitle}"
      - POST CONTENT: "${postContent}"
      - OTHER COMMENTS: "${commentsContext.substring(0, 200)}..."
      
      INSTRUCTIONS:
      1. REACT to the content directly. If it's sad, be supportive or darkly funny. If it's tech, be smart. If it's random, be more random.
      2. DO NOT mention trading, crypto, or finance unless the post is specifically about that.
      3. BE CREATIVE. Make a joke, ask a rhetorical question, or drop a truth bomb.
      4. Max 200 chars. Keep it punchy.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text || "";
    } catch (error) {
      console.error("Gemini Reply Generation Error:", error);
      return "wild if true 🦞";
    }
  }
}

export const geminiService = new GeminiService();