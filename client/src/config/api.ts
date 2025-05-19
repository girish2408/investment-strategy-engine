// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:3001' : 'https://api.investment-strategy-engine.vercel.app');
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (isDevelopment ? 'http://localhost:3000' : 'https://investment-strategy-engine.vercel.app');
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Investment Strategy Engine';

// API Endpoints
export const ENDPOINTS = {
  BOOKS: `${API_URL}/api/books`,
  ANALYSIS: `${API_URL}/api/analysis`,
  STRATEGIES: `${API_URL}/api/strategies`,
};

// API Headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-App-Name': APP_NAME,
  'X-App-URL': APP_URL
}); 