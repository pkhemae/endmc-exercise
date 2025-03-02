'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SuggestionModal from '@/components/SuggestionModal';
import SuggestionCard from '@/components/SuggestionCard';

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
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onLike={handleLikeSuggestion}
                  onDislike={handleDislikeSuggestion}
                  onDelete={handleDeleteSuggestion}
                  onClick={(id) => {
                    // You can add navigation or modal open logic here
                    console.log(`Clicked suggestion: ${id}`);
                    // Example: router.push(`/suggestions/${id}`);
                  }}
                />
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