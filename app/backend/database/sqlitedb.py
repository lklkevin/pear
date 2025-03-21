import sqlite3
import datetime

from typing import Optional

from backend.database import (
    DataAccessObject,
    AuthProvider,
    SortOrder,
    Filter,
    DatabaseError,
    DataError
)
from backend.exam import Exam

class SQLiteDB(DataAccessObject):
    """An SQLite implementation of the data access object."""
    conn: sqlite3.Connection

    def __init__(self, 
        filename: str = "backend/database/sqlite.db",
        schema: str = "backend/database/schema.ddl"
    ):
        """Initialise the database with the given filename."""
        with open(schema, "r") as file:
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
                raise ValueError("At least one argument "
                                "(username, email) is required.")

            return cur.fetchone() is not None
        except sqlite3.DatabaseError as e:
            raise DatabaseError from e
        except sqlite3.DataError as e:
            raise DataError from e


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
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


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
        except sqlite3.DatabaseError as e:
            raise DatabaseError from e
        except sqlite3.DataError as e:
            raise DataError from e


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
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


    def get_refresh_token(self,
        token: str,
        revoked: Optional[bool] = None
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
        except sqlite3.DatabaseError as e:
            raise DatabaseError from e
        except sqlite3.DataError as e:
            raise DataError from e


    def set_revoked_status(self, token: str, revoked: bool) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE RefreshToken "
                        "SET revoked = ? "
                        "WHERE token = ?;", (revoked, token))
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


    def set_oauth_id(self, user_id: str, oauth_id: str) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE User "
                        "SET oauth_id = ? "
                        "WHERE id = ?;", (oauth_id, user_id))
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


    def set_last_login(self, username: str, time: datetime) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("UPDATE User "
                        "SET last_login = ?"
                        "WHERE username = ?", (time, username))
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e

    def update_username(self, user_id: int, new_username: str) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute(
                "UPDATE User SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;",
                (new_username, user_id)
            )
            if cur.rowcount == 0:
                raise DataError("No user found with the given ID.")
            self.conn.commit()
        except sqlite3.IntegrityError as e:
            self.conn.rollback()
            raise DataError("Username already in use.") from e
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e

    def update_password(self, user_id: int, new_hashed_password: str) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute(
                "UPDATE User SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;",
                (new_hashed_password, user_id)
            )
            if cur.rowcount == 0:
                raise DataError("No user found with the given ID.")
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e

    def delete_user_account(self, user_id: int) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("DELETE FROM User WHERE id = ?;", (user_id,))
            if cur.rowcount == 0:
                raise DataError("No user found with the given ID.")
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e

    def get_exam(self, 
        exam_id: int
    ) -> Optional[tuple[int, str, str, str, str, str, bool, int, Exam]]:
        try:
            cur = self.conn.cursor()
            cur.execute("SELECT * FROM Exam WHERE examId = ?;", (exam_id,))
            exam_info = cur.fetchone()
            if exam_id is None:
                return None

            cur.execute("SELECT * FROM Question WHERE exam = ? "
                        "ORDER BY number", (exam_id,))
            exam = Exam()
            questions_info = cur.fetchall()
            for questionId, _, _, question in questions_info:
                exam.add_question(question)
                cur.execute("SELECT answer, confidence FROM Answer "
                            "INNER JOIN Question "
                            "ON Answer.question = Question.questionId "
                            " WHERE Question.questionId = ?;",
                            (questionId,))
                answers = cur.fetchall()
                answer_dict = {}
                for answer, confidence in answers:
                    answer_dict[answer] = confidence
                exam.add_answers(question, answer_dict)
            
            return *exam_info, exam
        except sqlite3.DatabaseError as e:
            raise DatabaseError from e
        except sqlite3.DataError as e:
            raise DataError from e
        

    def get_exams(self,
              user_id: str,
              sorting: SortOrder,
              filter: Filter,
              title: Optional[str],
              limit: int,
              page: int) -> list[tuple[int, str, str, str, str, str, bool, int]]:
        # Build the initial query and parameters based on the filter
        if filter == "favourites":
            query = ("SELECT * FROM Exam WHERE examId IN (SELECT examId FROM Favourite WHERE userId = ?) ")
            args = (user_id,)
        elif filter == "mine":
            query = "SELECT * FROM Exam WHERE owner = ? "
            args = (user_id,)
        else:
            query = "SELECT * FROM Exam WHERE public = True "
            args = ()  # using an empty tuple makes it easier to append later

        # Append ordering based on sorting preference
        if sorting == "popular":
            query += "ORDER BY num_fav DESC, name "
        elif sorting == "recent":
            query += "ORDER BY date DESC, name "
        else:
            query += "ORDER BY name "

        # Calculate offset based on the page number (assuming 1-indexed pages)
        offset = (page - 1) * limit
        # Append pagination clauses
        query += "LIMIT ? OFFSET ?;"

        # Append limit and offset values to the parameters
        args = args + (limit, offset)

        try:
            cur = self.conn.cursor()
            cur.execute(query, args)
            matches = cur.fetchall()
            # Filter by title if provided; adjust this as needed for None values
            return [match for match in matches if title in match[1]]
        except sqlite3.DatabaseError as e:
            raise DatabaseError from e
        except sqlite3.DataError as e:
            raise DataError from e


    def add_exam(self,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> int:
        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO Exam "
                        "(name, date, owner, color, description, public) "
                        "VALUES "
                        "(?, datetime('now'), "
                        " (SELECT id FROM User WHERE username = ?), ?, ?, ?);",
                        (name, username, color, description, int(public)))
            exam_id = cur.lastrowid
            self.conn.commit()
            return exam_id
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e

    def insert_question(self,
        question_number: int,
        exam_id: int,
        question: str,
        answers: set[tuple[str, float]]
    ) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO Question (number, exam, question) "
                        "VALUES (?, ?, ?);",
                        (question_number, exam_id, question))
            question_id = cur.lastrowid

            for answer, confidence in answers:
                self.insert_answer(question_id, answer, confidence)

            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


    def insert_answer(self,
        questionId: int,
        answer: str,
        answer_confidence: float
    ) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute("INSERT INTO Answer (question, answer, confidence) "
                        "VALUES (?, ?, ?);",
                        (questionId, answer, answer_confidence))
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError from e
        except sqlite3.DataError as e:
            self.conn.rollback()
            raise DataError from e


    def add_favourite(self, user_id: int, exam_id: int) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute(
                "INSERT INTO Favourite (userId, examId) VALUES (?, ?);",
                (user_id, exam_id)
            )
            # Only update the exam count if a new favourite was actually inserted.
            if cur.rowcount == 1:
                cur.execute(
                    "UPDATE Exam SET num_fav = num_fav + 1 WHERE examId = ?;",
                    (exam_id,)
                )
            self.conn.commit()
        except sqlite3.IntegrityError as e:
            self.conn.rollback()
            # IntegrityError might occur if the (user_id, exam_id) pair already exists
            raise DatabaseError("Favourite already exists or referential integrity error.") from e
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError("Database error occurred while adding favourite.") from e


    def remove_favourite(self, user_id: int, exam_id: int) -> None:
        try:
            cur = self.conn.cursor()
            cur.execute(
                "DELETE FROM Favourite WHERE userId = ? AND examId = ?;",
                (user_id, exam_id)
            )
            # Only update the exam's num_fav if a favourite was actually deleted.
            if cur.rowcount == 1:
                # The extra condition 'AND num_fav > 0' helps prevent negative counts.
                cur.execute(
                    "UPDATE Exam SET num_fav = num_fav - 1 WHERE examId = ? AND num_fav > 0;",
                    (exam_id,)
                )
            self.conn.commit()
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError("Database error occurred while removing favourite.") from e


    def is_favourite(self, user_id: int, exam_id: int) -> bool:
        try:
            cur = self.conn.cursor()
            cur.execute(
                "SELECT 1 FROM Favourite WHERE userId = ? AND examId = ? LIMIT 1;",
                (user_id, exam_id)
            )
            row = cur.fetchone()
            return row is not None
        except sqlite3.DatabaseError as e:
            self.conn.rollback()
            raise DatabaseError("Database error occurred while checking favourite.") from e


if __name__ == "__main__":
    db = SQLiteDB()