import { useState } from 'react';
import { API_URL } from '@/config';
import { Suggestion, SuggestionList, CreateSuggestionData } from '@/types/suggestion';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalSuggestions, setTotalSuggestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async (skip = 0, limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/api/suggestions?skip=${skip}&limit=${limit}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch suggestions');
      }

      const data: SuggestionList = await response.json();
      setSuggestions(data.suggestions);
      setTotalSuggestions(data.total);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createSuggestion = async (suggestionData: CreateSuggestionData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(suggestionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create suggestion');
      }

      const newSuggestion: Suggestion = await response.json();
      setSuggestions(prev => [newSuggestion, ...prev]);
      setTotalSuggestions(prev => prev + 1);
      return newSuggestion;
    } catch (err: any) {
      setError(err.message || 'Failed to create suggestion');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const likeSuggestion = async (suggestionId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/suggestions/${suggestionId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to like suggestion');
      }

      const updatedSuggestion: Suggestion = await response.json();
      
      // Update the suggestion in the state
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === suggestionId ? updatedSuggestion : suggestion
        )
      );
      
      return updatedSuggestion;
    } catch (err: any) {
      setError(err.message || 'Failed to like suggestion');
      return null;
    }
  };

  const dislikeSuggestion = async (suggestionId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/suggestions/${suggestionId}/dislike`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to dislike suggestion');
      }

      const updatedSuggestion: Suggestion = await response.json();
      
      // Update the suggestion in the state
      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === suggestionId ? updatedSuggestion : suggestion
        )
      );
      
      return updatedSuggestion;
    } catch (err: any) {
      setError(err.message || 'Failed to dislike suggestion');
      return null;
    }
  };

  return {
    suggestions,
    totalSuggestions,
    isLoading,
    error,
    fetchSuggestions,
    createSuggestion,
    likeSuggestion,
    dislikeSuggestion
  };
}