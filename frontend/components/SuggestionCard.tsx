import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ThumbsUp, ThumbsDown, User, Loader2, ArrowUpRight } from 'lucide-react';
import { Suggestion } from '@/types/suggestion';
import { API_URL } from '@/config';
import { motion } from 'framer-motion';

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
    <motion.div 
      className="bg-[#252525] rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:bg-[#2a2a2a] cursor-pointer w-full border border-gray-800/50 relative"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`suggestion-title-${suggestion.id}`}
      whileHover={{ 
        scale: 1.02,
        borderColor: 'rgba(75, 85, 99, 0.5)',
        transition: { 
          duration: 0.1,
          ease: "easeOut"
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.1,
        ease: "easeInOut"
      }}
    >
      <div className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 transition-colors">
        <ArrowUpRight className="h-5 w-5" />
      </div>
      
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start pr-6 mb-3">
          <div className="flex-1">
            <h3 
              id={`suggestion-title-${suggestion.id}`}
              className="text-lg font-semibold text-white/90 mb-2 line-clamp-1"
            >
              {suggestion.title}
            </h3>
          </div>
        </div>
        
        <div className="flex-grow">
          <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
            {suggestion.description}
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  suggestion.user_has_liked
                    ? 'bg-green-500/20 text-green-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
                aria-label="Like suggestion"
                aria-pressed={suggestion.user_has_liked}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">{suggestion.likes_count}</span>
              </motion.button>
              
              <motion.button
                onClick={handleDislikeClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  suggestion.user_has_disliked
                    ? 'bg-red-500/20 text-red-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
                aria-label="Dislike suggestion"
                aria-pressed={suggestion.user_has_disliked}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-sm font-medium">{suggestion.dislikes_count}</span>
              </motion.button>
            </div>
            
            {/* Author moved to bottom right */}
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <User className="h-3.5 w-3.5 flex-shrink-0" />
              {isLoadingUser ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <span className="text-gray-500">Loading...</span>
                </span>
              ) : (
                <span className="truncate max-w-[120px]">{displayName}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}