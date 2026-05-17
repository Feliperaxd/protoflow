from sqlalchemy.exc import IntegrityError

from users.model import User
from users.schemas import UserAdminUpdate, UserCreate, UserUpdate
from utils.uid import UID
from utils.password import PasswordHash


class UserService:
    """Service layer for user management operations."""

    _UID_PREFIX = '<version>'
    _MAX_UID_RETRIES = 5

    def __init__(self, session):
        self.session = session

    # -------------------------
    # Public interface
    # -------------------------

    def create(self, data: UserCreate) -> User:
        """Validate, hash password, generate UID and persist a new user."""
        payload = self._build_payload(data)
        return self._persist_with_retry(payload)

    def update(self, uid: str, data: UserUpdate | UserAdminUpdate) -> User:
        ...

    def delete(self, uid: str) -> None:
        ...

    def ban(self, uid: str) -> None:
        ...
    
    def suspend(self, uid: str) -> None:
        ...

    # -------------------------
    # Private helpers
    # -------------------------

    def _build_payload(self, data: UserCreate) -> dict:
        """Serialize schema and replace plain password with its hash."""
        payload = data.model_dump()
        payload['password_hash'] = PasswordHash.get(
            payload.pop('password')
        )
        return payload

    def _persist_with_retry(self, payload: dict) -> User:
        """Attempt to persist a user, retrying only on UID collision."""
        for _ in range(self._MAX_UID_RETRIES):
            user = self._build_user(payload)

            if self._try_save(user):
                return user

        raise ValueError("Could not generate a unique UID after max retries.")

    def _build_user(self, payload: dict) -> User:
        """Instantiate a User with a freshly generated UID."""
        return User(
            uid=UID.generate(prefix=self._UID_PREFIX),
            **payload,
        )

    def _try_save(self, user: User) -> bool:
        """
        Try to commit a user to the database.

        Returns False only on UID collision.
        Re-raises IntegrityError for any other constraint violation.
        """
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return True

        except IntegrityError as e:
            self.session.rollback()

            if self._is_uid_collision(e):
                return False

            raise

    @staticmethod
    def _is_uid_collision(error: IntegrityError) -> bool:
        """Check whether an IntegrityError was caused by a UID conflict."""
        return "uid" in str(error.orig).lower()
