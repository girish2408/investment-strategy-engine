import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          AI-Powered Investment Strategy Engine
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Upload investment books, extract sophisticated strategies, and analyze stocks using AI-powered tools.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/books"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get started
            <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5 inline" />
          </Link>
          <Link href="/strategies" className="text-sm font-semibold leading-6 text-gray-900">
            View strategies <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="mt-32">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Book Analysis</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Upload investment books and extract sophisticated trading strategies using AI.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Strategy Matching</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Match stocks against your investment strategies using advanced pattern recognition.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h3 className="text-lg font-semibold leading-8 text-gray-900">Technical Analysis</h3>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Get detailed technical analysis with entry and exit points for your trades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 