'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useSuggestions } from '@/hooks/useSuggestions';
import { Suggestion } from '@/types/suggestion';
import SuggestionModal from '@/components/SuggestionModal';

export default function Dashboard() {
  const { getCurrentUser, user } = useAuth();
  const { fetchUserSuggestions, isLoading } = useSuggestions();
  const [userSuggestions, setUserSuggestions] = useState<Suggestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    const loadUserSuggestions = async () => {
      if (user?.id) {
        const result = await fetchUserSuggestions(user.id);
        if (result) {
          setUserSuggestions(result.suggestions);
        }
      }
    };

    loadUserSuggestions();
  }, [user]);

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
            <p className="text-gray-400">Chargement...</p>
          ) : userSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userSuggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="bg-[#252525] rounded-lg p-4 border border-gray-700"
                >
                  <h3 className="text-white font-medium">{suggestion.title}</h3>
                  <p className="text-gray-300 mt-2">{suggestion.description}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-gray-400">
                      👍 {suggestion.likes_count}
                    </span>
                    <span className="text-gray-400">
                      👎 {suggestion.dislikes_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Nothing here</p>
          )}
        </div>
      </main>

      <SuggestionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}