import { Suggestion } from '@/types/suggestion';
import SuggestionCard from './SuggestionCard';

interface SuggestionsListProps {
  suggestions: Suggestion[];
  totalCount: number;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
}

export default function SuggestionsList({ 
  suggestions, 
  totalCount, 
  onLike, 
  onDislike 
}: SuggestionsListProps) {
  return (
    <>
      <p className="text-gray-400 mb-6">
        Showing {suggestions.length} of {totalCount} suggestions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onLike={onLike}
            onDislike={onDislike}
          />
        ))}
      </div>
    </>
  );
}