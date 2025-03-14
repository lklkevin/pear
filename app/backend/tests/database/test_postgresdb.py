import datetime
import os

import psycopg2
import pytest

from backend.database.postgresdb import PostgresDB
from backend.tests.database.base_test_dao import BaseTestDAO

class TestPostgresDB(BaseTestDAO):
    """
    A concrete implementation of the DAO interface tests with a PostgreSQL
    implementation from backend.database.postgresdb.
    """
    @pytest.fixture
    def db(self, postgresql):
        dsn = (
            f"host={postgresql.info.host} "
            f"port={postgresql.info.port} "
            f"user={postgresql.info.user} "
            f"dbname={postgresql.info.dbname} "
        )
        dao = PostgresDB(dsn, use_ssl=False)
    
        yield dao  # Provide the DAO instance to tests
        
        # Close the connection pool after the tests
        dao.pool.closeall()

    def add_user(self,
        db: PostgresDB,
        username: str,
        email: str,
        auth_provider: str
    ) -> None:
        conn = db._get_conn()
        cur = conn.cursor()
        cur.execute('INSERT INTO "User" '
                    '(username, email, auth_provider) '
                    'VALUES (%s, %s, %s);', 
                    (username, email, auth_provider))
        conn.commit()

    def add_exam(self,
        db: PostgresDB,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> int:
        conn = db._get_conn()
        cur = conn.cursor()

        # get userID of username
        cur.execute('SELECT id FROM "User" '
                    'WHERE username = %s;', (username,))
        user_id = cur.fetchone()[0]

        cur.execute('INSERT INTO "Exam" '
                    '(name, date, owner, color, description, public) '
                    'VALUES (%s, %s, %s, %s, %s, %s) '
                    'RETURNING examID;', 
                    (name, datetime.datetime.now(), user_id, color, description, public))
        exam_id = cur.fetchone()[0]

        # add questions & answers
        cur.execute('INSERT INTO "Question" '
                    '(number, exam, question) '
                    'VALUES (%s, %s, %s) RETURNING questionId;',
                    (1, exam_id, "What's 1 + 1?"))
        question_id = cur.fetchone()[0]
        cur.execute('INSERT INTO "Answer" '
                    '(question, answer, confidence) '
                    'VALUES (%s, %s, %s)',
                    (question_id, "2", 0.9))
        cur.execute('INSERT INTO "Answer" '
                    '(question, answer, confidence) '
                    'VALUES (%s, %s, %s)',
                    (question_id, "1.5", 0.1))

        cur.execute('INSERT INTO "Question" '
                    '(number, exam, question) '
                    'VALUES (%s, %s, %s) RETURNING questionId;',
                    (2, exam_id, "What's 5 * 4?"))
        question_id = cur.fetchone()[0]
        cur.execute('INSERT INTO "Answer" '
                    '(question, answer, confidence) '
                    'VALUES (%s, %s, %s)',
                    (question_id, "20", 0.8))
        cur.execute('INSERT INTO "Answer" '
                    '(question, answer, confidence) '
                    'VALUES (%s, %s, %s)',
                    (question_id, "25", 0.2))

        conn.commit()
        return exam_id

    def get_last_user_id(self, db: PostgresDB) -> int:
        conn = db._get_conn()
        cur = conn.cursor()

        cur.execute('SELECT max(id) FROM "User";')
        return cur.fetchone()[0]

    def get_token(self, 
        db: PostgresDB,
        user_id: int
    ) -> tuple[int, int, str, bool, datetime.datetime, datetime.datetime]:
        conn = db._get_conn()
        cur = conn.cursor()

        cur.execute('SELECT * FROM "RefreshToken" '
                    'WHERE user_id = %s;', (user_id,))
        token_id, user, token, revoked, expires_at, created_at = cur.fetchone()

        return token_id, user, token, revoked, str(expires_at), str(created_at)
        
    def exam_exists(self, 
        db: PostgresDB, 
        username: str,
        name: str
    ) -> bool:
        conn = db._get_conn()
        cur = conn.cursor()

        cur.execute('SELECT * FROM "Exam" '
                    'WHERE owner = (SELECT id FROM "User" WHERE username = %s) '
                    '   AND name = %s;', (username, name))
        return cur.fetchone() is not None

    def is_favourited(self, 
        db: PostgresDB, 
        user_id: int, 
        exam_id: int
    ) -> bool:
        conn = db._get_conn()
        cur = conn.cursor()

        cur.execute('SELECT * FROM "Favourite" '
                    'WHERE userId = %s AND examID = %s;',
                    (user_id, exam_id))

        return cur.fetchone() is not None

    # the tests below are written because datetime objects are returned by 
    # postgreSQL whereas the base_test_dao methods expect strings, so these
    # methods override the base_test_dao methods to directly use datetime 
    # objects
    def test_get_refresh_token(self, db: PostgresDB):
        user_id = db.add_user("testuser", 
                              "test@example.com", 
                              "password", 
                              "local")
        time = datetime.datetime.now() + datetime.timedelta(days=1)
        db.create_refresh_token(user_id, "token", time)

        res = db.get_refresh_token("token")
        assert res is not None

        user, expires_at, created_at = res

        assert user == user_id
        assert expires_at == time

        assert db.get_refresh_token("token", True) is None

    def test_set_last_login(self, db: PostgresDB):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        time = datetime.datetime.now()
        db.set_last_login("testuser", time)

        user = db.get_user(user_id=user_id)
        assert user[-1] == time

    def test_case_insensitive_search(self, db: PostgresDB):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "abc", "#FFFFFF", "test", True)

        matches = db.get_exams(user_id, "N/A", "N/A", "ABc", 100, 1)
        assert len(matches) == 1
        assert matches[0][0] == exam_id