import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { config } from '../../config/config.js';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

class BookProcessor {
  constructor() {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required. Please set OPENAI_API_KEY in your .env file');
    }

    this.llm = new ChatOpenAI({
      temperature: 0.3,
      modelName: 'gpt-4-turbo-preview',
      openAIApiKey: config.openaiApiKey
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openaiApiKey
    });

    // Initialize storage directory
    this.storageDir = path.join(process.cwd(), 'data');
    this.strategiesFile = path.join(this.storageDir, 'strategies.json');
    this.initializeStorage();

    // Maximum tokens per request (30,000 for GPT-4)
    this.MAX_TOKENS = 30000;
    // Average characters per token (rough estimate)
    this.CHARS_PER_TOKEN = 4;
    // Maximum characters per chunk
    this.MAX_CHUNK_SIZE = this.MAX_TOKENS * this.CHARS_PER_TOKEN;
  }

  async initializeStorage() {
    try {
      // Create storage directory if it doesn't exist
      await fs.mkdir(this.storageDir, { recursive: true });
      
      // Initialize strategies file if it doesn't exist
      try {
        await fs.access(this.strategiesFile);
      } catch {
        await fs.writeFile(this.strategiesFile, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }

  async loadStrategies() {
    try {
      const data = await fs.readFile(this.strategiesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading strategies:', error);
      return [];
    }
  }

  async saveStrategies(strategies) {
    try {
      await fs.writeFile(this.strategiesFile, JSON.stringify(strategies, null, 2));
    } catch (error) {
      console.error('Error saving strategies:', error);
      throw error;
    }
  }

  async getStrategies() {
    try {
      const strategies = await this.loadStrategies();
      return strategies.map(doc => ({
        id: doc.id,
        strategyName: doc.metadata.strategyName,
        description: doc.metadata.description,
        fundamentalCriteria: doc.metadata.fundamentalCriteria || [],
        technicalPatterns: doc.metadata.technicalPatterns || [],
        riskManagement: doc.metadata.riskManagement || [],
        entryExitRules: doc.metadata.entryExitRules || [],
        portfolioGuidelines: doc.metadata.portfolioGuidelines || [],
        sourceBook: doc.metadata.sourceBook,
        isProprietary: doc.metadata.isProprietary,
        createdAt: doc.metadata.createdAt,
        updatedAt: doc.metadata.updatedAt
      }));
    } catch (error) {
      console.error('Error getting strategies:', error);
      throw error;
    }
  }

  async getStrategy(id) {
    try {
      const strategies = await this.loadStrategies();
      return strategies.find(s => s.id === id);
    } catch (error) {
      console.error('Error getting strategy:', error);
      throw error;
    }
  }

  // Helper function to split text into chunks
  splitIntoChunks(text) {
    // If text is smaller than max chunk size, return it as a single chunk
    if (text.length <= this.MAX_CHUNK_SIZE) {
      return [text];
    }

    const chunks = [];
    let currentChunk = '';
    let currentLength = 0;

    // Split text into paragraphs first
    const paragraphs = text.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the limit
      if (currentLength + paragraph.length > this.MAX_CHUNK_SIZE) {
        // If we have content in the current chunk, save it
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
          currentLength = 0;
        }

        // If the paragraph itself is too long, split it into sentences
        if (paragraph.length > this.MAX_CHUNK_SIZE) {
          const sentences = paragraph.split(/[.!?]+/);
          for (const sentence of sentences) {
            if (currentLength + sentence.length > this.MAX_CHUNK_SIZE) {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
                currentLength = 0;
              }
              // If a single sentence is too long, split it into words
              if (sentence.length > this.MAX_CHUNK_SIZE) {
                const words = sentence.split(' ');
                let tempChunk = '';
                let tempLength = 0;
                for (const word of words) {
                  if (tempLength + word.length > this.MAX_CHUNK_SIZE) {
                    if (tempChunk) {
                      chunks.push(tempChunk.trim());
                      tempChunk = '';
                      tempLength = 0;
                    }
                  }
                  tempChunk += (tempChunk ? ' ' : '') + word;
                  tempLength += word.length + 1;
                }
                if (tempChunk) {
                  chunks.push(tempChunk.trim());
                }
              } else {
                chunks.push(sentence.trim());
              }
            } else {
              currentChunk += (currentChunk ? '. ' : '') + sentence;
              currentLength += sentence.length + 2;
            }
          }
        } else {
          chunks.push(paragraph.trim());
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
        currentLength += paragraph.length + 2;
      }
    }

    // Add any remaining content
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async processBook(fileBuffer, filename) {
    try {
      // Extract text from PDF using pdf-parse
      const data = await pdfParse(fileBuffer);
      const fullText = data.text;

      // Split text into maximum-sized chunks
      const chunks = this.splitIntoChunks(fullText);
      console.log(`Processing book in ${chunks.length} chunks (max size: ${this.MAX_CHUNK_SIZE} characters)...`);

      // Process each chunk and collect strategies
      const allStrategies = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} characters)...`);

        const prompt = `
          Analyze the following text from an investment book and extract any investment strategies.
          For each strategy, identify:
          1. Strategy name
          2. Description
          3. Fundamental criteria
          4. Technical patterns
          5. Risk management rules
          6. Entry and exit rules
          7. Portfolio guidelines

          Text to analyze:
          ${chunks[i]}

          Return the response in the following JSON format:
          {
            "strategies": [
              {
                "strategyName": "string",
                "description": "string",
                "fundamentalCriteria": ["string"],
                "technicalPatterns": ["string"],
                "riskManagement": ["string"],
                "entryExitRules": ["string"],
                "portfolioGuidelines": ["string"]
              }
            ]
          }
        `;

        const response = await this.llm.invoke(prompt);
        const result = JSON.parse(response);

        // Add source book and metadata to each strategy
        const strategiesWithMetadata = result.strategies.map(strategy => ({
          id: `strategy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          pageContent: chunks[i],
          metadata: {
            ...strategy,
            sourceBook: filename,
            isProprietary: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }));

        allStrategies.push(...strategiesWithMetadata);
      }

      // Save all strategies
      await this.saveStrategies(allStrategies);
      console.log(`Found ${allStrategies.length} unique strategies in the book.`);

      return allStrategies;
    } catch (error) {
      console.error('Error processing book:', error);
      throw error;
    }
  }

  async markStrategyAsProprietary(id) {
    try {
      const strategies = await this.loadStrategies();
      const strategy = strategies.find(s => s.id === id);
      if (!strategy) {
        throw new Error('Strategy not found');
      }
      strategy.metadata.isProprietary = true;
      strategy.metadata.updatedAt = new Date().toISOString();
      await this.saveStrategies(strategies);
      return strategy;
    } catch (error) {
      console.error('Error marking strategy as proprietary:', error);
      throw error;
    }
  }
}

export default new BookProcessor();