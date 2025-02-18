from . import DataAccessObject
import sqlite3
import datetime

SCHEMA = "database/schema.ddl"

class SQLiteDB(DataAccessObject):
    """An SQLite implementation of the data access object."""
    filename: str
    
    def __init__(self, filename: str = "database/database.db"):
        """Initialise the database with the given filename."""
        self.filename = filename

        with open(SCHEMA, "r") as file:
            ddl_script = file.read()
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()
            cur.executescript(ddl_script)
            conn.commit()

    def add_user(self, username, email, password):
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO user (id, username, email, password) VALUES (NULL, ?, ?, ?)",
                        (username, email, password))
            conn.commit()

    def user_exists(self, username):
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()
            cur.execute("SELECT id FROM user WHERE user.username = ?", (username))
            return cur.fetchone()
    
    def create_exam(self, username, name, color, description, public):
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()

            # get the user id
            cur.execute("SELECT id FROM user WHERE username = ?", username)
            user_id = cur.fetchone()

            cur.execute("INSERT INTO exam (examId, name, date, owner, color, description, public) VALUES (NULL, ?, ?, ?, ?, ?, ?)", 
                        (name, datetime.datetime.now().isoformat(), user_id, color, description, public))
            conn.commit()

    def insert_question(self, username, exam, question, answers):
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()

            # get the user id
            cur.execute("SELECT id FROM user WHERE username = ?", (username,))
            user_id = cur.fetchone()[0]
            # get the exam id
            cur.execute("SELECT examID FROM exam WHERE owner = ? AND name = ?",
                        (user_id, exam))
            exam_id = cur.fetchone()[0]
            cur.execute("INSERT INTO question (questionId, number, exam, question) VALUES (NULL, ?, ?, ?)",
                        (..., exam_id, question))
            
            # inswert answers
            question_id = cur.lastrowid
            cur.executemany("INSERT INTO answers (answer, question, answer, confidence) VALUES (NULL, ?, ?, ?)", 
                            [(question_id, answer_text, confidence) for answer_text, confidence in answers])
            conn.commit()

    def get_exams(self, username, public):
        with sqlite3.connect(self.filename) as conn:
            cur = conn.cursor()

            # get the user id
            cur.execute("SELECT id FROM user WHERE username = ?", (username,))
            user_id = cur.fetchone()[0]

            if public:
                cur.execute("SELECT examId FROM exam WHERE owner = ? AND public = 1", (user_id,))
            else:
                cur.execute("SELECT examId FROM exam WHERE owner = ?", (user_id,))
            exam_ids = cur.fetchall()

        return exam_ids



if __name__ == "__main__":
    db = SQLiteDB()