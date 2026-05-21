from sqlalchemy.exc import IntegrityError

from app.modules.users.errors import (
    DOCUMENT_ALREADY_REGISTERED,
    EMAIL_ALREADY_REGISTERED,
    PHONE_ALREADY_REGISTERED,
    UID_GENERATION_FAILED,
    USER_NOT_FOUND
)
from app.utils.uid import UID
from app.utils.hashing import Hasher
from app.modules.users.model import User
from app.services.base import BaseService
from app.utils.encryption import Encryptor
from app.utils.exceptions import AppError
from app.modules.users.schemas import UserAdminUpdate, UserCreate, UserUpdate


class UserService(BaseService):
    """Service layer for user management operations."""

    _UID_PREFIX: str = '<version>'
    _MAX_UID_RETRIES: int = 5
    _NOT_FOUND_ERROR: AppError = USER_NOT_FOUND
    _CONSTRAINT_ERROR_MAP: dict[str, AppError] = {
        'ix_users_email': EMAIL_ALREADY_REGISTERED,
        'users_document_number_hash_key': DOCUMENT_ALREADY_REGISTERED,
    }

    def __init__(self, session):
        self.session = session
        self._encryptor = Encryptor()

    def create(self, data: UserCreate) -> User:
        """Validate, encrypt sensitive fields, hash password and persist a new user.

        - On success: returns the saved User.
        - On UID collision: retries up to _MAX_UID_RETRIES times with a new UID.
        - On duplicate email, phone or document: raises the corresponding AppError.
        - On max retries exceeded: raises UID_GENERATION_FAILED.

        Args:
            data (UserCreate): The validated schema with user data.

        Raises:
            AppError: If email, phone or document number is already registered.
            AppError: If a unique UID could not be generated after max retries.

        Returns:
            User: The persisted user, refreshed from the database.
        """
        payload = self._build_payload(data)

        for _ in range(self._MAX_UID_RETRIES):
            try:
                return self._try_commit(self._build_user(payload))
            except IntegrityError as e:
                if 'users_uid_key' not in str(e.orig).lower():
                    raise
                continue

        raise UID_GENERATION_FAILED

    def update(
        self,
        id: int,
        data: UserUpdate | UserAdminUpdate
    ) -> User:

        user = self._load_one()


    def delete(self, uid: str) -> None:
        ...

    def ban(self, uid: str) -> None:
        ...

    def suspend(self, uid: str) -> None:
        ...

    def _build_payload(
        self,
        data: UserCreate | UserUpdate | UserAdminUpdate,
        *,
        exclude_unset: bool = False,
    ) -> dict:
        """Serialize schema, hash password and encrypt sensitive fields if present."""
        payload = data.model_dump(exclude_unset=exclude_unset)
        doc_number = payload.get('document_number')

        if 'password' in payload:
            payload['password_hash'] = Hasher.hash_password(payload.pop('password'))

        if 'document_number' in payload and doc_number is not None:
            payload['document_number'] = self._encryptor.encrypt(doc_number)
            payload['document_number_hash'] = Hasher.digest(doc_number)

        return payload

    def _build_user(self, payload: dict) -> User:
        """Instantiate a User with a freshly generated UID."""
        return User(
            uid=UID.generate(prefix=self._UID_PREFIX),
            **payload,
        )

