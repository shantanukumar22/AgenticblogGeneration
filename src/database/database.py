from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# NeonDB specific configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # NeonDB works better with NullPool for serverless
    connect_args={
        "sslmode": "require",  # Required for NeonDB
        "connect_timeout": 10,
    },
    pool_pre_ping=True,  # Verify connections before using
    echo=False  # Set to True for SQL query logging during development
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Function to initialize database tables
def init_db():
    from src.database.models import Base
    Base.metadata.create_all(bind=engine)