import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'JWT_SECRET',
];

export const validateEnv = () => {
  const missing = requiredEnv.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.warn('⚠️  GROQ_API_KEY is not set. AI generation will not work.');
  }
};

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default env;
