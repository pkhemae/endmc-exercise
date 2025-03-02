import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, User, Loader2 } from 'lucide-react';
import { Suggestion } from '@/types/suggestion';
import { API_URL } from '@/config';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
}

export default function SuggestionCard({
  suggestion,
  onLike,
  onDislike
}: SuggestionCardProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  useEffect(() => {
    if (!suggestion.user_name && suggestion.user_id) {
      fetchUserName(suggestion.user_id);
    }
  }, [suggestion.user_id, suggestion.user_name]);
  
  const fetchUserName = async (userId: number) => {
    try {
      setIsLoadingUser(true);
      const response = await fetch(`${API_URL}/api/users/public/${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserName(userData.full_name || userData.username);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };
  
  const handleCardClick = useCallback(() => {
    router.push(`/suggestions/${suggestion.id}`);
  }, [router, suggestion.id]);
  
  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(suggestion.id);
  }, [onLike, suggestion.id]);

  const handleDislikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDislike(suggestion.id);
  }, [onDislike, suggestion.id]);

  const displayName = suggestion.user_name || userName || (suggestion.user_id ? `User #${suggestion.user_id}` : 'Unknown User');

  return (
    <div 
      className="bg-[#252525] rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:bg-[#2a2a2a] cursor-pointer w-full"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`suggestion-title-${suggestion.id}`}
    >
      <div className="p-4 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 
            id={`suggestion-title-${suggestion.id}`}
            className="text-lg font-semibold text-white/90"
          >
            {suggestion.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs ml-4">
            <User className="h-3 w-3 flex-shrink-0" />
            {isLoadingUser ? (
              <span className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Loading...
              </span>
            ) : (
              <span className="truncate max-w-[120px]">{displayName}</span>
            )}
          </div>
        </div>
        
        <div className="flex-grow">
          <p className="text-gray-300 text-sm line-clamp-2">
            {suggestion.description}
          </p>
        </div>
        
        <div className="mt-2 flex justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 p-1.5 rounded-lg transition-all duration-200 ${
                suggestion.user_has_liked
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Like suggestion"
              aria-pressed={suggestion.user_has_liked}
            >
              <span className="text-xs">{suggestion.likes_count}</span>
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDislikeClick}
              className={`flex items-center gap-1 p-1.5 rounded-lg transition-all duration-200 ${
                suggestion.user_has_disliked
                  ? 'bg-red-500/20 text-red-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Dislike suggestion"
              aria-pressed={suggestion.user_has_disliked}
            >
              <span className="text-xs">{suggestion.dislikes_count}</span>
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}