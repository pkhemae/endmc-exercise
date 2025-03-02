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
  const { fetchUserSuggestions, likeSuggestion, dislikeSuggestion, deleteSuggestion, isLoading } = useSuggestions();
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  const needsRefresh = useRef(false);

  useEffect(() => {
    console.log('Dashboard: Auth effect running, getting current user');
    getCurrentUser();
  }, []);

  useEffect(() => {
    console.log('Dashboard: User effect triggered', { user });
    
    // Make sure user exists and has an ID before making the API call
    if (!user || typeof user.id !== 'number') {
      console.log('Dashboard: User or user ID not available yet:', user);
      return;
    }
    
    const loadSuggestions = async () => {
      try {
        setIsRefreshing(true);
        console.log('Dashboard: Fetching suggestions for user ID:', user.id);
        
        // Use fetchUserSuggestions with the correct user ID
        const result = await fetchUserSuggestions(user.id);
        console.log('Dashboard: fetchUserSuggestions result:', result);
        
        if (result) {
          console.log('Dashboard: Loaded user suggestions:', result.suggestions);
          setUserSuggestions(result.suggestions);
        } else {
          console.log('Dashboard: No result from fetchUserSuggestions');
        }
      } catch (err) {
        console.error('Dashboard: Erreur lors du chargement des suggestions:', err);
        setFetchError('Impossible de charger les suggestions');
      } finally {
        setIsRefreshing(false);
      }
    };

    loadSuggestions();
    needsRefresh.current = false;
  }, [user, isModalOpen]); // Remove fetchUserSuggestions from dependencies

  // Handle modal close with refresh
  const handleModalClose = () => {
    setIsModalOpen(false);
    
    if (user && typeof user.id === 'number') { // Ensure user.id is a number
      const loadSuggestions = async () => {
        try {
          console.log('Actualisation des suggestions après fermeture pour user ID:', user.id);
          // Use fetchUserSuggestions with the correct user ID
          const result = await fetchUserSuggestions(user.id);
          if (result) {
            console.log('Updated user suggestions:', result.suggestions);
            setUserSuggestions(result.suggestions);
          }
        } catch (err) {
          console.error('Erreur lors du chargement des suggestions:', err);
          setFetchError('Impossible de charger les suggestions');
        }
      };
      
      loadSuggestions();
    }
  };
  
  const handleDeleteSuggestion = async (suggestionId: number) => {
    try {
      const success = await deleteSuggestion(suggestionId);
      if (success) {
        setUserSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      } else {
        console.error('Failed to delete suggestion');
      }
    } catch (err) {
      console.error('Error deleting suggestion:', err);
    }
  };

  const handleLikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await likeSuggestion(suggestionId);
      if (updatedSuggestion) {
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

  const handleDislikeSuggestion = async (suggestionId: number) => {
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestionId);
      if (updatedSuggestion) {
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
            <span className="font-medium text-white text-base">Ajouter une suggestion</span>
            <Plus className="h-4 w-4 text-white/70" />
          </button>
          
          {isLoading && !isRefreshing ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : fetchError ? (
            <div className="bg-red-900/20 rounded-lg p-4 text-red-400">
              <p>Erreur : {fetchError}</p>
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
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <X className="h-32 w-32 text-red-500 mb-4 stroke-[1.5]" />
                <p className="text-gray-300">Vous n&apos;avez pas encore créé de suggestion.</p>
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