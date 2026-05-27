from sqlalchemy.exc import IntegrityError

from app.modules.users.enums import UserStatus
from app.modules.users.errors import (
    DOCUMENT_ALREADY_REGISTERED,
    EMAIL_ALREADY_REGISTERED,
    UID_GENERATION_FAILED,
    USER_ALREADY_DELETED,
    USER_NOT_FOUND,
)
from app.modules.users.model import User
from app.modules.users.schemas import (
    UserCreate,
    UserFullResponse,
    UserFullUpdate,
    UserPublicResponse,
    UserPublicUpdate,
)
from app.services.base import BaseService
from app.services.mixins import StatusMixin, TimestampMixin
from app.utils.encryption import Encryptor
from app.utils.exceptions import AppError
from app.utils.hashing import Hasher
from app.utils.uid import UID


class UserService(BaseService, StatusMixin, TimestampMixin):
    """Service layer for user management operations."""

    _UID_PREFIX: str = '<version>'
    _MAX_UID_RETRIES: int = 5
    
    _ALREADY_DELETED_ERROR: AppError = USER_ALREADY_DELETED
    _NOT_FOUND_ERROR: AppError = USER_NOT_FOUND
    _UNIQUE_ERRORS: dict[str, AppError] = {
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

    def get_public(self, **filters) -> User:
        """Fetch a public user data by any filter (id, uid, email)."""
        return self._build_public_response(self._load_one(User, **filters))

    def get_full(self, **filters) -> UserFullResponse:
        """Fetch a full user data by any filter (id, uid, email)."""
        return self._build_full_response(self._load_one(User, **filters))

    def update(self, id: int, data: UserFullUpdate | UserPublicUpdate) -> User:
        """Fetch a user by ID, apply changes and persist.

        Args:
            id (int): The user's internal database ID.
            data (UserUpdate | UserAdminUpdate): The validated schema with fields to update.

        Raises:
            AppError: If the user is not found.
            AppError: If email, phone or document number is already registered.

        Returns:
            User: The updated user, refreshed from the database.
        """
        user = self._load_one(User, id=id)
        payload = self._build_payload(data, exclude_unset=True)
        return self._update_fields(user, payload)

    def delete(self, id: int) -> None:
        """Soft delete a user by setting their status to DELETED."""
        self._set_status(User, id, UserStatus.DELETED)

    def ban(self, id: int) -> None:
        """Ban a user by setting their status to BANNED."""
        self._ensure_not_deleted(id)
        self._set_status(User, id, UserStatus.BANNED)

    def suspend(self, id: int) -> None:
        """Suspend a user by setting their status to SUSPENDED."""
        self._ensure_not_deleted(id)
        self._set_status(User, id, UserStatus.SUSPENDED)

    def activate(self, id: int) -> None:
        """Activate a user by setting their status to ACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(User, id, UserStatus.ACTIVE)

    def deactivate(self, id: int) -> None:
        """Deactivate a user by setting their status to INACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(User, id, UserStatus.INACTIVE)

    def verify_email(self, id: int) -> None:
        """Set the email verification timestamp."""
        self._ensure_not_deleted(id)
        self._set_timestamp(User, id, 'email_verified_at')

    def accept_terms(self, id: int) -> None:
        """Set the terms acceptance timestamp."""
        self._ensure_not_deleted(id)
        self._set_timestamp(User, id, 'terms_accepted_at')

    def record_login(self, id: int) -> None:
        """Set the last login timestamp."""
        self._ensure_not_deleted(id)
        self._set_timestamp(User, id, 'last_login_at')

    def _build_payload(
        self,
        data: UserCreate | UserFullUpdate | UserPublicUpdate,
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

    def _build_public_response(self, user: User) -> UserPublicResponse:
        """Build public response, decrypting sensitive fields."""
        data = user.__dict__.copy()

        if user.document_number:
            data['document_number'] = self._encryptor.decrypt(
                user.document_number
            )

        return UserPublicResponse(**data)

    def _build_full_response(self, user: User) -> UserFullResponse:
        """Build full response, decrypting sensitive fields."""
        data = user.__dict__.copy()

        if user.document_number:
            data['document_number'] = self._encryptor.decrypt(
                user.document_number
            )

        return UserFullResponse(**data)
