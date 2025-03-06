from abc import ABC, abstractmethod
from datetime import datetime
from typing import Literal, Optional

from backend.exam import Exam

AuthProvider = Literal["local", "google"]
SortOrder = Literal["popular", "recent", "N/A"]
Filter = Literal["favourites", "mine", "N/A"]

class DataAccessObject(ABC):
    """A database access object to interface with user data."""
    
    @abstractmethod
    def user_exists(self, 
        username: Optional[str] = None, 
        email: Optional[str] = None
    ) -> bool:
        """Return whether the username or email already exists in the database.

        Args:
            username: The username to check.
            email: The email to check.
        
        Raises:
            ValueError: At least one argument (username, email) is required,
                       but none were provided.
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def add_user(self, 
        username: str, 
        email: str, 
        password: Optional[str],
        auth_provider: AuthProvider, 
        oauth_id: Optional[str] = None
    ) -> int:
        """Insert a new user in the database with the given information.

        Args:
            username: The username of the user.
            email: The email of the user.
            password: The hashed password of the user.
            auth_provider: The authentication provider used to create the 
                           account.
            oauth_id: The oauth id used by Google if the selected 
                      authentication provider is Google.

        Returns:
            user_id (int): The database id of the inserted user.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_user(self, 
        user_id: Optional[int] = None, 
        username: Optional[str] = None, 
        email: Optional[str] = None
    ) -> Optional[tuple[int, str, str, str, AuthProvider, Optional[str],
                        datetime, datetime, Optional[datetime]]]:
        """Fetch the user information for the user according to the given
        information.
        
        Args:
            user_id: The id of the user.
            username: The username of the user.
            email: The email of the user.
        
        Returns:
            None if no user exists with the given id. Otherwise, a tuple 
            (user_id, username, email, password, auth_provider, oauth_id,
            created_at, updated_at, last_login):
             
            user_id (int): The unique integer representing the user 
                           in the database.
            username (str): The username of the user.
            email (str): The email of the user.
            password (str): The hashed password of the user.
            auth_provider (str): The authentication provider that the 
                                    account is associated with, either local 
                                    or Google. The value is either "local" 
                                    or "google".
            created_at (datetime): The time at which the account was 
                                    created.
            updated_at (datetime): The last time at which the account was 
                                    updated.
            last_login (datetime): The last time the user logged into this 
                                    account.

        Raises:
            ValueError: At least one argument (user_id, username, or email) is 
                        required, but none were provided.
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    def create_refresh_token(self,
        user_id: str,
        token: str,
        expires_at: datetime
    ) -> None:
        """Insert the given refresh token into the database.

        Args:
            user_id: The database id of the given user.
            token: The value of the refresh token.
            expires_at: The expiry time of the token.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_refresh_token(self, 
        token: str, 
        revoked: Optional[bool]
    ) -> Optional[tuple[int, datetime, datetime]]:
        """Return the latest status of the given token.

        Args:
            token: The refresh token.
            revoked: The revoked status of the token.
        
        Returns:
            None if the token could not be found. Otherwise, a tuple
            (user_id, expires_at, created_at):

            user_id: The user associated with this token.
            expires_at: The time at which the token expires.
            created_at: The time at which the token was created.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def set_revoked_status(self, token: str, revoked: bool) -> None:
        """Set the revoked status of the given token to the given value.
        
        Args:
            token: The refresh token.
            revoked: The new revoked status of the token.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def set_oauth_id(self, user_id: str, oauth_id: str) -> None:
        """Set the oauth_id of the user given by the user_id to the
        value oauth_id.

        Args:
            user_id: The database id of the user.
            oauth_id: The new oauth_id value to be set.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def set_last_login(self, username: str, time: datetime) -> None:
        """Set the last login time of the user to the given time.
        
        Args:
            username: The username of the user.
            time: The time to which the last login time is updated.

        Raises:
            DatabaseError: An error related to the database occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_exam(self, 
        exam_id: int
    ) -> Optional[tuple[int, str, str, str, str, str, bool, int, Exam]]:
        """Get the exam information for a given exam_id.

        Args:
            exam_id:
        Returns:
            A tuple (exam_id, name, date, owner, color, 
            description, public, num_fav).

            exam_id (int): The exam id.
            name (str): The name of the exam.
            date (str): The date which the exam was created.
            owner (int): The user id of the exam's owner.
            color (str): The color of the exam.
            description (str): The description of the exam.
            public (bool): Whether this exam is public or not.
            num_fav (int): The number of times this exam has been favourited.
            exam (Exam): The exam object.
        Raises
            DatabaseError: An error related to the database occurred.
        """
        raise NotImplementedError
    
    @abstractmethod
    def get_exams(self, 
        user_id: str,
        sorting: SortOrder,
        filter: Filter,
        title: Optional[str]
    ) -> list[tuple[int, str, str, str, str, str, bool, int]]:
        """Fetch public exams matching the query.

        Args:
            user_id: The id of the user making this query.
            sorting: The sorting settings for this query. This is either 
                     "popular", "recent", or "N/A", determining the order that
                     queries are returned in.
            filter: The filtering settings for this query. This is either
                    "favourites", "mine", or "N/A", determining the type of 
                    exams being returned.
            title: The title of the exam that is being searched for.

        Returns:
            A list of tuples (exam_id, name, date, owner, color, 
            description, public, num_fav) of exam information matching 
            the search query.
            
            exam_id (int): The exam id.
            name (str): The name of the exam.
            date (str): The date which the exam was created.
            owner (int): The user id of the exam's owner.
            color (str): The color of the exam.
            description (str): The description of the exam.
            public (bool): Whether this exam is public or not.
            num_fav (int): The number of times this exam has been favourited.
        """
        raise NotImplementedError

    @abstractmethod
    def add_exam(self,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> int:
        raise NotImplementedError
        """Insert an empty exam for a given user, with the given options.

        Args:
            username: The username of the user.
            name: The user-specified name of the exam.
            color: The color used to label the exam. Given in hex format.
            description: The user-specified description of the exam.
            public: If the exam is public or not.

        Returns:
            The examId of the inserted exam.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError
    
    @abstractmethod
    def insert_question(self,
        question_number: int,
        exam_id: int,
        question: str,
        answers: set[tuple[str, float]]
        ) -> None:
        """Insert a generated question and potential answers for a user exam.

        Args:
            username: The username of the user.
            exam: The exam name that the question is part of.
            question: The question text to be inserted.
            answers: A set of possible generated answers for the question. Each
                     answer consists of a (answer, confidence) tuple, where 
                     answer is the generated text, and confidence is the 
                     confidence of the LLM that the answer is correct determined
                     via majority voting.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def insert_answer(self,
                      question_id: int,
                      answer: str,
                      answer_confidence: float) -> None:
        """Insert an answer for a specific question in an exam.

        Args:
            question_id (int): The ID of the question this answer belongs to.
            answer (str): The generated answer text.
            answer_confidence (float): The confidence score of the answer.

        Raises:
            DatabaseError: If an error occurs while interacting with the 
                           database.
            DataError: If there is an issue with the provided data.
        """
        raise NotImplementedError

    @abstractmethod
    def add_favourite(self, user_id: int, exam_id: int) -> None:
        """Add the exam with given exam_id to the favourite exams of the user
        with given user_id.

        Args:
            user_id: The id of the user.
            exam_id: The exam of the user.
        
        Raises:
            DatabaseError: If an error occurs while interacting with the 
                           database.
            DataError: If there is an issue with the provided data.
        """
        raise NotImplementedError

    def remove_favourite(self, user_id: int, exam_id: int) -> None:
        """Remove the exam with given exam_id from the favourite exams of the
        user with given user_id.

        Args:
            user_id: The id of the user.
            exam_id: The exam of the user.
        
        Raises:
            DatabaseError: If an error occurs while interacting with the 
                           database.
            DataError: If there is an issue with the provided data.
        """
        raise NotImplementedError

class DatabaseError(Exception):
    """Exception raised for errors that are related to the database."""
    pass

class DataError(Exception):
    """Exception raised for errors caused by problems with the processed
    data."""
    pass
