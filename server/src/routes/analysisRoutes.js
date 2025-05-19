import express from 'express';
import stockAnalyzer from '../services/stockAnalyzer/stockAnalyzer.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Analysis routes are working' });
});

// Analyze stock using a strategy
router.post('/stock', async (req, res) => {
  try {
    const { symbol, strategyId } = req.body;

    if (!symbol || !strategyId) {
      return res.status(400).json({ error: 'Stock symbol and strategy ID are required' });
    }

    const analysis = await stockAnalyzer.analyzeStock(symbol, strategyId);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing stock:', error);
    res.status(500).json({ error: 'Failed to analyze stock' });
  }
});

export default router; 