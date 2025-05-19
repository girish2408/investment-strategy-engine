import { ChatOpenAI } from '@langchain/openai';
import bookProcessor from '../bookProcessor/bookProcessor.js';
import { config } from '../../config/config.js';
import axios from 'axios';
import yahooFinance from 'yahoo-finance2';

class StockAnalyzer {
  constructor() {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.llm = new ChatOpenAI({
      temperature: 0.3,
      modelName: 'gpt-4-turbo-preview',
      openAIApiKey: config.openaiApiKey
    });

    // Initialize API keys
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!this.alphaVantageKey) {
      console.warn('Alpha Vantage API key not found. Some features may be limited.');
    }
  }

  async analyzeStock(stockSymbol, strategyId) {
    try {
      console.log(`Analyzing stock ${stockSymbol} with strategy ${strategyId}`);
      
      // Get the strategy
      const strategy = await bookProcessor.getStrategy(strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }
      console.log('Strategy loaded successfully');

      // Get stock data from Yahoo Finance
      console.log('Fetching stock data from Yahoo Finance...');
      const stockData = await this.getYahooFinanceData(stockSymbol);
      console.log('Stock data fetched successfully');

      // Get technical indicators
      console.log('Calculating technical indicators...');
      const technicalIndicators = await this.calculateTechnicalIndicators(stockSymbol);
      console.log('Technical indicators calculated successfully');

      // Analyze the stock using the strategy and data
      console.log('Performing analysis...');
      const analysis = await this.performAnalysis(stockSymbol, stockData, technicalIndicators, strategy);
      console.log('Analysis completed successfully');

      return {
        stockSymbol,
        strategyName: strategy.metadata.strategyName,
        isFavorable: analysis.isFavorable,
        confidence: analysis.confidence,
        analysis: {
          fundamental: {
            criteria: analysis.fundamentalCriteria,
            score: analysis.fundamentalScore
          },
          technical: {
            patterns: analysis.technicalPatterns,
            score: analysis.technicalScore
          },
          risk: {
            factors: analysis.riskFactors,
            score: analysis.riskScore
          }
        },
        recommendation: analysis.recommendation,
        stockData: {
          price: stockData.price,
          change: stockData.change,
          volume: stockData.volume,
          marketCap: stockData.marketCap,
          peRatio: stockData.peRatio,
          dividendYield: stockData.dividendYield,
          technicalIndicators
        }
      };
    } catch (error) {
      console.error('Error in stock analysis:', error);
      throw new Error(`Stock analysis failed: ${error.message}`);
    }
  }

  async getYahooFinanceData(symbol) {
    try {
      console.log('Fetching Yahoo Finance data...');
      
      // Validate symbol format
      if (!symbol || typeof symbol !== 'string') {
        throw new Error('Invalid stock symbol');
      }

      // Try to get quote data first
      const quote = await yahooFinance.quote(symbol);
      if (!quote) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      // Try to get additional data, but don't fail if it's not available
      let additionalData = {};
      try {
        const summary = await yahooFinance.quoteSummary(symbol, { 
          modules: ['summaryProfile', 'defaultKeyStatistics', 'financialData']
        });
        if (summary) {
          additionalData = {
            sector: summary.summaryProfile?.sector,
            industry: summary.summaryProfile?.industry,
            marketCap: summary.summaryProfile?.marketCap,
            forwardPE: summary.defaultKeyStatistics?.forwardPE,
            priceToBook: summary.defaultKeyStatistics?.priceToBook,
            profitMargins: summary.defaultKeyStatistics?.profitMargins,
            dividendYield: summary.defaultKeyStatistics?.yield
          };
        }
      } catch (summaryError) {
        console.warn(`Could not fetch additional data for ${symbol}:`, summaryError.message);
      }

      // Helper function to safely parse numeric values
      const safeParseFloat = (value) => {
        if (value === undefined || value === null) return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper function to handle dividend yield specifically
      const parseDividendYield = (value) => {
        if (value === undefined || value === null) return null;
        // If the value is already a decimal (e.g., 0.02 for 2%), return it as is
        if (value < 1) return value * 100;
        // If the value is a percentage (e.g., 2 for 2%), return it as is
        return safeParseFloat(value);
      };

      return {
        price: safeParseFloat(quote.regularMarketPrice),
        change: safeParseFloat(quote.regularMarketChange),
        changePercent: safeParseFloat(quote.regularMarketChangePercent),
        volume: safeParseFloat(quote.regularMarketVolume),
        marketCap: safeParseFloat(quote.marketCap || additionalData.marketCap),
        peRatio: safeParseFloat(quote.trailingPE || quote.forwardPE || additionalData.forwardPE),
        dividendYield: parseDividendYield(quote.dividendYield || additionalData.dividendYield),
        eps: safeParseFloat(quote.epsTrailingTwelveMonths),
        beta: safeParseFloat(quote.beta),
        sector: quote.sector || additionalData.sector,
        industry: quote.industry || additionalData.industry,
        fiftyTwoWeekHigh: safeParseFloat(quote.fiftyTwoWeekHigh),
        fiftyTwoWeekLow: safeParseFloat(quote.fiftyTwoWeekLow),
        averageVolume: safeParseFloat(quote.averageVolume),
        forwardPE: safeParseFloat(quote.forwardPE || additionalData.forwardPE),
        priceToBook: safeParseFloat(quote.priceToBook || additionalData.priceToBook),
        profitMargins: safeParseFloat(quote.profitMargins || additionalData.profitMargins)
      };
    } catch (error) {
      console.error('Error fetching Yahoo Finance data:', error);
      throw new Error(`Failed to fetch Yahoo Finance data: ${error.message}`);
    }
  }

  async calculateTechnicalIndicators(symbol) {
    try {
      console.log('Fetching historical data for technical indicators...');
      const historicalData = await yahooFinance.historical(symbol, {
        period1: '2024-01-01',
        period2: new Date().toISOString().split('T')[0],
        interval: '1d'
      });

      if (!historicalData || historicalData.length === 0) {
        throw new Error('No historical data available');
      }

      // Sort data by date in ascending order
      const sortedData = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Calculate SMA (40-day)
      const sma = this.calculateSMA(sortedData, 40);

      // Calculate RSI (14-day)
      const rsi = this.calculateRSI(sortedData, 28);

      // Calculate MACD
      const macd = this.calculateMACD(sortedData);

      return {
        sma,
        rsi,
        macd
      };
    } catch (error) {
      console.error('Error calculating technical indicators:', error);
      return {
        sma: {},
        rsi: {},
        macd: {}
      };
    }
  }

  calculateSMA(data, period) {
    const sma = {};
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
      const average = sum / period;
      sma[data[i].date.toISOString().split('T')[0]] = average;
    }
    return sma;
  }

  calculateRSI(data, period) {
    const rsi = {};
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate RSI for the rest of the data
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }

      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi[data[i].date.toISOString().split('T')[0]] = rsiValue;
    }

    return rsi;
  }

  calculateMACD(data) {
    const macd = {};
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);

    // Calculate MACD line and signal line
    for (let i = 26; i < data.length; i++) {
      const date = data[i].date.toISOString().split('T')[0];
      const macdLine = ema12[date] - ema26[date];
      macd[date] = macdLine;
    }

    return macd;
  }

  calculateEMA(data, period) {
    const ema = {};
    const multiplier = 2 / (period + 1);

    // Calculate first EMA using SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    ema[data[period - 1].date.toISOString().split('T')[0]] = sum / period;

    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      const date = data[i].date.toISOString().split('T')[0];
      const prevDate = data[i - 1].date.toISOString().split('T')[0];
      ema[date] = (data[i].close - ema[prevDate]) * multiplier + ema[prevDate];
    }

    return ema;
  }

  async performAnalysis(symbol, stockData, technicalIndicators, strategy) {
    // Get only the latest values for technical indicators
    const getLatestValues = (indicator) => {
      if (!indicator || Object.keys(indicator).length === 0) return null;
      const entries = Object.entries(indicator)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .slice(0, 5); // Get only last 5 values
      return Object.fromEntries(entries);
    };

    const latestIndicators = {
      sma: getLatestValues(technicalIndicators.sma),
      rsi: getLatestValues(technicalIndicators.rsi),
      macd: getLatestValues(technicalIndicators.macd)
    };

    const prompt = `Analyze the stock ${symbol} using the following investment strategy and market data:
    
    Strategy Name: ${strategy.metadata.strategyName}
    Description: ${strategy.metadata.description}
    
    Fundamental Criteria:
    ${strategy.metadata.fundamentalCriteria.join('\n')}
    
    Technical Patterns:
    ${strategy.metadata.technicalPatterns.join('\n')}
    
    Risk Management:
    ${strategy.metadata.riskManagement.join('\n')}
    
    Entry/Exit Rules:
    ${strategy.metadata.entryExitRules.join('\n')}
    
    Current Stock Data:
    ${JSON.stringify({
      price: stockData.price,
      change: stockData.change,
      volume: stockData.volume,
      marketCap: stockData.marketCap,
      peRatio: stockData.peRatio,
      dividendYield: stockData.dividendYield,
      sector: stockData.sector,
      industry: stockData.industry
    }, null, 2)}
    
    Technical Indicators (Last 5 values):
    ${JSON.stringify(latestIndicators, null, 2)}
    
    Provide a detailed analysis in JSON format with the following structure. Return ONLY the JSON object, no markdown formatting or additional text:
    {
      "isFavorable": boolean,
      "confidence": number (0-100),
      "fundamentalCriteria": string[],
      "fundamentalScore": number (0-100),
      "technicalPatterns": string[],
      "technicalScore": number (0-100),
      "riskFactors": string[],
      "riskScore": number (0-100),
      "recommendation": string
    }`;

    const response = await this.llm.invoke(prompt);
    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    try {
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      console.error('Raw response:', response);
      throw new Error('Failed to parse analysis response');
    }
  }
}

export default new StockAnalyzer(); 