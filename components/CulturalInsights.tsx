import React, { useState } from 'react';
import { searchCulturalInsights } from '../services/geminiService';
import { Search, Globe, ExternalLink } from 'lucide-react';

const CulturalInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{text: string, sources: Array<{uri: string, title: string}>} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const data = await searchCulturalInsights(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-800">Cultural Insights</h2>
        <p className="text-slate-500">Use Google Search Grounding to find up-to-date cultural information and language usage.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'What is the current slang for cool in Berlin?' or 'Top 5 cafes in Tokyo 2024'"
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm text-lg"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
          <button 
            type="submit" 
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
      </form>

      {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6 animate-fade-in">
              <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-800">{result.text}</p>
              </div>

              {result.sources.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                          <Globe className="w-4 h-4 mr-2" /> Sources
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.sources.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-start p-3 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors group"
                              >
                                  <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-700">{source.title}</p>
                                      <p className="text-xs text-slate-500 truncate">{source.uri}</p>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 ml-2" />
                              </a>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default CulturalInsights;