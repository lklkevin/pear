import pytest

from abc import ABC, abstractmethod
import datetime

from backend.database import DataAccessObject, DataError, DatabaseError
from backend.exam import Exam

class BaseTestDAO(ABC):
    """A abstract base test suite for the abstract base class DataAccessObject.

    A test suite for a concrete implementation of DataAccessObject should be a
    subclass of BaseTestDAO, with concrete implementations of the abstract 
    methods.
    """
    @pytest.fixture
    @abstractmethod
    def db(self):
        """Fixture to provide the concrete DAO instance for the tests."""
        pass
    
    @abstractmethod
    def add_user(self,
        db: DataAccessObject,
        username: str,
        email: str,
        auth_provider: str
    ) -> None:
        """
        Manually add a user to the database without using the DAO interface.

        Args:
            db: The database instance.
            username: The username of the user to be added.
            email: The email of the user to be added.
            auth_provider: The authentication provider of the user to be added.
        """
        raise NotImplementedError

    @abstractmethod
    def add_exam(self,
        db: DataAccessObject,
        username: str,
        name: str,
        color: str,
        description: str,
        public: bool
    ) -> int:
        """
        Manually add an exam with 2 questions without using the DAO interface.

        The added exam consists of two questions with two answers each:
            1. What's 1 + 1?
                a) 2, confidence=0.9
                b) 1.5, confidence=0.1
            2. What's 5 * 4?
                a) 20, confidence=0.8
                b) 25, confidence=0.2

        Args:
            db: The database instance.
            username: The username of the owner.
            name: The name of the exam.
            color: The colour of the exam.
            description: The description of the exam.
            public: Whether the exam is public or not.
        Returns:
            The id of the inserted exam.
        """
        raise NotImplementedError

    def correct_exam(self,
        exam: Exam
    ) -> bool:
        """
        Return if the exam matches the format created in self.add_exam.

        Args:
            exam: The Exam object to be checked.
        """
        try:
            assert len(exam.questions) == 2, "Wrong number of questions"

            assert exam.questions[0] == "What's 1 + 1?", "Incorrect 1st question"
            assert exam.questions[1] == "What's 5 * 4?", "Incorrect 2nd question"

            answers = exam.answer_confidence[exam.questions[0]]
            
            assert answers["2"] == 0.9, "Wrong confidence for answer"
            assert answers["1.5"] == 0.1, "Wrong confidence for answer"

            answers = exam.answer_confidence[exam.questions[1]]
            assert answers["20"] == 0.8, "Wrong confidence for answer"
            assert answers["25"] == 0.2, "Wrong confidence for answer"

            return True
        except AssertionError:

            return False


    @abstractmethod
    def get_last_user_id(self, db: DataAccessObject) -> int:
        """
        Manually return the user id of the last inserted user without
        using the DAO interface.

        Args:
            db: The database instance.
        Returns:
            The id of the last inserted user.
        """
        raise NotImplementedError

    @abstractmethod
    def get_token(self, 
        db: DataAccessObject,
        user_id: int
    ) -> tuple[int, int, str, bool, datetime.datetime, datetime.datetime]:
        """
        Manually return the token information associated with the latest token
        associated with the given user_id, without using the DAO interface.

        Args:
            db: The database instance.
            user_id: The user id of the user.

        Returns:
            The tuple (id, user, token, revoked, expires_at, created_at) of the
            relevant token.
        """
        raise NotImplementedError

    @abstractmethod
    def exam_exists(self, 
        db: DataAccessObject, 
        username: str,
        name: str
    ) -> bool:
        """
        Return if an exam with the owner identified by the username with the
        exam name.

        Args:
            db: The database instance.
            username: The username of the owner.
            name: The name of the exam.
        """
        raise NotImplementedError

    @abstractmethod
    def is_favourited(self, 
        db: DataAccessObject, 
        user_id: int, 
        exam_id: int
    ) -> bool:
        """
        Return if the exam with exam_id is favourited by the user with user_id.

        Args:
            user_id: The id of the user.
            exam_id: The id of the exam.
        """
        raise NotImplementedError

    def user_password(self, db: DataAccessObject, user_id: int) -> str:
        """
        Return the (hashed) password of the user associated with the given user_id.

        Args:
            user_id: The id of the user.
        Returns:
            The (hashed) password of the user.
        """
        raise NotImplementedError
    
    def test_user_exists(self, db: DataAccessObject):
        self.add_user(db, "testuser", "test@example.com", "local")
        
        assert db.user_exists(username="testuser")
        assert db.user_exists(email="test@example.com")

        with pytest.raises(ValueError, 
                           match="At least one argument .* is required"):
            db.user_exists()

    @pytest.mark.parametrize("password,auth_provider", [
        ("password", "local"), 
        (None, "google")
    ])
    def test_add_user(self, db: DataAccessObject, password, auth_provider):
        assert not db.user_exists(username="testuser")
        assert not db.user_exists(email="test@example.com")

        user_id = db.add_user("testuser", 
                              "test@example.com", 
                              password, 
                              auth_provider)

        assert db.user_exists(username="testuser")
        assert db.user_exists(email="test@example.com")

    def test_add_user_invalid(self, db: DataAccessObject):
        with pytest.raises(DataError,
                           match="A password must be provided if "
                                 "auth_provider is 'google'."):
            db.add_user("testuser", "test@example.com", None, "local")

    def test_add_user_correct_id(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        assert self.get_last_user_id(db) == user_id

    def test_get_user_id(self, db: DataAccessObject):
        max_id = db.add_user("testuser",
                             "test@example.com",
                             "password",
                             "local")

        res = db.get_user(user_id=max_id)
        assert res is not None
        user_id = res[0]
        username, email, password, auth_provider = res[1:5]

        assert user_id == max_id
        assert username == "testuser"
        assert email == "test@example.com"
        assert password == "password"
        assert auth_provider == "local"

    def test_get_user_username(self, db: DataAccessObject):
        db.add_user("testuser", "test@example.com", "password", "local")

        res = db.get_user(username="testuser")
        assert res is not None
        username, email, password, auth_provider = res[1:5]

        assert username == "testuser"
        assert email == "test@example.com"
        assert password == "password"
        assert auth_provider == "local"

    def test_get_user_email(self, db: DataAccessObject):
        db.add_user("testuser", "test@example.com", "password", "local")

        res = db.get_user(email="test@example.com")
        assert res is not None
        username, email, password, auth_provider = res[1:5]

        assert username == "testuser"
        assert email == "test@example.com"
        assert password == "password"
        assert auth_provider == "local"

    def test_get_user_invalid(self, db: DataAccessObject):
        db.add_user("testuser", "test@example.com", "password", "local")

        with pytest.raises(ValueError, 
                           match="At least one argument .* is required"):
            db.get_user()

    def test_create_token(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                             "test@example.com",
                             "password",
                             "local")
        time = datetime.datetime.now() + datetime.timedelta(days=1)

        db.create_refresh_token(user_id, "token", time)

        res = self.get_token(db, user_id)
        assert res is not None
        
        token_id, user, token, revoked, expires_at, created_at = res

        assert user == user_id
        assert token == "token"
        assert datetime.datetime.fromisoformat(expires_at) == time

    def test_get_refresh_token(self, db: DataAccessObject):
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
        assert datetime.datetime.fromisoformat(expires_at) == time

        assert db.get_refresh_token("token", True) is None

    def test_get_refresh_token_none(self, db: DataAccessObject):
        assert db.get_refresh_token("token", True) is None
        assert db.get_refresh_token("token", False) is None

    def test_set_revoked_status(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        time = datetime.datetime.now() + datetime.timedelta(days=1)
        db.create_refresh_token(user_id, "token", time)

        assert db.get_refresh_token("token", False) is not None
        assert db.get_refresh_token("token", True) is None

        db.set_revoked_status("token", True)
        assert db.get_refresh_token("token", True) is not None
        assert db.get_refresh_token("token", False) is None

    def test_set_oauth_id(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        db.set_oauth_id(user_id, "testoauthid")

        user = db.get_user(user_id=user_id)

        assert user[5] == "testoauthid"

    def test_set_last_login(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        time = datetime.datetime.now()
        db.set_last_login("testuser", time)

        user = db.get_user(user_id=user_id)
        assert datetime.datetime.fromisoformat(user[-1]) == time

    def test_add_exam(self, db: DataAccessObject):
        assert not self.exam_exists(db, "testuser", "testexam")

        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        db.add_exam("testuser", "testexam", "#FFFFFF", "test", False)

        assert self.exam_exists(db, "testuser", "testexam")
        
    def test_get_exam(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = self.add_exam(db,
                                "testuser",
                                "testexam",
                                "#FFFFFF",
                                "test",
                                True)
        res = db.get_exam(exam_id)
        assert res is not None
        assert res[0] == exam_id
        assert res[1] == "testexam"
        assert res[3] == user_id
        assert res[4] == "#FFFFFF"
        assert res[5] == "test"
        assert res[6] == True
        assert res[7] == 0

        assert self.correct_exam(res[8])

    def test_add_favourites(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "testexam", "#FFFFFF", "test", False)
        db.add_favourite(user_id, exam_id)

        res = db.get_exam(exam_id)
        assert self.is_favourited(db, user_id, exam_id)
        assert res[7] == 1

    def test_remove_favourites(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "testexam", "#FFFFFF", "test", False)
        db.add_favourite(user_id, exam_id)
        db.remove_favourite(user_id, exam_id)

        res = db.get_exam(exam_id)
        assert not self.is_favourited(db, user_id, exam_id)
        assert res[7] == 0

    def test_get_exams(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "testexam", "#FFFFFF", "test", True)
        exam_id2 = db.add_exam("testuser", "testexam2", "#000000", "test", True)

        matches = db.get_exams(user_id, "N/A", "N/A", "", 100, 1)
        assert len(matches) == 2
        assert matches[0][0] == exam_id
        assert matches[1][0] == exam_id2

    def test_get_favourite_exams(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "testexam", "#FFFFFF", "test", True)
        exam_id2 = db.add_exam("testuser", "testexam2", "#000000", "test", True)
        db.add_favourite(user_id, exam_id)

        matches = db.get_exams(user_id, "N/A", "favourites", "", 100, 1)
        assert len(matches) == 1
        assert matches[0][0] == exam_id

    def test_get_my_exams(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        user_id2 = db.add_user("testuser2",
                               "test2@example.com",
                               "password",
                               "local")
        exam_id = db.add_exam("testuser", "testexam", "#FFFFFF", "test", True)
        exam_id2 = db.add_exam("testuser2", "testexam2", "#000000", "test", True)

        matches = db.get_exams(user_id, "N/A", "mine", "", 100, 1)
        assert len(matches) == 1
        assert matches[0][0] == exam_id

    def test_get_exams_title(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "abc", "#FFFFFF", "test", True)
        exam_id2 = db.add_exam("testuser", "def", "#000000", "test", True)

        matches = db.get_exams(user_id, "N/A", "N/A", "a", 100, 1)
        assert len(matches) == 1
        assert matches[0][0] == exam_id

    def test_delete_user(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        db.add_exam("testuser", "abc", "#FFFFFF", "test", True)

        db.delete_user_account(user_id)
        assert not db.user_exists("testuser")
        assert not self.exam_exists(db, "testuser", "abc")

    def test_update_user(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")
        exam_id = db.add_exam("testuser", "abc", "#FFFFFF", "test", True)

        db.update_username(user_id, "new_user")
        assert db.user_exists("new_user")
        assert not db.user_exists("testuser")
        assert self.exam_exists(db, "new_user", "abc")
        assert not self.exam_exists(db, "testuser", "abc")

    def test_update_password(self, db: DataAccessObject):
        user_id = db.add_user("testuser",
                              "test@example.com",
                              "password",
                              "local")

        db.update_password(user_id, "newpassword")
        assert self.user_password(db, user_id) == "newpassword"

    def test_delete_exam(self, db: DataAccessObject):
        db.add_user("testuser",
                    "test@example.com",
                    "password",
                    "local")
        exam_id = db.add_exam("testuser", "abc", "#FFFFFF", "test", True)
        exam_id2 = db.add_exam("testuser", "def", "#000000", "test", True)

        db.delete_exam(exam_id)
        assert db.user_exists("testuser")
        assert not self.exam_exists(db, "testuser", "abc")
        assert self.exam_exists(db, "testuser", "def")