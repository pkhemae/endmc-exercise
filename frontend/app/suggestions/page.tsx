'use client';

import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import SuggestionsList from '@/components/SuggestionsList';
import { motion } from 'framer-motion';

export default function SuggestionsPage() {
  const { fetchSuggestions, likeSuggestion, dislikeSuggestion, isLoading } = useSuggestions();
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const loadSuggestions = useCallback(async () => {
    try {
      setRefreshing(true);
      const result = await fetchSuggestions();
      if (result) {
        setAllSuggestions(result.suggestions);
        setFilteredSuggestions(result.suggestions);
        setTotalCount(result.total);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des suggestions:', err);
      setFetchError('Impossible de charger les suggestions');
    } finally {
      setRefreshing(false);
    }
  }, [fetchSuggestions]);

  const filterSuggestions = useCallback(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuggestions(allSuggestions);
      return;
    }
    
    const filtered = allSuggestions.filter(suggestion => 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredSuggestions(filtered);
  }, [searchTerm, allSuggestions]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  useEffect(() => {
    filterSuggestions();
  }, [filterSuggestions]);

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
      console.error('Erreur lors du like de la suggestion:', err);
    }
  };

  const handleDislikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestionId);
      if (updatedSuggestion) {
        updateSuggestionInState(suggestionId, updatedSuggestion);
      }
    } catch (err) {
      console.error('Erreur lors du dislike de la suggestion:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <Navbar />
      <motion.main 
        className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <motion.div 
          className="flex flex-col space-y-6 mb-8"
          variants={itemVariants}
        >
          <motion.div className="flex justify-between items-center" variants={itemVariants}>
            <h1 className="text-3xl font-bold text-white">Suggestions</h1>
            <span className="text-gray-400 text-sm">{totalCount} suggestion{totalCount !== 1 ? 's' : ''}</span>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            variants={itemVariants}
          >
            <div className="flex-grow">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
            
            <motion.button 
              onClick={loadSuggestions}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-[#252525] rounded-xl px-4 py-2.5 hover:bg-[#303030] border border-gray-700 transition-colors duration-200 disabled:opacity-50 sm:w-auto w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-5 w-5 text-gray-300 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-gray-300 sm:hidden">Rafraîchir</span>
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {isLoading && !refreshing ? (
            <div className="flex justify-center items-center h-60">
              <LoadingSpinner />
            </div>
          ) : fetchError ? (
            <motion.div 
              className="bg-red-900/20 rounded-xl p-6 text-red-400 border border-red-900/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-center">{fetchError}</p>
            </motion.div>
          ) : filteredSuggestions.length > 0 ? (
            <SuggestionsList
              suggestions={filteredSuggestions}
              onLike={handleLikeSuggestion}
              onDislike={handleDislikeSuggestion}
              totalCount={totalCount} // Add this line to pass the totalCount prop
            />
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center h-60 bg-[#252525] rounded-xl border border-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-300 text-lg mb-2">Aucune suggestion trouvée</p>
              <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
            </motion.div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}