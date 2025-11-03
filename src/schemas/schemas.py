from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Blog Schemas
class BlogCreate(BaseModel):
    topic: str

class BlogResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    title: Optional[str]
    content: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True