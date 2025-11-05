

import uvicorn
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from src.graphs.graph_builder import GraphBuilder
from src.llms.groqllm import GroqLLM
from src.database.database import get_db, init_db
from src.database.models import Base, User, Blog
from src.auth.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_user
)
from src.schemas.schemas import (
    UserCreate, 
    UserLogin, 
    Token, 
    UserResponse,
    BlogCreate,
    BlogResponse
)
import os
from dotenv import load_dotenv
from typing import List
import json
from datetime import datetime, timedelta

load_dotenv()

app = FastAPI(
    title="AI'm writing",
    description="API for generating and managing AI-powered blog posts",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Maximum tokens per day per user
MAX_TOKENS_PER_DAY = 10

# --- Global HTTPException handler to ensure CORS headers ---
from fastapi.responses import JSONResponse
from fastapi.requests import Request

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    return response


# Helper function to reset daily token usage
def reset_daily_token_usage(user):
    if (datetime.utcnow() - user.last_token_reset) > timedelta(days=1):
        user.tokens_used_today = 0
        user.last_token_reset = datetime.utcnow()

os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGCHAIN_API_KEY")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # Check if user exists
        db_user = db.query(User).filter(
            (User.email == user.email) | (User.username == user.username)
        ).first()
        
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user.password)
        new_user = User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create access token
        access_token = create_access_token(data={"user_id": new_user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": new_user
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"user_id": db_user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": db_user
        }
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# Endpoint to get token usage status
@app.get("/api/tokens")
async def get_token_status(current_user: User = Depends(get_current_user)):
    reset_daily_token_usage(current_user)
    remaining = MAX_TOKENS_PER_DAY - current_user.tokens_used_today
    return {
        "tokens_used": current_user.tokens_used_today,
        "remaining": max(0, remaining),
        "reset_at": current_user.last_token_reset,
    }


@app.post("/api/blogs", response_model=BlogResponse)
async def create_blog(
    blog_data: BlogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Reset daily token usage if a new day
        reset_daily_token_usage(current_user)

        # Check if user has exceeded daily token limit
        if current_user.tokens_used_today >= MAX_TOKENS_PER_DAY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Daily token limit reached. Try again tomorrow."
            )

        topic = blog_data.topic
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Topic is required"
            )
        # Generate blog using your existing logic
        Groqllm = GroqLLM()
        llm = Groqllm.get_llm()
        graph_builder = GraphBuilder(llm)
        graph = graph_builder.setup_graph(usecase="topic")
        state = graph.invoke({"topic": topic})
        # Extract content from state (adjust based on your actual state structure)
        blog_content = json.dumps(state) if isinstance(state, dict) else str(state)
        blog_title = state.get("title", topic) if isinstance(state, dict) else topic
        # Save to database
        new_blog = Blog(
            user_id=current_user.id,
            topic=topic,
            title=blog_title,
            content=blog_content
        )
        db.add(new_blog)
        # After successful creation, increment token count and commit user changes
        current_user.tokens_used_today += 1
        db.commit()
        db.refresh(new_blog)
        db.refresh(current_user)
        return new_blog
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating blog: {str(e)}"
        )

@app.get("/api/blogs", response_model=List[BlogResponse])
async def get_user_blogs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        blogs = db.query(Blog).filter(
            Blog.user_id == current_user.id
        ).order_by(
            Blog.created_at.desc()
        ).offset(skip).limit(limit).all()
        return blogs
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.get("/api/blogs/{blog_id}", response_model=BlogResponse)
async def get_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        blog = db.query(Blog).filter(
            Blog.id == blog_id,
            Blog.user_id == current_user.id
        ).first()
        
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        
        return blog
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

@app.delete("/api/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        blog = db.query(Blog).filter(
            Blog.id == blog_id,
            Blog.user_id == current_user.id
        ).first()
        
        if not blog:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blog not found"
            )
        
        db.delete(blog)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# ==================== LEGACY ENDPOINT ====================

@app.post("/blogs")
async def create_blogs_legacy(request: Request):
    """Legacy endpoint - kept for backward compatibility"""
    data = await request.json()
    topic = data.get("topic", "")
    Groqllm = GroqLLM()
    llm = Groqllm.get_llm()
    graph_builder = GraphBuilder(llm)
    
    if topic:
        graph = graph_builder.setup_graph(usecase="topic")
        state = graph.invoke({"topic": topic})
    
    return {"data": state}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
