import sqlite3
import datetime

from typing import Optional

from backend.database import DataAccessObject, AuthProvider, SortOrder, Filter, DatabaseError, DataError


SCHEMA = "backend/database/schema.ddl"

class SQLiteDB(DataAccessObject):
    """An SQLite implementation of the data access object."""
    conn: sqlite3.Connection
    
    def __init__(self, filename: str = "backend/database/sqlite.db"):
        """Initialise the database with the given filename."""
        with open(SCHEMA, "r") as file:
            ddl_script = file.read()

        self.conn = sqlite3.connect(filename, check_same_thread=False)
        cur = self.conn.cursor()
        cur.executescript(ddl_script)  # read the schema into the db
        self.conn.commit()

    def user_exists(self, 
        username: Optional[str] = None, 
        email: Optional[str] = None
    ) -> bool:
        try:
            cur = self.conn.cursor()

            if username:
                cur.execute("SELECT * FROM User WHERE username = ?;", 
                            (username,))
            elif email:
                cur.execute("SELECT * FROM User WHERE email = ?;", (email,))
            else:
                raise TypeError("At least one argument "
                                "(username, email) is required.")
            
            return cur.fetchone() is not None
        except sqlite3.DatabaseError:
            raise DatabaseError
        except sqlite3.DataError:
            raise DataError
        
    def add_user(self, 
        username: str, 
        email: str, 
        password: Optional[str],
        auth_provider: AuthProvider, 
        oauth_id: Optional[str] = None
    ) -> int:
        if password is None and auth_provider == 'local':
            raise DataError("A password must be provided "
                            "if auth_provider is 'google'.")

        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO User "
                        "(username, email, password, auth_provider, oauth_id) "
                        "VALUES "
                        "(?, ?, ?, ?, ?);",
                        (username, email, password, auth_provider, oauth_id))
            self.conn.commit()
            return cur.lastrowid
        except sqlite3.DatabaseError:
            self.conn.rollback()
            raise DatabaseError
        except sqlite3.DataError:
            self.conn.rollback()
            raise DataError

    def get_user(self, 
        user_id: Optional[int] = None, 
        username: Optional[str] = None, 
        email: Optional[str] = None
    ) -> Optional[tuple[int, str, str, str, AuthProvider, Optional[str],
                        datetime, datetime, Optional[datetime]]]:
        if user_id is not None:
            query, args = "SELECT * FROM User WHERE id = ?;", (user_id,)
        elif username is not None:
            query, args = "SELECT * FROM User WHERE username = ?;", (username,)
        elif email is not None:
            query, args = "SELECT * FROM User WHERE email = ?;", (email,)
        else:
            raise ValueError("At least one argument "
                             "(user_id, username, or email) is required.")

        try:
            cur = self.conn.cursor()
            cur.execute(query, args)
            return cur.fetchone()
        except sqlite3.DatabaseError:
            raise DatabaseError
        except sqlite3.DataError:
            raise DataError

    def create_refresh_token(self,
        user_id: str,
        token: str,
        expires_at: datetime
    ) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO RefreshToken "
                        "(user, token, expires_at) "
                        "VALUES (?, ?, ?);", (user_id, token, expires_at))
            self.conn.commit()
            return None
        except sqlite3.DatabaseError:
            self.conn.rollback()
            raise DatabaseError
        except sqlite3.DataError:
            self.conn.rollback()
            raise DataError

    def get_refresh_token(self, 
        token: str, 
        revoked: Optional[bool]
    ) -> Optional[tuple[int, datetime, datetime]]:
        cur = self.conn.cursor()

        if revoked is not None:
            query = ("SELECT user, expires_at, created_at FROM RefreshToken "
                     "WHERE token = ? AND revoked = ? "
                     "ORDER BY created_at DESC;")
            args = (token, revoked)
        else:
            query = ("SELECT user, expires_at, created_at FROM RefreshToken "
                     "WHERE token = ? "
                     "ORDER BY created_at DESC;")
            args = (token,)
        
        try:
            cur.execute(query, args)
            return cur.fetchone()
        except sqlite3.DatabaseError:
            raise DatabaseError
        except sqlite3.DataError:
            raise DataError
        
    
    def set_revoked_status(self, token: str, revoked: bool) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE RefreshToken "
                        "SET revoked = ? "
                        "WHERE token = ?;", (revoked, token))
            self.conn.commit()
        except sqlite3.DatabaseError:
            self.conn.rollback()
            raise DatabaseError
        except sqlite3.DataError:
            self.conn.rollback()
            raise DataError

    def set_oauth_id(user_id: str, oauth_id: str) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE User "
                        "SET oauth_id = ? "
                        "WHERE id = ?;", (oauth_id, user_id))
            self.conn.commit()
        except sqlite3.DatabaseError:
            self.conn.rollback()
            raise DatabaseError
        except sqlite3.DataError:
            self.conn.rollback()
            raise DataError

    def set_last_login(self, username: str, time: datetime) -> bool:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE User "
                        "SET last_login = ?"
                        "WHERE username = ?", (time, username))
            self.conn.commit()
        except sqlite3.DatabaseError:
            self.conn.rollback()
            raise DatabaseError
        except sqlite3.DataError:
            self.conn.rollback()
            raise DataError

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