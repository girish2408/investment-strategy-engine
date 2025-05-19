import { bookProcessor } from '../services/bookProcessor/bookProcessor.js';
import { ensureDirectoryExists, validateFileType, sanitizeFileName } from '../utils/helpers.js';
import { config } from '../config/config.js';

export async function uploadBook(req, res) {
  try {
    if (!req.files || !req.files.book) {
      return res.status(400).json({ error: 'No book file uploaded' });
    }

    const book = req.files.book;
    
    // Validate file type
    if (!validateFileType(book, ['.pdf'])) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Ensure upload directory exists
    await ensureDirectoryExists(config.uploadDir);
    
    // Sanitize filename and create path
    const sanitizedFileName = sanitizeFileName(book.name);
    const bookPath = `${config.uploadDir}/${sanitizedFileName}`;
    
    // Save the file
    await book.mv(bookPath);
    
    // Process the book
    const result = await bookProcessor.processBook(bookPath);
    
    res.json(result);
  } catch (error) {
    console.error('Error in book upload:', error);
    res.status(500).json({ error: 'Error processing book' });
  }
}

export async function getStrategies(req, res) {
  try {
    const strategies = await bookProcessor.getStrategies();
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Error fetching strategies' });
  }
}

export async function getStrategy(req, res) {
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
} 