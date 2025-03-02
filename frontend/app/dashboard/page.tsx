'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SuggestionModal from '@/components/SuggestionModal';
import UserSuggestionCard from '@/components/UserSuggestionCard';
import { X, Plus } from 'lucide-react';

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
  }, [user, isModalOpen]); // Changed from needsRefresh.current to isModalOpen

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
  // Add these states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // Update your handlers
  const handleDeleteSuggestion = async (suggestionId: number) => {
    try {
      setActionLoadingId(suggestionId);
      const success = await deleteSuggestion(suggestionId);
      if (success) {
        setUserSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      } else {
        console.error('Failed to delete suggestion');
      }
    } catch (err) {
      console.error('Error deleting suggestion:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Similarly update handleLikeSuggestion and handleDislikeSuggestion
  // Then pass actionLoadingId to your UserSuggestionCard component
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

        <div className="mt-8">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 mb-4 bg-[#252525] rounded-xl px-4 py-2 hover:border-gray-600 border border-gray-700 active:scale-95 transform transition-transform duration-150"
            aria-label="Ajouter une suggestion"
          >
            <span className="font-medium text-white text-base">Mes suggestions</span>
            <Plus className="h-4 w-4 text-white/70" />
          </button>
          
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
                <UserSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onLike={handleLikeSuggestion}
                  onDislike={handleDislikeSuggestion}
                  onDelete={handleDeleteSuggestion}
                  onClick={(id) => {
                    console.log(`Clicked suggestion: ${id}`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <X className="h-32 w-32 text-red-500 mb-4 stroke-[1.5]" />
                <p className="text-gray-300">Vous n'avez pas encore crée de suggestion.</p>
              </div>
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