from pydantic import BaseModel
from typing import List, Optional

class SuggestionBase(BaseModel):
    title: str
    description: str

class SuggestionCreate(SuggestionBase):
    pass

class SuggestionResponse(SuggestionBase):
    id: int
    user_id: int
    likes_count: int
    dislikes_count: int
    user_has_liked: bool
    user_has_disliked: bool
    
    class Config:
        from_attributes = True

class SuggestionList(BaseModel):
    suggestions: List[SuggestionResponse]
    total: int