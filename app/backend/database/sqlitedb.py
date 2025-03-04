import sqlite3
import datetime

from typing import Optional

from backend.database import DataAccessObject, AuthProvider, SortOrder, Filter


SCHEMA = "backend/database/schema.ddl"

class SQLiteDB(DataAccessObject):
    """An SQLite implementation of the data access object."""
    conn: sqlite3.Connection
    
    def __init__(self, filename: str = "backend/database/sqlite.db"):
        """Initialise the database with the given filename."""
        with open(SCHEMA, "r") as file:
            ddl_script = file.read()

        self.conn = sqlite3.connect(filename)
        cur = self.conn.cursor()
        cur.executescript(ddl_script)  # read the schema into the db
        self.conn.commit()

    def user_exists(self, 
        username: Optional[str], 
        email: Optional[str]
    ) -> bool:
        cur = self.conn.cursor()

        if username:
            cur.execute("SELECT * FROM User WHERE username = ?;", (username,))
        elif email:
            cur.execute("SELECT * FROM User WHERE email = ?;", (email,))
        else:
            return None
        
        return cur.fetchone is not None
            
    def add_user(self, 
        username: str, 
        email: str, 
        password: str,
        auth_provider: AuthProvider, 
        oauth_id: Optional[str] = None
    ) -> None:
        cur = self.conn.cursor()
        time = datetime.now()
        
        cur.execute("INSERT INTO User "
                    "(username, email, password, auth_provider, oauth_id) "
                    "VALUES "
                    "(?, ?, ?, ?, ?);",
                    (username, email, password, auth_provider, oauth_id))
        self.conn.commit()

    def get_user_by_id(self, 
        id: int
    ) -> Optional[tuple[str, str, str, AuthProvider, 
                        datetime, datetime, Optional[datetime]]]:
        cur = self.conn.cursor()

        cur.execute("SELECT * FROM User "
                    "WHERE id = ?;",
                    (id,))

        return cur.fetchone()
            
    def get_user_by_email(self, 
        email: str
    ) -> Optional[tuple[str, str, str, AuthProvider, 
                        datetime, datetime, Optional[datetime]]]:
        cur = self.conn.cursor()

        cur.execute("SELECT * FROM User "
                    "WHERE email = ?;",
                    (email,))

        return cur.fetchone()

    def get_user_by_username(self, 
        username: str
    ) -> Optional[tuple[str, str, str, AuthProvider, 
                        datetime, datetime, Optional[datetime]]]:
        cur = self.conn.cursor()

        cur.execute("SELECT * FROM User "
                    "WHERE username = ?;",
                    (username,))

        return cur.fetchone()

    def get_refresh_token(self, 
        token: str, 
        revoked: bool
    ) -> Optional[tuple[int, datetime, datetime]]:
        cur = self.conn.cursor()

        cur.execute("SELECT user, expires_at, created_at FROM RefreshToken "
                    "WHERE token = ? AND revoked = ?;",
                    (token, revoked))

        return cur.fetchone()
    
    def set_token_revoked(self, token: str, revoked: bool) -> None:
        cur = self.conn.cursor()

        cur.execute("UPDATE RefreshToken "
                    "SET revoked = ? "
                    "WHERE token = ?;")

    def update_last_login(self, username: str, time: datetime) -> bool:
        cur = self.conn.cursor()

        cur.execute("UPDATE User"
                    "SET last_login = ?"
                    "WHERE username = ?")

    def get_exams(self, 
        user_id: str,
        sorting: SortOrder,
        filter: Filter,
        title: Optional[str]
    ) -> list[tuple[int, str, str, str, str]]:
        raise NotImplementedError

    def create_exam(self,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> None:
        raise NotImplementedError

    def insert_question(self,
        username: str,
        exam: str,
        question: str,
        answers: set[tuple[str, float]]
    ) -> None:
        raise NotImplementedError
    

if __name__ == "__main__":
    db = SQLiteDB()