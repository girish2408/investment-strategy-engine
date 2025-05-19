'use client';

import { useState, useEffect } from 'react';

interface Strategy {
  id: string;
  strategyName: string;
  description: string;
}

interface TechnicalIndicators {
  sma: Record<string, number>;
  rsi: Record<string, number>;
  macd: Record<string, number>;
}

interface AnalysisResult {
  stockSymbol: string;
  strategyName: string;
  isFavorable: boolean;
  confidence: number;
  analysis: {
    fundamental: {
      criteria: string[];
      score: number;
    };
    technical: {
      patterns: string[];
      score: number;
    };
    risk: {
      factors: string[];
      score: number;
    };
  };
  recommendation: string;
  stockData: {
    price: number;
    change: number;
    volume: number;
    marketCap: number;
    peRatio: number;
    dividendYield: number;
    technicalIndicators: TechnicalIndicators;
  };
}

export default function StockAnalysis() {
  const [symbol, setSymbol] = useState('');
  const [strategyId, setStrategyId] = useState('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available strategies when component mounts
  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/strategies');
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setError('Failed to load strategies');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch('http://localhost:3001/api/analysis/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, strategyId }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Error analyzing stock:', error);
      setError('Failed to analyze stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null | undefined, options: Intl.NumberFormatOptions = {}) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', options).format(value);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const getLatestIndicatorValue = (indicator: Record<string, number> | undefined): number | null => {
    if (!indicator || Object.keys(indicator).length === 0) return null;
    const values = Object.entries(indicator)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime());
    return values.length > 0 ? parseFloat(values[0][1]) : null;
  };

  const getIndicatorTrend = (indicator: Record<string, number> | undefined): 'up' | 'down' | 'neutral' | null => {
    if (!indicator || Object.keys(indicator).length < 2) return null;
    const values = Object.entries(indicator)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .slice(0, 2)
      .map(([, value]) => parseFloat(value));
    
    if (values.length < 2) return null;
    const diff = values[0] - values[1];
    if (Math.abs(diff) < 0.01) return 'neutral';
    return diff > 0 ? 'up' : 'down';
  };

  const getIndicatorColor = (indicator: string, value: number | null): string => {
    if (value === null) return 'text-gray-500';
    
    switch (indicator) {
      case 'RSI':
        if (value > 70) return 'text-red-500';
        if (value < 30) return 'text-green-500';
        return 'text-yellow-500';
      case 'MACD':
        return value > 0 ? 'text-green-500' : 'text-red-500';
      case 'SMA':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getIndicatorTrendIcon = (trend: 'up' | 'down' | 'neutral' | null): string => {
    if (!trend) return '→';
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'neutral': return '→';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stock Analysis</h1>

      <form onSubmit={handleAnalyze} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 mb-1">
              Investment Strategy
            </label>
            <select
              id="strategy"
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a strategy</option>
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.strategyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Stock'}
        </button>
      </form>

      {error && (
        <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {analysis && (
        <div className="space-y-8">
          {/* Stock Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{analysis.stockSymbol}</h2>
                <p className="text-gray-600">{analysis.strategyName}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(analysis.stockData.price)}</p>
                <p className={`${analysis.stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.stockData.change >= 0 ? '+' : ''}{formatNumber(analysis.stockData.change)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Volume</p>
                <p className="font-semibold">{formatLargeNumber(analysis.stockData.volume)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="font-semibold">{formatLargeNumber(analysis.stockData.marketCap)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">P/E Ratio</p>
                <p className="font-semibold">{formatNumber(analysis.stockData.peRatio)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dividend Yield</p>
                <p className="font-semibold">{formatPercent(analysis.stockData.dividendYield)}</p>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fundamental Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Fundamental Analysis</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Score</span>
                  <span className="font-semibold">{analysis.analysis.fundamental.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analysis.analysis.fundamental.score}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-2">
                {analysis.analysis.fundamental.criteria.map((criterion, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {criterion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Technical Analysis</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Score</span>
                  <span className="font-semibold">{analysis.analysis.technical.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analysis.analysis.technical.score}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-2">
                {analysis.analysis.technical.patterns.map((pattern, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {pattern}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Risk Analysis</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Score</span>
                  <span className="font-semibold">{analysis.analysis.risk.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${analysis.analysis.risk.score}%` }}
                  ></div>
                </div>
              </div>
              <ul className="space-y-2">
                {analysis.analysis.risk.factors.map((factor, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recommendation</h3>
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                  analysis.isFavorable ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {analysis.isFavorable ? 'BUY' : 'SELL'}
              </div>
              <div>
                <p className="text-lg font-semibold">Confidence: {analysis.confidence}%</p>
                <p className="text-gray-600">{analysis.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Technical Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">SMA (20-day)</h4>
                {analysis.stockData.technicalIndicators.sma && Object.keys(analysis.stockData.technicalIndicators.sma).length > 0 ? (
                  <div>
                    <p className={`text-lg ${getIndicatorColor('SMA', getLatestIndicatorValue(analysis.stockData.technicalIndicators.sma))}`}>
                      {formatNumber(getLatestIndicatorValue(analysis.stockData.technicalIndicators.sma))}
                      <span className="ml-2">{getIndicatorTrendIcon(getIndicatorTrend(analysis.stockData.technicalIndicators.sma))}</span>
                    </p>
                    <p className="text-sm text-gray-500">Simple Moving Average</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No SMA data available</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">RSI (14-day)</h4>
                {analysis.stockData.technicalIndicators.rsi && Object.keys(analysis.stockData.technicalIndicators.rsi).length > 0 ? (
                  <div>
                    <p className={`text-lg ${getIndicatorColor('RSI', getLatestIndicatorValue(analysis.stockData.technicalIndicators.rsi))}`}>
                      {formatNumber(getLatestIndicatorValue(analysis.stockData.technicalIndicators.rsi))}
                      <span className="ml-2">{getIndicatorTrendIcon(getIndicatorTrend(analysis.stockData.technicalIndicators.rsi))}</span>
                    </p>
                    <p className="text-sm text-gray-500">Relative Strength Index</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No RSI data available</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold mb-2">MACD</h4>
                {analysis.stockData.technicalIndicators.macd && Object.keys(analysis.stockData.technicalIndicators.macd).length > 0 ? (
                  <div>
                    <p className={`text-lg ${getIndicatorColor('MACD', getLatestIndicatorValue(analysis.stockData.technicalIndicators.macd))}`}>
                      {formatNumber(getLatestIndicatorValue(analysis.stockData.technicalIndicators.macd))}
                      <span className="ml-2">{getIndicatorTrendIcon(getIndicatorTrend(analysis.stockData.technicalIndicators.macd))}</span>
                    </p>
                    <p className="text-sm text-gray-500">Moving Average Convergence Divergence</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No MACD data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 