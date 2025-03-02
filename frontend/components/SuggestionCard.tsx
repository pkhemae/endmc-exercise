import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { Suggestion } from '@/types/suggestion';
import { API_URL } from '@/config';
import { useRouter } from 'next/navigation';

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
  
  useEffect(() => {
    if (!suggestion.user_name && suggestion.user_id) {
      fetchUserName(suggestion.user_id);
    }
  }, [suggestion.user_id, suggestion.user_name]);
  
  const fetchUserName = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/users/public/${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserName(userData.full_name || userData.username);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const handleCardClick = () => {
    router.push(`/suggestions/${suggestion.id}`);
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(suggestion.id);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDislike(suggestion.id);
  };

  const displayName = suggestion.user_name || userName || (suggestion.user_id ? `User #${suggestion.user_id}` : 'Unknown User');

  return (
    <div 
      className="bg-[#252525] rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] hover:rotate-1 cursor-pointer h-full flex flex-col"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`suggestion-title-${suggestion.id}`}
    >
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
          <h3 
            id={`suggestion-title-${suggestion.id}`}
            className="text-lg sm:text-xl font-semibold text-white/90 line-clamp-1"
          >
            {suggestion.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm whitespace-nowrap">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{displayName}</span>
          </div>
        </div>
        
        <p className="mt-1 text-gray-300 text-xs sm:text-sm line-clamp-3 flex-grow">
          {suggestion.description}
        </p>
        
        <div className="mt-4 sm:mt-6 flex items-center justify-end">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                suggestion.user_has_liked
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Like suggestion"
              aria-pressed={suggestion.user_has_liked}
            >
              <span className="text-xs sm:text-sm">{suggestion.likes_count}</span>
              <ThumbsUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={handleDislikeClick}
              className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                suggestion.user_has_disliked
                  ? 'bg-red-500/20 text-red-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Dislike suggestion"
              aria-pressed={suggestion.user_has_disliked}
            >
              <span className="text-xs sm:text-sm">{suggestion.dislikes_count}</span>
              <ThumbsDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}