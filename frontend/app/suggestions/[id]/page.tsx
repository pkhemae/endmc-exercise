'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import { Suggestion } from '@/types/suggestion';
import { ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSuggestions } from '@/hooks/useSuggestions';
import Navbar from '@/components/Navbar';
import { ArrowLeft, X } from 'lucide-react';

export default function SuggestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { likeSuggestion, dislikeSuggestion } = useSuggestions();
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestion = async () => {
      try {
        setIsLoading(true);
        
        try {
          const authResponse = await fetch(`${API_URL}/api/suggestions/${id}`, {
            credentials: 'include',
          });
          
          if (authResponse.ok) {
            const authData = await authResponse.json();
            setSuggestion(authData);
            setIsLoading(false);
            return;
          }

          if (authResponse.status === 404) {
            setError('Suggestion non trouvée');
            setIsLoading(false);
            return;
          }
        } catch (authErr) {
          console.log('going on public endpoint');
        }
        
        const publicResponse = await fetch(`${API_URL}/api/suggestions/public/${id}`, {
          credentials: 'include',
        });
        
        if (!publicResponse.ok) {
          if (publicResponse.status === 404) {
            setError('Suggestion non trouvée');
          } else {
            throw new Error('Impossible de récupérer la suggestion');
          }
        } else {
          const publicData = await publicResponse.json();
          setSuggestion(publicData);
        }
      } catch (err) {
        setError('Impossible de charger la suggestion');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [id]);

  const handleLike = async () => {
    if (!suggestion || isActionLoading) return;
    
    setIsActionLoading(true);
    try {
      const updatedSuggestion = await likeSuggestion(suggestion.id);
      if (updatedSuggestion) {
        setSuggestion(updatedSuggestion);
      }
    } catch (err) {
      console.error('Erreur lors du like de la suggestion :', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!suggestion || isActionLoading) return;
    
    setIsActionLoading(true);
    try {
      const updatedSuggestion = await dislikeSuggestion(suggestion.id);
      if (updatedSuggestion) {
        setSuggestion(updatedSuggestion);
      }
    } catch (err) {
      console.error('Erreur lors du dislike de la suggestion :', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="min-h-screen bg-[#1e1e1e]">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </button>
          
          <div className="rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <X className="h-24 w-24 text-red-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              {error === 'Suggestion non trouvée' ? 'Suggestion non trouvée' : 'Erreur'}
            </h1>
            <p className="text-gray-300 mb-6">
              {error === 'Suggestion non trouvée' 
                ? "La suggestion que vous recherchez n'existe pas ou a été supprimée."
                : "Nous n'avons pas pu charger cette suggestion. Veuillez réessayer plus tard."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <Navbar />
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-6"
          >
            ← Retour
          </button>
          
          <div className="bg-[#252525] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">
                {suggestion.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-400">
                <User className="h-4 w-4" />
                <span>{suggestion.user_name}</span>
              </div>
            </div>
            
            <p className="text-gray-300 mt-4 whitespace-pre-wrap">
              {suggestion.description}
            </p>
            
            <div className="mt-8 flex items-center justify-end gap-4">
              <button
                onClick={handleLike}
                disabled={isActionLoading}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                  suggestion.user_has_liked
                    ? 'bg-green-500/20 text-green-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                aria-label="J'aime cette suggestion"
                aria-pressed={suggestion.user_has_liked}
              >
                <span className="text-sm">{suggestion.likes_count}</span>
                <ThumbsUp className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleDislike}
                disabled={isActionLoading}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ${
                  suggestion.user_has_disliked
                    ? 'bg-red-500/20 text-red-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                aria-label="Je n'aime pas cette suggestion"
                aria-pressed={suggestion.user_has_disliked}
              >
                <span className="text-sm">{suggestion.dislikes_count}</span>
                <ThumbsDown className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}