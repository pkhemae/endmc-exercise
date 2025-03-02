import { Suggestion } from './suggestion';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export interface SuggestionCardProps {
  suggestion: Suggestion;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
}

export interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (success: boolean) => void;
}

export interface SuggestionsListProps {
  suggestions: Suggestion[];
  totalCount: number;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
}

export interface UserSuggestionCardProps {
  suggestion: Suggestion;
  onLike: (id: number) => Promise<void>;
  onDislike: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export interface DeleteSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  suggestionTitle: string;
}