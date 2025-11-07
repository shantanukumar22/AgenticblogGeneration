from src.database.database import init_db, engine
from src.database.models import Base
from sqlalchemy import inspect

def check_tables_exist():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Existing tables: {tables}")
    return tables

def initialize_database():
    print("Initializing database...")
    try:
        # Check existing tables
        existing_tables = check_tables_exist()
        
        if not existing_tables:
            print("No tables found. Creating tables...")
            init_db()
            print("✅ Database tables created successfully!")
        else:
            print("✅ Database tables already exist.")
            
        # Verify tables were created
        tables = check_tables_exist()
        print(f"✅ Total tables: {len(tables)}")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        raise

if __name__ == "__main__":
    initialize_database()