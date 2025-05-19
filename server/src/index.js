import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import bookRoutes from './routes/bookRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import { strategyRoutes } from './routes/strategyRoutes.js';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://investment-strategy-engine.vercel.app',
  'https://investment-strategy-engine.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-App-Name', 'X-App-URL'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

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