import psycopg2
from psycopg2 import pool
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

class PostgresDB(DataAccessObject):
    """A PostgreSQL implementation of the data access object."""
    
    def __init__(self, 
                 connection_string=None,
                 schema: str = "backend/database/postgres_schema.sql"):
        """Initialize the PostgreSQL database connection.
        """
        self.pool = psycopg2.pool.SimpleConnectionPool(
            1, 10,
            dsn=connection_string,
            sslmode='require'
        )
        
        # Initialize schema if needed
        self._init_schema(schema)
    
    def _init_schema(self, schema_path: str):
        """Initialize the database schema if not already set up."""
        conn = self._get_conn()
        try:
            with open(schema_path, "r") as file:
                schema_script = file.read()
            
            cur = conn.cursor()
            cur.execute(schema_script)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Failed to initialize schema: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def _get_conn(self):
        """Get a connection from the pool."""
        conn = self.pool.getconn()
        conn.reset()  # Reset the connection to clean any previous state
        return conn
    
    def _release_conn(self, conn):
        """Release a connection back to the pool."""
        self.pool.putconn(conn)

    def user_exists(self,
                  username: Optional[str] = None,
                  email: Optional[str] = None) -> bool:
        """Check if a user exists with the given username or email."""
        if not username and not email:
            raise ValueError("At least one argument (username, email) is required.")
        
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            if username:
                cur.execute('SELECT 1 FROM "User" WHERE username = %s;', (username,))
            else:
                cur.execute('SELECT 1 FROM "User" WHERE email = %s;', (email,))
            
            return cur.fetchone() is not None
        except Exception as e:
            raise DatabaseError(f"Error checking if user exists: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def add_user(self,
                username: str,
                email: str,
                password: Optional[str],
                auth_provider: AuthProvider,
                oauth_id: Optional[str] = None) -> int:
        """Add a new user to the database."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                'INSERT INTO "User" (username, email, password, auth_provider, oauth_id) '
                'VALUES (%s, %s, %s, %s, %s) RETURNING id;',
                (username, email, password, auth_provider, oauth_id)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            return user_id
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error adding user: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def get_user(self,
                user_id: Optional[int] = None,
                username: Optional[str] = None,
                email: Optional[str] = None) -> Optional[tuple[int, str, str, str, AuthProvider, Optional[str],
                                        datetime.datetime, datetime.datetime, Optional[datetime.datetime]]]:
        """Get user information by ID, username, or email."""
        if not user_id and not username and not email:
            raise ValueError("At least one argument (user_id, username, email) is required.")
        
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            if user_id:
                cur.execute('SELECT * FROM "User" WHERE id = %s;', (user_id,))
            elif username:
                cur.execute('SELECT * FROM "User" WHERE username = %s;', (username,))
            else:
                cur.execute('SELECT * FROM "User" WHERE email = %s;', (email,))
            
            result = cur.fetchone()
            return result
        except Exception as e:
            raise DatabaseError(f"Error getting user: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def create_refresh_token(self,
                           user_id: str,
                           token: str,
                           expires_at: datetime.datetime) -> None:
        """Create a refresh token for a user."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                'INSERT INTO "RefreshToken" (user_id, token, expires_at) '
                'VALUES (%s, %s, %s);',
                (user_id, token, expires_at)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error creating refresh token: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def get_refresh_token(self,
                        token: str,
                        revoked: Optional[bool] = None) -> Optional[tuple[int, datetime.datetime, datetime.datetime]]:
        """Get refresh token information."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            if revoked is None:
                cur.execute(
                    'SELECT user_id, expires_at, created_at FROM "RefreshToken" '
                    'WHERE token = %s;',
                    (token,)
                )
            else:
                cur.execute(
                    'SELECT user_id, expires_at, created_at FROM "RefreshToken" '
                    'WHERE token = %s AND revoked = %s;',
                    (token, revoked)
                )
            
            return cur.fetchone()
        except Exception as e:
            raise DatabaseError(f"Error getting refresh token: {str(e)}")
        finally:
            self._release_conn(conn)

    def set_revoked_status(self, token: str, revoked: bool) -> None:
        """Set the revoked status of a refresh token."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                'UPDATE "RefreshToken" SET revoked = %s WHERE token = %s;',
                (revoked, token)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error setting revoked status: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def set_oauth_id(self, user_id: str, oauth_id: str) -> None:
        """Set the OAuth ID for a user."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                'UPDATE "User" SET oauth_id = %s WHERE id = %s;',
                (oauth_id, user_id)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error setting OAuth ID: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def set_last_login(self, username: str, time: datetime.datetime) -> None:
        """Set the last login time for a user."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            cur.execute(
                'UPDATE "User" SET last_login = %s WHERE username = %s;',
                (time, username)
            )
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error setting last login: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def get_exam(self, exam_id: int) -> Optional[tuple[int, str, str, str, str, str, bool, int, Exam]]:
        """Get exam information by ID."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
    
            cur.execute('SELECT * FROM "Exam" WHERE examId = %s;', (exam_id,))
            exam_row = cur.fetchone()
    
            if not exam_row:
                return None
    
        # Get questions for this exam
            cur.execute('SELECT * FROM "Question" WHERE exam = %s ORDER BY number;', (exam_id,))
            questions = cur.fetchall()
    
        # Instantiate Exam without passing parameters, since Exam.__init__ takes no parameters.
            exam_obj = Exam()
    
            for question_row in questions:
                question_id = question_row[0]
                question_text = question_row[3]
        
                cur.execute('SELECT * FROM "Answer" WHERE question = %s;', (question_id,))
                answers = cur.fetchall()
            
                # Build a dictionary mapping answer text to confidence
                answer_dict = {}
                for answer_row in answers:
                    answer_text = answer_row[2]
                    confidence = answer_row[3]
                    answer_dict[answer_text] = confidence
            
                # Add the question and its answers to the exam object.
                exam_obj.add_question(question_text)
                exam_obj.add_answers(question_text, answer_dict)
    
            # Return a tuple with exam information and the exam object.
            return (
                exam_row[0],  # examId
                exam_row[1],  # name
                exam_row[2],  # date
                exam_row[3],  # owner
                exam_row[4],  # color
                exam_row[5],  # description
                exam_row[6],  # public (boolean in PostgreSQL)
                exam_row[7],  # num_fav
                exam_obj      # the Exam object
            )
        except Exception as e:
            raise DatabaseError(f"Error getting exam: {str(e)}")
        finally:
            self._release_conn(conn)

    def get_exams(self,
                user_id: str,
                sorting: SortOrder,
                filter: Filter,
                title: Optional[str],
                limit: int,
                page: int) -> list[tuple[int, str, str, str, str, str, bool, int]]:
        """Get a list of exams based on filter criteria."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            # Build the query based on filter
            params = []
            
            if filter == "mine":
                query = 'SELECT * FROM "Exam" WHERE owner = %s'
                params.append(user_id)
            elif filter == "favourites":
                query = 'SELECT e.* FROM "Exam" e JOIN "Favourite" f ON e.examId = f.examId WHERE f.userId = %s'
                params.append(user_id)
            else:
                query = 'SELECT * FROM "Exam" WHERE "public" = TRUE'
            
            # Add title filter if provided
            if title:
                if "WHERE" in query:  # Ensure `AND` is only added if `WHERE` exists
                    query += ' AND "name" LIKE %s'
                else:
                    query += ' WHERE "name" LIKE %s'
                params.append(f"%{title}%")
            
            # Add sorting
            if sorting == "popular":
                query += " ORDER BY num_fav DESC"
            elif sorting == "recent":
                query += " ORDER BY date DESC"
            else:
                query += ' ORDER BY "name"'
            
            # Add pagination
            query += " LIMIT %s OFFSET %s"
            params.extend([limit, (page - 1) * limit])
            
            cur.execute(query, params)
            results = cur.fetchall()
            
            return results
        except Exception as e:
            raise DatabaseError(f"Error getting exams: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def add_exam(self,
               username: str,
               name: str,
               color: str,
               description: str,
               public: bool) -> int:
        """Add a new exam to the database."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            # Get user ID from username
            cur.execute('SELECT id FROM "User" WHERE username = %s;', (username,))
            user_row = cur.fetchone()
            if not user_row:
                raise DataError(f"User {username} not found")
            
            user_id = user_row[0]
            current_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M")

            
            cur.execute(
                'INSERT INTO "Exam" (name, date, owner, color, description, public) '
                'VALUES (%s, %s, %s, %s, %s, %s) RETURNING examId;',
                (name, current_date, user_id, color, description, public)
            )
            
            exam_id = cur.fetchone()[0]
            conn.commit()
            return exam_id
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error adding exam: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def insert_question(self,
                      question_number: int,
                      exam_id: int,
                      question: str,
                      answers: set[tuple[str, float]]) -> None:
        """Insert a question and its answers into the database."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            cur.execute(
                'INSERT INTO "Question" (number, exam, question) '
                'VALUES (%s, %s, %s) RETURNING questionId;',
                (question_number, exam_id, question)
            )
            
            question_id = cur.fetchone()[0]
            
            # Insert answers for this question
            for answer, confidence in answers:
                cur.execute(
                    'INSERT INTO "Answer" (question, answer, confidence) '
                    'VALUES (%s, %s, %s);',
                    (question_id, answer, confidence)
                )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error inserting question: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def insert_answer(self,
                    question_id: int,
                    answer: str,
                    answer_confidence: float) -> None:
        """Insert an answer for a question."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            cur.execute(
                'INSERT INTO "Answer" (question, answer, confidence) '
                'VALUES (%s, %s, %s);',
                (question_id, answer, answer_confidence)
            )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error inserting answer: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def add_favourite(self, user_id: int, exam_id: int) -> None:
        """Add an exam to a user's favorites."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            # First, check if already favorited
            if self.is_favourite(user_id, exam_id):
                return
            
            # Add to favorites
            cur.execute(
                'INSERT INTO "Favourite" (userId, examId) VALUES (%s, %s);',
                (user_id, exam_id)
            )
            
            # Increment favorite count
            cur.execute(
                'UPDATE "Exam" SET num_fav = num_fav + 1 WHERE examId = %s;',
                (exam_id,)
            )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error adding favourite: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def remove_favourite(self, user_id: int, exam_id: int) -> None:
        """Remove an exam from a user's favorites."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            # First, check if favorited
            if not self.is_favourite(user_id, exam_id):
                return
            
            # Remove from favorites
            cur.execute(
                'DELETE FROM "Favourite" WHERE userId = %s AND examId = %s;',
                (user_id, exam_id)
            )
            
            # Decrement favorite count
            cur.execute(
                'UPDATE "Exam" SET num_fav = num_fav - 1 WHERE examId = %s;',
                (exam_id,)
            )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise DatabaseError(f"Error removing favourite: {str(e)}")
        finally:
            self._release_conn(conn)
    
    def is_favourite(self, user_id: int, exam_id: int) -> bool:
        """Check if an exam is in a user's favorites."""
        conn = self._get_conn()
        try:
            cur = conn.cursor()
            
            cur.execute(
                'SELECT 1 FROM "Favourite" WHERE userId = %s AND examId = %s;',
                (user_id, exam_id)
            )
            
            return cur.fetchone() is not None
        except Exception as e:
            raise DatabaseError(f"Error checking favourite status: {str(e)}")
        finally:
            self._release_conn(conn) 