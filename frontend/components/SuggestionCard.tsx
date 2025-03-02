import { useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Trash2, MoreVertical } from 'lucide-react';
import { Suggestion } from '@/types/suggestion';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClick?: (id: number) => void;
}

export default function SuggestionCard({
  suggestion,
  onLike,
  onDislike,
  onDelete,
  onClick
}: SuggestionCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    if (onClick) onClick(suggestion.id);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this suggestion?')) {
      onDelete(suggestion.id);
    }
    setIsDropdownOpen(false);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(suggestion.id);
  };

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDislike(suggestion.id);
  };

  return (
    <div 
      className="bg-[#252525] rounded-xl overflow-hidden shadow-xl hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={handleCardClick}
      role="article"
      aria-labelledby={`suggestion-title-${suggestion.id}`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 
            id={`suggestion-title-${suggestion.id}`}
            className="text-xl font-semibold text-white/90 line-clamp-2 flex-1"
          >
            {suggestion.title}
          </h3>
          
          <div 
            className="relative ml-2"
            ref={dropdownRef}
          >
            <button
              onClick={handleDropdownToggle}
              className="p-1.5 rounded-full text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-colors"
              aria-label="Suggestion options"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-[#252525] rounded-lg shadow-lg border border-gray-700 overflow-hidden z-20"
                role="menu"
              >
                <button 
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                  role="menuitem"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      
        {/* Description */}
        <p className="mt-3 text-gray-300 text-sm line-clamp-3">
          {suggestion.description}
        </p>
        
        {/* Stats and Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">{suggestion.likes_count}</span>
              <span className="text-gray-500">likes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">{suggestion.dislikes_count}</span>
              <span className="text-gray-500">dislikes</span>
            </div>
          </div>
        
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeClick}
              className={`p-2 rounded-lg transition-all duration-200 ${
                suggestion.user_has_liked
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Like suggestion"
              aria-pressed={suggestion.user_has_liked}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={handleDislikeClick}
              className={`p-2 rounded-lg transition-all duration-200 ${
                suggestion.user_has_disliked
                  ? 'bg-red-500/20 text-red-400'
                  : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
              }`}
              aria-label="Dislike suggestion"
              aria-pressed={suggestion.user_has_disliked}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}