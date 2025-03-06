import pytest

from abc import ABC, abstractmethod
import datetime

from backend.database import DataAccessObject, DataError, DatabaseError

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
    def get_last_user_id(self, db: DataAccessObject) -> int:
        """
        Manually return the user id of the last inserted user without
        using the DAO interface.

        Args:
            db: The database instance.
        Returns:

        """
        raise NotImplementedError

    @abstractmethod
    def get_token(self, db: DataAccessObject, user_id: str) -> str:
        """
        Manually return the token information associated with the latest token
        associated with the given user_id, without using the DAO interface.

        Args:
            db: The database instance.
            user_id: The user id of the user.
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

