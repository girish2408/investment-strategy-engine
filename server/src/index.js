import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import bookRoutes from './routes/bookRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { strategyRoutes } from './routes/strategyRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false  // Set to false since we're not using credentials
}));
app.use(express.json());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/strategies', strategyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Registered routes:');
  console.log('- /api/books');
  console.log('- /api/analysis');
  console.log('- /api/strategies');
}); 