import { useState, useCallback } from 'react';
import { API_URL } from '@/config';
import { Suggestion, SuggestionList, CreateSuggestionData } from '@/types/suggestion';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [totalSuggestions, setTotalSuggestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/suggestions`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserSuggestions = async (userId: number, skip = 0, limit = 10) => {
    setIsLoading(true);
    setError(null);
  
    try {
      console.log(`Making request to: ${API_URL}/api/suggestions/user/${userId}?skip=${skip}&limit=${limit}`);
      
      const response = await fetch(
        `${API_URL}/api/suggestions/user/${userId}?skip=${skip}&limit=${limit}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to fetch user suggestions');
        } catch (e) {
          throw new Error(`Failed to fetch user suggestions: ${errorText}`);
        }
      }
  
      const data = await response.json();
      console.log('Received user suggestions data:', data);
      
      // Update the local state with the user's suggestions
      setSuggestions(data.suggestions || []);
      setTotalSuggestions(data.total || 0);
      
      return data;
    } catch (err) {
      console.error('Error in fetchUserSuggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user suggestions');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createSuggestion = async (suggestionData: CreateSuggestionData) => {
    setIsLoading(true);
    setError(null);
  
    try {
      console.log('Creating suggestion with data:', suggestionData);
      
      const response = await fetch(`${API_URL}/api/suggestions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(suggestionData)
      });
  
      console.log('Create suggestion response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.detail || 'Failed to create suggestion');
        } catch (e) {
          throw new Error(`Failed to create suggestion: ${errorText}`);
        }
      }
  
      const newSuggestion = await response.json();
      console.log('New suggestion created:', newSuggestion);
      
      // Update the global suggestions state
      setSuggestions(prev => [newSuggestion, ...prev]);
      setTotalSuggestions(prev => prev + 1);
      
      return newSuggestion;
    } catch (err) {
      console.error('Error in createSuggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to create suggestion');
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

  const deleteSuggestion = async (suggestionId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/suggestions/${suggestionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete suggestion');
      }
  
      // Remove the suggestion from the local state
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== suggestionId));
      setTotalSuggestions(prev => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete suggestion');
      return false;
    }
  };
  
  // Update the return statement to include deleteSuggestion
  return {
    suggestions,
    totalSuggestions,
    isLoading,
    error,
    fetchSuggestions,
    fetchUserSuggestions, // Add this line
    createSuggestion,
    likeSuggestion,
    dislikeSuggestion,
    deleteSuggestion
  };
}