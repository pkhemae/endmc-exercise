from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .suggestions import router as suggestions_router  # Add this import

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(suggestions_router, tags=["suggestions"])  # Add this line