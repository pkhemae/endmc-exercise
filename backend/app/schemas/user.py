from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str