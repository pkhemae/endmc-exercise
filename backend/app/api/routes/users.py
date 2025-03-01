from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

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