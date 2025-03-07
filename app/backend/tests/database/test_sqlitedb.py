import datetime
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

    def add_exam(self,
        db: sqlitedb.SQLiteDB,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> int:
        cur = db.conn.cursor()
        cur.execute("SELECT id FROM User WHERE username = ?;", (username,))
        user_id = cur.fetchone()[0]

        cur.execute("INSERT INTO Exam "
                    "(name, date, owner, color, description, public) "
                    "VALUES "
                    "(?, ?, ?, ?, ?, ?)",
                    (name, datetime.datetime.now(), 
                     user_id, color, description, public))
        exam_id = cur.lastrowid
        
        cur.execute("INSERT INTO Question "
                    "(number, exam, question) "
                    "VALUES (?, ?, ?)",
                    (1, exam_id, "What's 1 + 1?"))
        question_id = cur.lastrowid
        cur.execute("INSERT INTO Answer "
                    "(question, answer, confidence) "
                    "VALUES (?, ?, ?)",
                    (question_id, "2", 0.9))
        cur.execute("INSERT INTO Answer "
                    "(question, answer, confidence) "
                    "VALUES (?, ?, ?)",
                    (question_id, "1.5", 0.1))

        cur.execute("INSERT INTO Question "
                    "(number, exam, question) "
                    "VALUES (?, ?, ?)",
                    (2, exam_id, "What's 5 * 4?"))
        question_id = cur.lastrowid
        cur.execute("INSERT INTO Answer "
                    "(question, answer, confidence) "
                    "VALUES (?, ?, ?)",
                    (question_id, "20", 0.8))
        cur.execute("INSERT INTO Answer "
                    "(question, answer, confidence) "
                    "VALUES (?, ?, ?)",
                    (question_id, "25", 0.2))
        db.conn.commit()

        return exam_id

    def get_last_user_id(self, db: sqlitedb.SQLiteDB) -> int:
        cur = db.conn.cursor()
        cur.execute("SELECT max(id) FROM User;")

        return cur.fetchone()[0]

    def get_token(self, 
        db: sqlitedb.SQLiteDB,
        user_id: int
    ) -> tuple[int, int, str, bool, datetime.datetime, datetime.datetime]:
        cur = db.conn.cursor()
        cur.execute("SELECT * FROM RefreshToken "
                    "WHERE user = ?;", (user_id,))
        return cur.fetchone()

    def exam_exists(self, 
        db: sqlitedb.SQLiteDB, 
        username: str,
        name: str
    ) -> bool:
        cur = db.conn.cursor()
        cur.execute("SELECT * FROM Exam "
                    "WHERE owner = (SELECT id FROM User WHERE username = ?)"
                    "AND name = ?;", (username, name))
        return cur.fetchone() is not None

    def is_favourited(self, 
        db: sqlitedb.SQLiteDB, 
        user_id: int, 
        exam_id: int
    ) -> bool:
        cur = db.conn.cursor()
        cur.execute("SELECT * FROM Favourite WHERE userId = ? AND examID = ?;",
                    (user_id, exam_id))

        return cur.fetchone() is not None