import pytest

import backend.database.sqlitedb as sqlitedb
from backend.tests.database.base_test_dao import BaseTestDAO

class TestSQLiteDB(BaseTestDAO):
    @pytest.fixture
    def db(self):
        # Use an in-memory database for testing
        test_db = sqlitedb.SQLiteDB(":memory:", "database/schema.ddl")
        yield test_db
        test_db.conn.close()

    def add_user(self,
        db: sqlitedb.SQLiteDB,
        username: str,
        email: str,
        auth_provider: str
    ) -> None:
        cur = db.conn.cursor()
        cur.execute("INSERT INTO User "
                    "(username, email, auth_provider) VALUES (?, ?, ?);", 
                    (username, email, auth_provider))
        db.conn.commit()

    def get_last_user_id(self, db: sqlitedb.SQLiteDB) -> int:
        cur = db.conn.cursor()
        cur.execute("SELECT max(id) FROM User;")

        return cur.fetchone()[0]

    def get_token(self, db: sqlitedb.SQLiteDB, user_id: str):
        cur = db.conn.cursor()
        cur.execute("SELECT * FROM RefreshToken "
                    "WHERE user = ?;", (user_id,))
        return cur.fetchone()

