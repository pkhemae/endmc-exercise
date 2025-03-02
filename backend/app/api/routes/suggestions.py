from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.database import get_db
from app.models.user import User
from app.models.suggestion import Suggestion, suggestion_likes, suggestion_dislikes
from app.schemas.suggestion import SuggestionCreate, SuggestionResponse, SuggestionList
from jose import JWTError, jwt
from typing import List, Optional
from pydantic import BaseModel  # Add this import

router = APIRouter()
# Fix the tokenUrl to match the one in auth.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Add a new function to get token from cookie
async def get_token_from_cookie(request: Request):
    print("Cookies received:", request.cookies)
    # Try different possible cookie names
    token = request.cookies.get("token") or request.cookies.get("access_token")
    print("Token from cookie:", token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return token

# Modify get_current_user to use the cookie token
async def get_current_user(
    token: str = Depends(get_token_from_cookie),
    db: AsyncSession = Depends(get_db)
):
    try:
        print("Attempting to decode token:", token[:10] + "...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print("Extracted username:", username)
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError as e:
        print("JWT Error:", str(e))
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        print("User not found for username:", username)
        raise HTTPException(status_code=404, detail="User not found")
    
    print("Authentication successful for user:", user.username)
    return user

@router.post("/suggestions", response_model=SuggestionResponse, status_code=status.HTTP_201_CREATED)
async def create_suggestion(
    suggestion: SuggestionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_suggestion = Suggestion(
        title=suggestion.title,
        description=suggestion.description,
        user_id=current_user.id
    )
    
    db.add(db_suggestion)
    await db.commit()
    await db.refresh(db_suggestion)
    
    return {
        "id": db_suggestion.id,
        "title": db_suggestion.title,
        "description": db_suggestion.description,
        "user_id": db_suggestion.user_id,
        "user_name": current_user.full_name or current_user.username,  # Add user name
        "likes_count": 0,
        "dislikes_count": 0,
        "user_has_liked": False,
        "user_has_disliked": False
    }
# First, define the get_token_from_cookie_optional function
async def get_token_from_cookie_optional(request: Request) -> Optional[str]:
    return request.cookies.get("token") or request.cookies.get("access_token")

# Then define the get_current_user_optional function that depends on it
async def get_current_user_optional(
    token: Optional[str] = Depends(get_token_from_cookie_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
            
        query = select(User).where(User.username == username)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        return user
    except JWTError:
        return None

# Add this to your response model
class SuggestionResponse(BaseModel):
    id: int
    title: str
    description: str
    user_id: int
    user_name: str  # Add this field
    likes_count: int
    dislikes_count: int
    user_has_liked: bool
    user_has_disliked: bool

@router.get("/suggestions", response_model=SuggestionList)
async def get_suggestions(
    skip: int = 0,
    limit: int = 10,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    # Count total suggestions
    count_query = select(func.count()).select_from(Suggestion)
    total_count = await db.execute(count_query)
    total = total_count.scalar_one()
    
    # Get suggestions with user information
    query = (
        select(Suggestion, User)
        .join(User, Suggestion.user_id == User.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    suggestions_with_users = result.all()
    
    # Format response with like/dislike and user information
    response_suggestions = []
    for suggestion, user in suggestions_with_users:
        # Set default values for unauthenticated users
        user_has_liked = False
        user_has_disliked = False
        
        if current_user:
            # Check if current user has liked or disliked
            has_liked_query = select(suggestion_likes).where(
                suggestion_likes.c.user_id == current_user.id,
                suggestion_likes.c.suggestion_id == suggestion.id
            )
            has_liked_result = await db.execute(has_liked_query)
            user_has_liked = has_liked_result.first() is not None
            
            has_disliked_query = select(suggestion_dislikes).where(
                suggestion_dislikes.c.user_id == current_user.id,
                suggestion_dislikes.c.suggestion_id == suggestion.id
            )
            has_disliked_result = await db.execute(has_disliked_query)
            user_has_disliked = has_disliked_result.first() is not None
        
        # Count likes and dislikes
        likes_count_query = select(func.count()).select_from(suggestion_likes).where(
            suggestion_likes.c.suggestion_id == suggestion.id
        )
        likes_count_result = await db.execute(likes_count_query)
        likes_count = likes_count_result.scalar_one()
        
        dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
            suggestion_dislikes.c.suggestion_id == suggestion.id
        )
        dislikes_count_result = await db.execute(dislikes_count_query)
        dislikes_count = dislikes_count_result.scalar_one()
        
        response_suggestions.append({
            "id": suggestion.id,
            "title": suggestion.title,
            "description": suggestion.description,
            "user_id": suggestion.user_id,
            "user_name": user.full_name or user.username,  # Use full name if available, otherwise username
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
            "user_has_liked": user_has_liked,
            "user_has_disliked": user_has_disliked
        })
    
    return {"suggestions": response_suggestions, "total": total}

# Update the get_suggestion endpoint
# Add this new endpoint for public access to a single suggestion
@router.get("/suggestions/public/{suggestion_id}", response_model=SuggestionResponse)
async def get_public_suggestion(
    suggestion_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Join with User to get user information
    query = select(Suggestion, User).join(User, Suggestion.user_id == User.id).where(Suggestion.id == suggestion_id)
    result = await db.execute(query)
    suggestion_with_user = result.first()
    
    if suggestion_with_user is None:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    suggestion, user = suggestion_with_user
    
    # Count likes and dislikes
    likes_count_query = select(func.count()).select_from(suggestion_likes).where(
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    likes_count_result = await db.execute(likes_count_query)
    likes_count = likes_count_result.scalar_one()
    
    dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    dislikes_count_result = await db.execute(dislikes_count_query)
    dislikes_count = dislikes_count_result.scalar_one()
    
    # For public access, we set user_has_liked and user_has_disliked to False
    return {
        "id": suggestion.id,
        "title": suggestion.title,
        "description": suggestion.description,
        "user_id": suggestion.user_id,
        "user_name": user.full_name or user.username,
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "user_has_liked": False,  # Default for anonymous users
        "user_has_disliked": False  # Default for anonymous users
    }
    
    # Check if current user has liked or disliked
    has_liked_query = select(suggestion_likes).where(
        suggestion_likes.c.user_id == current_user.id,
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    has_liked_result = await db.execute(has_liked_query)
    user_has_liked = has_liked_result.first() is not None
    
    has_disliked_query = select(suggestion_dislikes).where(
        suggestion_dislikes.c.user_id == current_user.id,
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    has_disliked_result = await db.execute(has_disliked_query)
    user_has_disliked = has_disliked_result.first() is not None
    
    # Count likes and dislikes
    likes_count_query = select(func.count()).select_from(suggestion_likes).where(
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    likes_count_result = await db.execute(likes_count_query)
    likes_count = likes_count_result.scalar_one()
    
    dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    dislikes_count_result = await db.execute(dislikes_count_query)
    dislikes_count = dislikes_count_result.scalar_one()
    
    return {
        "id": suggestion.id,
        "title": suggestion.title,
        "description": suggestion.description,
        "user_id": suggestion.user_id,
        "user_name": user.full_name or user.username,  # Add user name
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "user_has_liked": user_has_liked,
        "user_has_disliked": user_has_disliked
    }

@router.post("/suggestions/{suggestion_id}/like", response_model=SuggestionResponse)
async def like_suggestion(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if suggestion exists
    query = select(Suggestion).where(Suggestion.id == suggestion_id)
    result = await db.execute(query)
    suggestion = result.scalar_one_or_none()
    
    if suggestion is None:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check if user already liked this suggestion
    has_liked_query = select(suggestion_likes).where(
        suggestion_likes.c.user_id == current_user.id,
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    has_liked_result = await db.execute(has_liked_query)
    already_liked = has_liked_result.first() is not None
    
    # Check if user already disliked this suggestion
    has_disliked_query = select(suggestion_dislikes).where(
        suggestion_dislikes.c.user_id == current_user.id,
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    has_disliked_result = await db.execute(has_disliked_query)
    already_disliked = has_disliked_result.first() is not None
    
    # If already liked, remove the like (toggle)
    if already_liked:
        await db.execute(
            suggestion_likes.delete().where(
                suggestion_likes.c.user_id == current_user.id,
                suggestion_likes.c.suggestion_id == suggestion.id
            )
        )
        user_has_liked = False
    else:
        # Add like
        await db.execute(
            suggestion_likes.insert().values(
                user_id=current_user.id,
                suggestion_id=suggestion.id
            )
        )
        user_has_liked = True
        
        # If user had disliked, remove the dislike
        if already_disliked:
            await db.execute(
                suggestion_dislikes.delete().where(
                    suggestion_dislikes.c.user_id == current_user.id,
                    suggestion_dislikes.c.suggestion_id == suggestion.id
                )
            )
    
    await db.commit()
    
    # Get user information for the suggestion
    user_query = select(User).where(User.id == suggestion.user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()
    
    # Count likes and dislikes after update
    likes_count_query = select(func.count()).select_from(suggestion_likes).where(
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    likes_count_result = await db.execute(likes_count_query)
    likes_count = likes_count_result.scalar_one()
    
    dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    dislikes_count_result = await db.execute(dislikes_count_query)
    dislikes_count = dislikes_count_result.scalar_one()
    
    return {
        "id": suggestion.id,
        "title": suggestion.title,
        "description": suggestion.description,
        "user_id": suggestion.user_id,
        "user_name": user.full_name or user.username,  # Add user name
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "user_has_liked": user_has_liked,
        "user_has_disliked": not already_disliked if already_disliked else False
    }

@router.post("/suggestions/{suggestion_id}/dislike", response_model=SuggestionResponse)
async def dislike_suggestion(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if suggestion exists
    query = select(Suggestion).where(Suggestion.id == suggestion_id)
    result = await db.execute(query)
    suggestion = result.scalar_one_or_none()
    
    if suggestion is None:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check if user already disliked this suggestion
    has_disliked_query = select(suggestion_dislikes).where(
        suggestion_dislikes.c.user_id == current_user.id,
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    has_disliked_result = await db.execute(has_disliked_query)
    already_disliked = has_disliked_result.first() is not None
    
    # Check if user already liked this suggestion
    has_liked_query = select(suggestion_likes).where(
        suggestion_likes.c.user_id == current_user.id,
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    has_liked_result = await db.execute(has_liked_query)
    already_liked = has_liked_result.first() is not None
    
    # If already disliked, remove the dislike (toggle)
    if already_disliked:
        await db.execute(
            suggestion_dislikes.delete().where(
                suggestion_dislikes.c.user_id == current_user.id,
                suggestion_dislikes.c.suggestion_id == suggestion.id
            )
        )
        user_has_disliked = False
    else:
        # Add dislike
        await db.execute(
            suggestion_dislikes.insert().values(
                user_id=current_user.id,
                suggestion_id=suggestion.id
            )
        )
        user_has_disliked = True
        
        # If user had liked, remove the like
        if already_liked:
            await db.execute(
                suggestion_likes.delete().where(
                    suggestion_likes.c.user_id == current_user.id,
                    suggestion_likes.c.suggestion_id == suggestion.id
                )
            )
    
    await db.commit()
    
    user_query = select(User).where(User.id == suggestion.user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    # Count likes and dislikes after update
    likes_count_query = select(func.count()).select_from(suggestion_likes).where(
        suggestion_likes.c.suggestion_id == suggestion.id
    )
    likes_count_result = await db.execute(likes_count_query)
    likes_count = likes_count_result.scalar_one()
    
    dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
        suggestion_dislikes.c.suggestion_id == suggestion.id
    )
    dislikes_count_result = await db.execute(dislikes_count_query)
    dislikes_count = dislikes_count_result.scalar_one()
    
    return {
        "id": suggestion.id,
        "title": suggestion.title,
        "description": suggestion.description,
        "user_id": suggestion.user_id,
        "user_name": user.full_name or user.username,  # Add user name
        "likes_count": likes_count,
        "dislikes_count": dislikes_count,
        "user_has_liked": not already_liked if already_liked else False,
        "user_has_disliked": user_has_disliked
    }

@router.delete("/suggestions/{suggestion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_suggestion(
    suggestion_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if suggestion exists and belongs to the current user
    query = select(Suggestion).where(
        Suggestion.id == suggestion_id,
        Suggestion.user_id == current_user.id
    )
    result = await db.execute(query)
    suggestion = result.scalar_one_or_none()
    
    if suggestion is None:
        raise HTTPException(
            status_code=404,
            detail="Suggestion not found or you don't have permission to delete it"
        )
    
    # Delete associated likes and dislikes
    await db.execute(
        suggestion_likes.delete().where(
            suggestion_likes.c.suggestion_id == suggestion_id
        )
    )
    await db.execute(
        suggestion_dislikes.delete().where(
            suggestion_dislikes.c.suggestion_id == suggestion_id
        )
    )
    
    # Delete the suggestion
    await db.execute(
        delete(Suggestion).where(Suggestion.id == suggestion_id)
    )
    
    await db.commit()
    return None
@router.get("/suggestions/user/{user_id}", response_model=SuggestionList)
async def get_user_suggestions(
    user_id: int,
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Count total suggestions for the user
    count_query = select(func.count()).select_from(Suggestion).where(Suggestion.user_id == user_id)
    total_count = await db.execute(count_query)
    total = total_count.scalar_one()
    
    # Get user's suggestions with pagination
    query = select(Suggestion, User).join(User, Suggestion.user_id == User.id).where(Suggestion.user_id == user_id).offset(skip).limit(limit)
    result = await db.execute(query)
    suggestions_with_users = result.all()
    
    # Format response with like/dislike information
    response_suggestions = []
    for suggestion, user in suggestions_with_users:
        # Check if current user has liked or disliked
        has_liked_query = select(suggestion_likes).where(
            suggestion_likes.c.user_id == current_user.id,
            suggestion_likes.c.suggestion_id == suggestion.id
        )
        has_liked_result = await db.execute(has_liked_query)
        user_has_liked = has_liked_result.first() is not None
        
        has_disliked_query = select(suggestion_dislikes).where(
            suggestion_dislikes.c.user_id == current_user.id,
            suggestion_dislikes.c.suggestion_id == suggestion.id
        )
        has_disliked_result = await db.execute(has_disliked_query)
        user_has_disliked = has_disliked_result.first() is not None
        
        # Count likes and dislikes
        likes_count_query = select(func.count()).select_from(suggestion_likes).where(
            suggestion_likes.c.suggestion_id == suggestion.id
        )
        likes_count_result = await db.execute(likes_count_query)
        likes_count = likes_count_result.scalar_one()
        
        dislikes_count_query = select(func.count()).select_from(suggestion_dislikes).where(
            suggestion_dislikes.c.suggestion_id == suggestion.id
        )
        dislikes_count_result = await db.execute(dislikes_count_query)
        dislikes_count = dislikes_count_result.scalar_one()
        
        response_suggestions.append({
            "id": suggestion.id,
            "title": suggestion.title,
            "description": suggestion.description,
            "user_id": suggestion.user_id,
            "user_name": user.full_name or user.username,  # Add user name
            "likes_count": likes_count,
            "dislikes_count": dislikes_count,
            "user_has_liked": user_has_liked,
            "user_has_disliked": user_has_disliked
        })
    
    return {"suggestions": response_suggestions, "total": total}