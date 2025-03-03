from abc import ABC, abstractmethod


class DataAccessObject(ABC):
    """A database access object to interface with user data."""

    @abstractmethod
    def add_user(self, username: str, email: str, password: str) -> None:
        """Add a new user into the database with the given username, email, 
        and hashed password.

        Args:
            username: The username of the new user.
            email: The email of the new user.
            password: The hashed password of the new user.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
        """
        raise NotImplementedError
    
    @abstractmethod
    def user_exists(self, username: str) -> bool:
        """Return whether the username already exists in the database.

        Args:
            username: The username to check.
        
        Raises:
            DatabaseError: An error related to the database occurred.
            DataError: An error related to the processed data occurred.
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
    