import dotenv from 'dotenv';
import path from 'path';

// Get the root directory path
const rootDir = path.resolve(__dirname, '../../');

// Log the current directory and .env file path
console.log('Current directory:', __dirname);
console.log('Root directory:', rootDir);
console.log('Loading .env file from:', path.join(rootDir, '.env'));

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('CHROMA_DB_PATH:', process.env.CHROMA_DB_PATH);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not Set');

export const config = {
  port: process.env.PORT || 3001,
  openaiApiKey: process.env.OPENAI_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  chromaDbPath: process.env.CHROMA_DB_PATH || './chroma-db'
}; 