from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import get_current_user
from app.models.user import User
from app.core.database import get_db

router = APIRouter()

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    print("=== /me endpoint accessed ===")
    print(f"Current user: {current_user.username}")
    print(f"Token present: True")
    return {
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name
    }

# Fix the public endpoint route path
@router.get("/public/{user_id}")  # Remove "users" from the path since we're already in the users router
async def get_public_user_info(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return only public information
    return {
        "username": user.username,
        "full_name": user.full_name
    }

@router.get("/{user_id}")
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Query the user
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # If user not found, raise 404
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return user data
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name
    }