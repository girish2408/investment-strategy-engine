'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS, getHeaders } from '@/src/config/api';

interface Strategy {
  id: string;
  strategyName: string;
  description: string;
  fundamentalCriteria: string[];
  technicalPatterns: string[];
  riskManagement: string[];
  entryExitRules: string[];
  portfolioGuidelines: string[];
  sourceBook: string;
  isProprietary: boolean;
  createdAt: string;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await axios.get(ENDPOINTS.STRATEGIES, {
          headers: getHeaders()
        });
        setStrategies(response.data);
      } catch (err) {
        setError('Failed to fetch strategies. Please try again.');
        console.error('Error fetching strategies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Investment Strategies</h1>
      
      {strategies.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No strategies found. Upload a book to extract strategies.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold">{strategy.strategyName}</h2>
                {strategy.isProprietary && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    Proprietary
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">{strategy.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Fundamental Criteria</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.fundamentalCriteria.map((criteria, i) => (
                      <li key={i}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Technical Patterns</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.technicalPatterns.map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Risk Management</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.riskManagement.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Entry/Exit Rules</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.entryExitRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Portfolio Guidelines</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {strategy.portfolioGuidelines.map((guideline, i) => (
                    <li key={i}>{guideline}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>Source: {strategy.sourceBook}</p>
                <p>Created: {new Date(strategy.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 