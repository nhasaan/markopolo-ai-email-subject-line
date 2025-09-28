import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Rate Limiting
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '10'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || true,
};

export default config;
