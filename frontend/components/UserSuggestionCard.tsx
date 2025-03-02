import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Trash2, ChevronDown } from 'lucide-react';
import { Suggestion } from '@/types/suggestion';
import DeleteSuggestionModal from './DeleteSuggestionModal';
import { useRouter } from 'next/navigation';

interface UserSuggestionCardProps {
  suggestion: Suggestion;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function UserSuggestionCard({
  suggestion,
  onLike,
  onDislike,
  onDelete,
}: UserSuggestionCardProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (isDropdownOpen && event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isDropdownOpen]);

  const handleCardClick = () => {
    router.push(`/suggestions/${suggestion.id}`);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(suggestion.id);
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
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
    <>
      <div 
        className="bg-[#252525] rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] hover:rotate-1 cursor-pointer"
        onClick={handleCardClick}
        role="article"
        aria-labelledby={`suggestion-title-${suggestion.id}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div 
              className="flex items-center gap-2 relative"
            >
              <button
                ref={buttonRef}
                onClick={handleDropdownToggle}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg active:scale-75 transform transition-transform duration-300"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title={suggestion.title}
              >
                <h3 
                  id={`suggestion-title-${suggestion.id}`}
                  className="text-xl font-semibold text-white/90 line-clamp-1 max-w-[300px]"
                >
                  {suggestion.title}
                </h3>
                <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute left-0 top-full mt-1 w-48 bg-[#252525] rounded-lg shadow-lg border border-gray-700 overflow-hidden z-20"
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
        
          <p className="mt-1 text-gray-300 text-sm line-clamp-3 px-3">
            {suggestion.description}
          </p>
          
          <div className="mt-6 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLikeClick}
                className={`flex items-center gap-1.5 p-2 rounded-lg transition-all duration-200 ${
                  suggestion.user_has_liked
                    ? 'bg-green-500/20 text-green-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                aria-label="Like suggestion"
                aria-pressed={suggestion.user_has_liked}
              >
                <span className="text-sm">{suggestion.likes_count}</span>
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={handleDislikeClick}
                className={`flex items-center gap-1.5 p-2 rounded-lg transition-all duration-200 ${
                  suggestion.user_has_disliked
                    ? 'bg-red-500/20 text-red-400'
                    : 'hover:bg-gray-700/50 text-gray-400 hover:text-gray-300'
                }`}
                aria-label="Dislike suggestion"
                aria-pressed={suggestion.user_has_disliked}
              >
                <span className="text-sm">{suggestion.dislikes_count}</span>
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteSuggestionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        suggestionTitle={suggestion.title}
      />
    </>
  );
}