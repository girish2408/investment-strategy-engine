'use client';

import { useState } from 'react';
import { BookOpenIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { ENDPOINTS, getHeaders } from '@/src/config/api';

interface Strategy {
  strategyName: string;
  description: string;
  fundamentalCriteria: string[];
  technicalPatterns: string[];
  riskManagement: string[];
  entryExitRules: string[];
  portfolioGuidelines: string[];
}

export default function BookAnalysis() {
  const [files, setFiles] = useState<File[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('books', file);
      });

      const response = await axios.post(ENDPOINTS.BOOKS + '/upload', formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      setStrategies(response.data.strategies);
    } catch (err) {
      setError('Failed to upload books. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Analysis</h1>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Selected files:</h3>
            <ul className="list-disc list-inside">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Uploading...' : 'Upload and Analyze'}
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Strategies Display */}
      {strategies.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Extracted Strategies</h2>
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{strategy.strategyName}</h3>
              <p className="text-gray-600 mb-4">{strategy.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Fundamental Criteria</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.fundamentalCriteria.map((criteria, i) => (
                      <li key={i}>{criteria}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Technical Patterns</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.technicalPatterns.map((pattern, i) => (
                      <li key={i}>{pattern}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Risk Management</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.riskManagement.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Entry/Exit Rules</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {strategy.entryExitRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Portfolio Guidelines</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {strategy.portfolioGuidelines.map((guideline, i) => (
                    <li key={i}>{guideline}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 