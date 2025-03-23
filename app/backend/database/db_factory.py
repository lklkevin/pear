import os
from dotenv import load_dotenv
from backend.database import DataAccessObject
from backend.database.sqlitedb import SQLiteDB
from backend.database.postgresdb import PostgresDB

# Load environment variables
load_dotenv()

def get_db_instance() -> DataAccessObject:
    """
    Factory function to get the appropriate database instance based on configuration.
    
    Returns:
        DataAccessObject: An instance of the configured database implementation.
    """
    db_mode = os.environ.get("DB_MODE", "sqlite").lower()
    
    if db_mode == "postgres":
        # Get the DATABASE_URL and pass it directly to PostgresDB
        database_url = os.environ.get("DATABASE_URL")
        return PostgresDB(connection_string=database_url)
    else:
        # Default to SQLite
        return SQLiteDB()
