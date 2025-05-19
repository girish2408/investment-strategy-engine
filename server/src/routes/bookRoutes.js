import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authMiddleware.js';
import chromaService from '../services/chromaService.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// All book routes require authentication
router.use(authenticateToken);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
  await fs.mkdir(uploadsDir, { recursive: true });
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

const upload = multer({ storage: multer.memoryStorage() });

// Upload and process books
router.post('/upload', upload.array('books'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const strategies = [];
    for (const file of req.files) {
      const result = await bookProcessor.processBook(file.buffer, file.originalname);
      strategies.push(...result);
    }

    res.json({ strategies });
  } catch (error) {
    console.error('Error processing books:', error);
    res.status(500).json({ error: 'Failed to process books' });
  }
});

// Get all strategies
router.get('/strategies', async (req, res) => {
  try {
    const strategies = await bookProcessor.getAllStrategies();
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

// Get proprietary strategies
router.get('/strategies/proprietary', async (req, res) => {
  try {
    const strategies = await bookProcessor.getProprietaryStrategies();
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching proprietary strategies:', error);
    res.status(500).json({ error: 'Failed to fetch proprietary strategies' });
  }
});

// Mark strategy as proprietary
router.post('/strategies/:id/proprietary', async (req, res) => {
  try {
    const strategy = await bookProcessor.markStrategyAsProprietary(req.params.id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    res.json(strategy);
  } catch (error) {
    console.error('Error marking strategy as proprietary:', error);
    res.status(500).json({ error: 'Failed to mark strategy as proprietary' });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await chromaService.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get a specific book
router.get('/:id', async (req, res) => {
  try {
    const book = await chromaService.getBook(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  try {
    const book = await chromaService.addBook(req.body);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const book = await chromaService.updateBook(req.params.id, req.body);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const result = await chromaService.deleteBook(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

export default router; 