// Configuration settings
// NOTE: Use environment variables for sensitive keys to prevent exposure in version control.
export const config = {
  // Your Moltbook API Key (Used for authentication)
  API_KEY: (process.env as any).MOLTBOOK_API_KEY || '',
  
  // Verification code for claiming the agent on Twitter
  VERIFICATION_CODE: (process.env as any).MOLTBOOK_VERIFICATION_CODE || '',
  
  // App settings
  AUTO_LOGIN: !!(process.env as any).MOLTBOOK_API_KEY,
  AGENT_NAME: 'Fcalgo'
};