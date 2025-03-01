from fastapi import Depends, HTTPException, status, Request, Cookie
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

SECRET_KEY = "33d159b62cd206f91c8d57ec04641daaae39f311b2442c765dbf1817e6f9f6db2a2dc453375bbc839533a5ca05008dfd8a8e019a1d6807f2820119bf6206d4f7250c8f868c3a351167df94308544961f0f446ae4b20b46c0351d28b3c0eb21a08ccb9731fae90f94f5e5087244172de7f56e373c9cc3cd8741d65aeaf9f1435c2f4e5f4cd88e45c4b765aa0b31e7e78d214d40022734b84e4ca5d44f93410800405f2127727000f936e1a0d4e1002caa0df6a36a740e846497771e4ccbe95506bf4d41328034b9182f5d67be67328281fbb59cdd2bc48b46b63610118863702ac5fb83a0df7f112d1346c4e55ed4c04f8e5cb78f79653d5bd3417c34f87a6021"  # In production, use a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    jwt_token = token
    
    if not jwt_token:
        jwt_token = request.cookies.get("token")
        print(f"Token from cookie: {jwt_token is not None}")
    
    if not jwt_token:
        print("No token found in header or cookies")
        raise credentials_exception
    
    try:
        print(f"Decoding token: {jwt_token[:20]}...")
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("No username in token payload")
            raise credentials_exception
        print(f"Username from token: {username}")
    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception
        
    query = select(User).where(User.username == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        print(f"No user found with username: {username}")
        raise credentials_exception
    
    print(f"User authenticated: {user.username}")
    return user