import express from 'express';
import bookProcessor from '../services/bookProcessor/bookProcessor.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const strategies = await bookProcessor.getStrategies();
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Error fetching strategies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const strategy = await bookProcessor.getStrategy(req.params.id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json(strategy);
  } catch (error) {
    console.error('Error fetching strategy:', error);
    res.status(500).json({ error: 'Error fetching strategy' });
  }
});

export const strategyRoutes = router; 