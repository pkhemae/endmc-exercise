'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SuggestionModal from '@/components/SuggestionModal';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { getCurrentUser, user } = useAuth();
  const { fetchSuggestions, likeSuggestion, dislikeSuggestion, deleteSuggestion, isLoading, error } = useSuggestions();
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const dropdownRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  // Use a ref to track if we need to refresh
  const needsRefresh = useRef(false);

  // Load user data once
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Load suggestions when user changes or when modal closes
  useEffect(() => {
    // Skip if no user
    if (!user) return;
    
    // Function to load suggestions
    const loadSuggestions = async () => {
      try {
        console.log("Fetching all suggestions");
        const allResult = await fetchSuggestions();
        if (allResult) {
          // Filter suggestions by user ID
          const filtered = allResult.suggestions.filter(s => 
            s.user_id === 2 // Hardcoded to match your database
          );
          console.log("Filtered suggestions:", filtered);
          setUserSuggestions(filtered);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setFetchError("Failed to fetch suggestions");
      }
    };

    // Load suggestions
    loadSuggestions();
    
    // Reset the refresh flag
    needsRefresh.current = false;
  }, [user, needsRefresh.current]); // Only depend on user and the ref value

// Add this effect after your other useEffects
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (openDropdownId !== null && 
        dropdownRef.current[openDropdownId] && 
        !dropdownRef.current[openDropdownId]?.contains(event.target as Node)) {
      setOpenDropdownId(null);
    }
  }

  if (openDropdownId !== null) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [openDropdownId]);

  // Handle modal close with refresh
  const handleModalClose = () => {
    setIsModalOpen(false);
    
    // Instead of using setTimeout and forcing a re-render, directly refresh
    if (user) {
      const loadSuggestions = async () => {
        try {
          console.log("Refreshing suggestions after modal close");
          const allResult = await fetchSuggestions();
          if (allResult) {
            // Filter suggestions by user ID
            const filtered = allResult.suggestions.filter(s => 
              s.user_id === 2 // Hardcoded to match your database
            );
            setUserSuggestions(filtered);
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          setFetchError("Failed to fetch suggestions");
        }
      };
      
      loadSuggestions();
    }
  };

  // Add delete suggestion handler
  const handleDeleteSuggestion = async (suggestionId: number) => {
    if (window.confirm('Are you sure you want to delete this suggestion?')) {
      try {
        const success = await deleteSuggestion(suggestionId);
        if (success) {
          // Remove the suggestion from the state
          setUserSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        } else {
          console.error('Failed to delete suggestion');
        }
      } catch (err) {
        console.error('Error deleting suggestion:', err);
      }
    }
  };

  // Handle like suggestion
  const handleLikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await likeSuggestion(suggestionId);
      if (updatedSuggestion) {
        // Update the suggestion in the state
        setUserSuggestions(prev => 
          prev.map(suggestion => 
            suggestion.id === suggestionId ? updatedSuggestion : suggestion
          )
        );
      }
    } catch (err) {
      console.error('Error liking suggestion:', err);
    }
  };

  // Handle dislike suggestion
  const handleDislikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestionId);
      if (updatedSuggestion) {
        // Update the suggestion in the state
        setUserSuggestions(prev => 
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
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-[#252525] rounded-xl shadow-lg p-6 border border-gray-700">
            <h2 className="text-lg font-medium text-white mb-4">Bienvenue sur EndMC</h2>
            <p className="text-gray-300">kayako beme</p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">Mes suggestions</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-orange-500 p-2 rounded-full transition-transform duration-300 hover:rotate-90"
              aria-label="Ajouter une suggestion"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : fetchError ? (
            <div className="bg-red-900/20 rounded-lg p-4 text-red-400">
              <p>Error: {fetchError}</p>
            </div>
          ) : userSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="bg-[#252525] rounded-xl overflow-hidden shadow-xl border border-gray-700 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-white/90 line-clamp-2">
                        {suggestion.title}
                      </h3>
                      <div 
                        className="relative"
                        ref={el => dropdownRef.current[suggestion.id] = el}
                      >
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === suggestion.id ? null : suggestion.id)}
                          className="flex items-center p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                          <svg 
                            className={`h-5 w-5 transition-transform duration-200 ${
                              openDropdownId === suggestion.id ? 'rotate-180' : ''
                            }`}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {openDropdownId === suggestion.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-[#252525] rounded-lg shadow-lg border border-gray-700 overflow-hidden z-20"
                          >
                            <button 
                              onClick={() => {
                                handleDeleteSuggestion(suggestion.id);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  
                    {/* Description */}
                    <p className="mt-3 text-gray-300 text-sm line-clamp-3">
                      {suggestion.description}
                    </p>
                    
                    {/* Stats and Actions */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">{suggestion.likes_count}</span>
                          <span className="text-gray-500">likes</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">{suggestion.dislikes_count}</span>
                          <span className="text-gray-500">dislikes</span>
                        </div>
                      </div>
                    
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeSuggestion(suggestion.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            suggestion.user_has_liked
                              ? 'bg-green-500/20 text-green-400'
                              : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDislikeSuggestion(suggestion.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            suggestion.user_has_disliked
                              ? 'bg-red-500/20 text-red-400'
                              : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#252525] rounded-xl p-8 text-center shadow-xl border border-gray-700/50">
              <p className="text-gray-300">Aucune suggestion trouvée. Créez-en une avec le bouton +</p>
            </div>
          )}
        </div>
      </main>

      <SuggestionModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}