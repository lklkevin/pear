import psycopg2
from psycopg2 import pool
import datetime
from typing import Optional
import time
import logging

from backend.database import (
    DataAccessObject,
    AuthProvider,
    SortOrder,
    Filter,
    DatabaseError,
    DataError
)
from backend.exam import Exam

logger = logging.getLogger("postgres_pool")

class PostgresDB(DataAccessObject):
    """A PostgreSQL implementation of the data access object."""
    
    def __init__(self, 
                 connection_string=None,
                 schema: str = "backend/database/postgres_schema.sql"):
        """Initialize the PostgreSQL database connection.
        """
        
        logger.info("Initializing PostgreSQL connection pool")
        
        try:
            self.connection_string = connection_string  # Store for reconnection if needed
            self._active_connections = {}  # Track active connections by id
            
            self.pool = psycopg2.pool.ThreadedConnectionPool(
                1, 20,
                dsn=connection_string,
                sslmode='require',
                connect_timeout=10,  # Longer connect timeout
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5,
            )
            
            # Log initial pool state
            self._log_pool_stats()
            logger.info("Successfully initialized PostgreSQL connection pool")
        except Exception as e:
            logger.error(f"Failed to initialize database connection pool: {str(e)}")
            raise DatabaseError(f"Failed to initialize database connection pool: {str(e)}")

        # Initialize schema if needed
        self._init_schema(schema)
    
    
    def _log_pool_stats(self):
        """Log current connection pool statistics, but only if there's a mismatch which could indicate a problem"""
        try:
            used = len(self.pool._used) if hasattr(self.pool, '_used') and hasattr(self.pool._used, '__len__') else 0
            active_tracked = len(self._active_connections)
            
            # Only log if there's a mismatch, which could indicate a connection leak
            if used != active_tracked:
                logger.warning(f"Connection count mismatch: pool shows {used} used, but we're tracking {active_tracked}")
                
                # Log the specific connection IDs we're tracking
                if active_tracked > 0:
                    logger.debug(f"Tracked connections: {list(self._active_connections.keys())}")
        except Exception as e:
            logger.error(f"Error logging pool stats: {str(e)}")
            logger.debug(f"Pool attributes: _used={type(getattr(self.pool, '_used', None))}, "
                         f"_keys={type(getattr(self.pool, '_keys', None))}, "
                         f"_pool={type(getattr(self.pool, '_pool', None))}")
    

    def _init_schema(self, schema_path: str):
        """Initialize the database schema if not already set up."""
        logger.info(f"Initializing database schema from {schema_path}")
        conn = self._get_conn()
        try:
            with open(schema_path, "r") as file:
                schema_script = file.read()
            
            cur = conn.cursor()
            cur.execute(schema_script)
            conn.commit()
            logger.info("Schema initialization completed successfully")
        except Exception as e:
            conn.rollback()
            logger.error(f"Failed to initialize schema: {str(e)}")
            raise DatabaseError(f"Failed to initialize schema: {str(e)}")
        finally:
            self._release_conn(conn)
    

    def _get_conn(self, retries=3):
        """Retry connection in case of failure."""
        last_exception = None
        for attempt in range(retries):
            try:
                conn = self.pool.getconn()
                conn_id = id(conn)
                
                # Track this connection
                self._active_connections[conn_id] = {
                    'acquired_at': datetime.datetime.now(),
                    'stack': []  # Could store stack trace here if needed
                }
                
                # Test if connection is closed or invalid
                if conn.closed:
                    logger.warning(f"Connection {conn_id} was closed when retrieved from pool")
                    # Properly handle closed connections by returning to pool and marking it for closure
                    self.pool.putconn(conn, close=True)
                    # Remove from tracking
                    self._active_connections.pop(conn_id, None)
                    
                    # Check if pool needs to be recreated (this happens if all connections are bad)
                    try:
                        conn = self.pool.getconn()
                        conn_id = id(conn)
                        self._active_connections[conn_id] = {
                            'acquired_at': datetime.datetime.now(),
                            'stack': []
                        }
                    except psycopg2.pool.PoolError as pe:
                        logger.error(f"Pool error when getting new connection: {pe}")
                        logger.warning("Connection pool exhausted or invalid, recreating pool...")
                        # Recreate the pool if all connections are invalid
                        self._recreate_pool()
                        conn = self.pool.getconn()
                        conn_id = id(conn)
                        self._active_connections[conn_id] = {
                            'acquired_at': datetime.datetime.now(),
                            'stack': []
                        }
                
                # Test the connection with a simple query
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    cursor.fetchone()
                
                # Only check for connection leaks, don't log normal pool activity
                self._log_pool_stats()
                return conn
            except psycopg2.OperationalError as e:
                last_exception = e
                logger.error(f"Attempt {attempt+1}: Database connection failed: {e}")
                
                # If we got a connection but it's bad, return it to the pool
                if 'conn' in locals() and conn and not conn.closed:
                    try:
                        self.pool.putconn(conn, close=True)
                        # Remove from tracking
                        self._active_connections.pop(conn_id, None)
                    except Exception as close_error:
                        logger.error(f"Error returning problematic connection to pool: {close_error}")
                
                # Exponential backoff for retries
                if attempt < retries - 1:
                    sleep_time = 2 ** attempt
                    logger.warning(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
                
                # If we're at the last attempt, try to recreate the pool
                if attempt == retries - 2:
                    try:
                        logger.warning("Attempting to recreate the connection pool...")
                        self._recreate_pool()
                    except Exception as pool_error:
                        logger.error(f"Failed to recreate connection pool: {pool_error}")
            except Exception as e:
                last_exception = e
                logger.error(f"Unexpected error during connection: {e}")
                
                # Return the connection to the pool if it exists with close=True since it's problematic
                if 'conn' in locals() and conn:
                    conn_id = id(conn)
                    try:
                        self.pool.putconn(conn, close=True)
                        # Remove from tracking
                        self._active_connections.pop(conn_id, None)
                    except Exception:
                        logger.error(f"Failed to return connection {conn_id} to pool")
                
                if attempt < retries - 1:
                    time.sleep(1)  # Wait 1 second before retrying
        
        # If we've exhausted all retries
        error_msg = f"Failed to get a valid database connection after {retries} attempts."
        if last_exception:
            error_msg += f" Last error: {str(last_exception)}"
        logger.critical(error_msg)
        
        # Log pool stats when we have connection problems
        self._log_pool_stats()
        
        raise DatabaseError(error_msg)
    

    def _recreate_pool(self):
        """Recreate the connection pool when all connections are invalid."""
        logger.warning("Recreating the database connection pool")
        try:
            # Close the old pool if it exists
            if hasattr(self, 'pool'):
                try:
                    self.pool.closeall()
                except Exception as e:
                    logger.error(f"Error closing existing pool: {e}")
            
            # Create a new pool
            self.pool = psycopg2.pool.ThreadedConnectionPool(
                1, 20,
                dsn=self.connection_string,
                sslmode='require',
                connect_timeout=10,
                keepalives=1,
                keepalives_idle=30,
                keepalives_interval=10,
                keepalives_count=5,
            )
            
            # Clear the active connections tracking
            self._active_connections = {}
            
        except Exception as e:
            logger.critical(f"Failed to recreate connection pool: {str(e)}")
            raise DatabaseError(f"Failed to recreate connection pool: {str(e)}")
    

    def _release_conn(self, conn):
        """Release a connection back to the pool safely."""
        if conn and not conn.closed:
            conn_id = id(conn)
            try:
                self.pool.putconn(conn)
                # Remove from tracking
                acquired_time = self._active_connections.pop(conn_id, {}).get('acquired_at')
                
                # Only log long-held connections - these might indicate problems
                if acquired_time:
                    duration = datetime.datetime.now() - acquired_time
                    # Log connections held for more than 5 seconds as potential issues
                    if duration.total_seconds() > 5.0:
                        logger.warning(f"Connection {conn_id} was held for {duration.total_seconds():.2f} seconds")
                else:
                    logger.warning(f"Released connection {conn_id} was not in tracking dict")
            except Exception as e:
                logger.error(f"Error returning connection {conn_id} to pool: {e}")
                try:
                    self.pool.putconn(conn, close=True)
                    # Remove from tracking
                    self._active_connections.pop(conn_id, None)
                except Exception as inner_e:
                    logger.error(f"Failed to close connection {conn_id} through pool: {inner_e}")
        else:
            if conn:
                conn_id = id(conn)
                logger.warning(f"Skipping release of closed connection {conn_id}")
                # Remove from tracking if it exists
                self._active_connections.pop(conn_id, None)
            else:
                logger.warning("Attempted to release None connection")
        
        # Check for connection leaks after release
        self._log_pool_stats()


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
        if password is None and auth_provider == 'local':
            raise DataError("A password must be provided "
                            "if auth_provider is 'google'.")

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
    

    def get_refresh_token(self, token: str, revoked: Optional[bool] = None) -> Optional[tuple]:
        """Get refresh token information."""
        conn = None
        try:
            conn = self._get_conn() 
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
        
            result = cur.fetchone()
            return result
            
        except Exception as e:
            raise DatabaseError(f"Error getting refresh token: {str(e)}")
        finally:
            if conn:
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


    def get_exams(
        self,
        user_id: Optional[str],
        sorting: SortOrder,
        filter: Filter,
        title: Optional[str],
        limit: int,
        page: int
    ) -> list[tuple[int, str, str, str, str, str, bool, int, bool]]:
        """Get a list of exams based on filter criteria, including whether the user liked each exam.
    
        If no user_id is provided, only public exams are returned with is_liked set to False.
        """
        conn = self._get_conn()
        try:
            cur = conn.cursor()

            # If no user_id is provided, ignore any filters that require a user and
            # return only public exams with is_liked as false.
            if not user_id:
                select_clause = (
                    'SELECT e.examId, e.name, e.date, e.owner, e.color, e.description, '
                    'e.public, e.num_fav, false AS is_liked'
                )
                base_query = 'FROM "Exam" e WHERE e.public = TRUE'
                query_params = []
            else:
                # Build query based on the filter.
                if filter == "mine":
                    # For "mine", select exams owned by the user and check if the user has liked them.
                    select_clause = (
                        'SELECT e.examId, e.name, e.date, e.owner, e.color, e.description, '
                            'e.public, e.num_fav, EXISTS(SELECT 1 FROM "Favourite" f WHERE f.examId = e.examId AND f.userId = %s) AS is_liked'
                    )
                    base_query = 'FROM "Exam" e WHERE e.owner = %s'
                    # user_id is used twice: once for the EXISTS subquery and once for filtering owner.
                    query_params = [user_id, user_id]
                elif filter == "favourites":
                    # For favourites, join the Favourite table. Since we're filtering on favourites,
                    # each exam returned is already liked by the user.
                    select_clause = (
                        'SELECT e.examId, e.name, e.date, e.owner, e.color, e.description, '
                        'e.public, e.num_fav, true AS is_liked'
                    )
                    base_query = 'FROM "Exam" e JOIN "Favourite" f ON e.examId = f.examId WHERE f.userId = %s'
                    query_params = [user_id]
                else:
                    # Default (public) filter: select public exams and determine if the user liked them.
                    select_clause = (
                        'SELECT e.examId, e.name, e.date, e.owner, e.color, e.description, '
                        'e.public, e.num_fav, EXISTS(SELECT 1 FROM "Favourite" f WHERE f.examId = e.examId AND f.userId = %s) AS is_liked'
                    )
                    base_query = 'FROM "Exam" e WHERE e.public = TRUE'
                    query_params = [user_id]

            # Add title filter if provided.
            if title:
                base_query += ' AND e.name ILIKE %s'
                query_params.append(f"%{title}%")

            # Add sorting.
            if sorting == "popular":
                order_clause = "ORDER BY e.num_fav DESC"
            elif sorting == "recent":
                order_clause = "ORDER BY e.date DESC"
            else:
                order_clause = 'ORDER BY e.name'

            # Add pagination.
            pagination_clause = "LIMIT %s OFFSET %s"
            query_params.extend([limit, (page - 1) * limit])

            query = f"{select_clause} {base_query} {order_clause} {pagination_clause}"

            cur.execute(query, query_params)
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