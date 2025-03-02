'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SuggestionCard from '@/components/SuggestionCard';
import { Search, RefreshCw } from 'lucide-react';

export default function SuggestionsPage() {
  const { fetchSuggestions, likeSuggestion, dislikeSuggestion, isLoading, error } = useSuggestions();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Filter suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuggestions(allSuggestions);
    } else {
      const filtered = allSuggestions.filter(
        suggestion => 
          suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [searchTerm, allSuggestions]);

  const loadSuggestions = async () => {
    try {
      setRefreshing(true);
      const result = await fetchSuggestions();
      if (result) {
        setAllSuggestions(result.suggestions);
        setFilteredSuggestions(result.suggestions);
        setTotalCount(result.total);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setFetchError("Failed to fetch suggestions");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await likeSuggestion(suggestionId);
      if (updatedSuggestion) {
        // Update both arrays
        setAllSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId ? updatedSuggestion : suggestion
          )
        );
        setFilteredSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId ? updatedSuggestion : suggestion
          )
        );
      }
    } catch (err) {
      console.error('Error liking suggestion:', err);
    }
  };

  const handleDislikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestionId);
      if (updatedSuggestion) {
        // Update both arrays
        setAllSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId ? updatedSuggestion : suggestion
          )
        );
        setFilteredSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId ? updatedSuggestion : suggestion
          )
        );
      }
    } catch (err) {
      console.error('Error disliking suggestion:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white mb-4 md:mb-0">Suggestions</h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#252525] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <button 
              onClick={loadSuggestions}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-[#252525] rounded-xl px-4 py-2 hover:border-gray-600 border border-gray-700 active:scale-95 transform transition-transform duration-150"
              aria-label="Refresh suggestions"
            >
              <RefreshCw className={`h-5 w-5 text-white/70 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isLoading && !refreshing ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : fetchError ? (
          <div className="bg-red-900/20 rounded-lg p-4 text-red-400">
            <p>Error: {fetchError}</p>
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              Showing {filteredSuggestions.length} of {totalCount} suggestions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onLike={handleLikeSuggestion}
                  onDislike={handleDislikeSuggestion}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-300">No suggestions found.</p>
          </div>
        )}
      </main>
    </div>
  );
}