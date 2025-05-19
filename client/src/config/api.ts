// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Endpoints
export const ENDPOINTS = {
  BOOKS: `${API_URL}/api/books`,
  ANALYSIS: `${API_URL}/api/analysis`,
  STRATEGIES: `${API_URL}/api/strategies`,
};

// API Headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  // Add any auth headers if needed
  // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
}); 