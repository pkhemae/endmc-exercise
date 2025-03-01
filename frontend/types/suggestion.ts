export interface Suggestion {
  id: number;
  title: string;
  description: string;
  user_id: number;
  likes_count: number;
  dislikes_count: number;
  user_has_liked: boolean;
  user_has_disliked: boolean;
}

export interface SuggestionList {
  suggestions: Suggestion[];
  total: number;
}

export interface CreateSuggestionData {
  title: string;
  description: string;
}