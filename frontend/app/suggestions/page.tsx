'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import SuggestionsList from '@/components/SuggestionsList';

export default function SuggestionsPage() {
  const { fetchSuggestions, likeSuggestion, dislikeSuggestion, isLoading } = useSuggestions();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    filterSuggestions();
  }, [searchTerm, allSuggestions]);

  const filterSuggestions = () => {
    if (searchTerm.trim() === '') {
      setFilteredSuggestions(allSuggestions);
      return;
    }
    
    const filtered = allSuggestions.filter(suggestion => 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

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

  const updateSuggestionInState = (suggestionId: number, updatedSuggestion: Suggestion) => {
    const updateFn = (prev: Suggestion[]) => 
      prev.map(suggestion => 
        suggestion.id === suggestionId ? updatedSuggestion : suggestion
      );
    
    setAllSuggestions(updateFn);
    setFilteredSuggestions(updateFn);
  };

  const handleLikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await likeSuggestion(suggestionId);
      if (updatedSuggestion) {
        updateSuggestionInState(suggestionId, updatedSuggestion);
      }
    } catch (err) {
      console.error('Error liking suggestion:', err);
    }
  };

  const handleDislikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestionId);
      if (updatedSuggestion) {
        updateSuggestionInState(suggestionId, updatedSuggestion);
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
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
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
          <LoadingSpinner />
        ) : fetchError ? (
          <div className="bg-red-900/20 rounded-lg p-4 text-red-400">
            <p>Error: {fetchError}</p>
          </div>
        ) : filteredSuggestions.length > 0 ? (
          <SuggestionsList
            suggestions={filteredSuggestions}
            totalCount={totalCount}
            onLike={handleLikeSuggestion}
            onDislike={handleDislikeSuggestion}
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-300">No suggestions found.</p>
          </div>
        )}
      </main>
    </div>
  );
}