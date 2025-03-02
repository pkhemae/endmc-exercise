'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/config';
import { Suggestion } from '@/types/suggestion';
import { ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useSuggestions } from '@/hooks/useSuggestions';

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
        // Use a public endpoint that doesn't require authentication
        const response = await fetch(`${API_URL}/api/suggestions/public/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestion');
        }

        const data = await response.json();
        setSuggestion(data);
      } catch (err) {
        setError('Failed to load suggestion');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [id]);

  // Remove unused handleAuthRequired function

  const handleLike = async () => {
    if (!suggestion || isActionLoading) return;
    
    setIsActionLoading(true);
    try {
      const updatedSuggestion = await likeSuggestion(suggestion.id);
      if (updatedSuggestion) {
        setSuggestion(updatedSuggestion);
      }
    } catch (err) {
      console.error('Error liking suggestion:', err);
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
      console.error('Error disliking suggestion:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !suggestion) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex items-center justify-center">
        <div className="text-red-400">{error || 'Suggestion not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          ← Back
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
              aria-label="Like suggestion"
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
              aria-label="Dislike suggestion"
              aria-pressed={suggestion.user_has_disliked}
            >
              <span className="text-sm">{suggestion.dislikes_count}</span>
              <ThumbsDown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}