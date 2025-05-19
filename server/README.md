# Investment Strategy Engine - Server

This is the server component of the Investment Strategy Engine, which processes investment books and analyzes stocks based on extracted strategies.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3001
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Books
- `POST /api/books/upload` - Upload investment books (PDF files)
- `GET /api/books/strategies` - Get all extracted strategies

### Analysis
- `POST /api/analysis/analyze` - Analyze a stock using a specific strategy
  - Body: `{ stockSymbol: string, strategyId: string }`

## Features

- PDF book processing and strategy extraction
- Stock analysis based on extracted strategies
- Fundamental, technical, and risk analysis
- Strategy-based recommendations

## Dependencies

- Express.js - Web framework
- LangChain - AI/ML processing
- OpenAI - GPT-4 integration
- PDF.js - PDF processing
- Multer - File upload handling 