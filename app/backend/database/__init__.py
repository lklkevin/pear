from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

class DataAccessObject(ABC):
    """A database access object to interface with user data."""
    
    @abstractmethod
    def user_exists(self, username: str, email: str) -> bool:
        """Return whether the username or email already exists in the database.

        Args:
            username: The username to check.
            email: The email to check.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def add_user(self, username: str, email: str, password: str,
                 auth_provider: str) -> None:
        """Insert a new user in the database with the given information.

        Args:
            username: The username of the user.
            email: The email of the user.
            password: The hashed password of the user.
            auth_provider: The authentication provider used to create the 
                           account.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_user_by_id(self, id: int
        ) -> Optional[
        tuple[str, str, str, str, datetime, datetime, Optional[datetime]]]:
        """Fetch the user information for the user associated with the given id.
        
        Args:
            id: The id of the user.
        
        Returns:
            None if no user exists with the given id. Otherwise, a tuple 
            (username, email, password, auth_provider, created_at, updated_at,
            last_login):
             
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
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_user_by_email(self, email: str
        ) -> Optional[
        tuple[str, str, str, str, datetime, datetime, Optional[datetime]]]:
        """Fetch the user information for the user associated with the given 
        email.
        
        Args:
            email: The email of the user.
        
        Returns:
            None if no user exists with the given email. Otherwise, a tuple 
            (username, email, password, auth_provider, created_at, updated_at,
            last_login):

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
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_user_by_username(self, username: str
        ) -> Optional[
        tuple[str, str, str, str, datetime, datetime, Optional[datetime]]]:
        """Fetch the user information for the user associated with the given 
        username.
        
        Args:
            username: The username of the user.
        
        Returns:
            None if no user exists with the given username. Otherwise, a tuple 
            (username, email, password, auth_provider, created_at, 
            updated_at, last_login):
             
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
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def get_refresh_token(self, token: str, revoked: bool
    ) -> Optional[tuple[int, datetime, datetime]]:
        """Return the information associated with the given token and revoked 
        status.

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
    def set_token_revoked(self, token: str, revoked: bool) -> None:
        """Update the revoked status of the given token to the given value.
        
        Args:
            token: The refresh token.
            revoked: The new revoked status of the token.

        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def update_last_login(self, username: str, time: datetime) -> bool:
        """Update the last login time of the user to the given time.
        
        Args:
            username: The username of the user.
            time: The time to which the last login time is updated.

        Raises:
            DatabaseError: An error related to the database occurred.
        """
        raise NotImplementedError
    
    @abstractmethod
    def get_exams(self, 
                  username: str, 
                  public: bool) -> list[int]:
        """Return exam ids associated with the given user. 
        
        If public is True, then return only the public exams. Otherwise, return
        all exams.

        Args:
            username: The username of the user.
            public: Whether if only public exams should be returned.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError

    @abstractmethod
    def create_exam(self,
                    username: str,
                    name: str,
                    color: str,
                    description: str,
                    public: bool) -> None:
        """Insert an empty exam for a given user, with the given options.

        Args:
            username: The username of the user.
            name: The user-specified name of the exam.
            color: The color used to label the exam. Given in hex format.
            description: The user-specified description of the exam.
            public: If the exam is public or not.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError
    
    @abstractmethod
    def insert_question(self,
                        username: str,
                        exam: str,
                        question: str,
                        answers: set[tuple[str, float]]) -> None:
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
