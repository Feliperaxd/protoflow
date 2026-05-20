from sqlalchemy.exc import IntegrityError

from app.modules.users.errors import (
    DOCUMENT_ALREADY_REGISTERED,
    EMAIL_ALREADY_REGISTERED,
    PHONE_ALREADY_REGISTERED,
    UID_GENERATION_FAILED,
)
from app.modules.users.model import User
from app.modules.users.schemas import UserAdminUpdate, UserCreate, UserUpdate
from app.utils.uid import UID
from app.utils.encryption import Encryptor
from app.utils.hashing import Hasher


class UserService:
    """Service layer for user management operations."""

    _UID_PREFIX = '<version>'
    _MAX_UID_RETRIES = 5    
    _UNIQUE_CONSTRAINTS = {
        'ix_users_email': EMAIL_ALREADY_REGISTERED,
        'ix_users_phone': PHONE_ALREADY_REGISTERED,
        'ix_users_document_number': DOCUMENT_ALREADY_REGISTERED,
    }

    def __init__(self, session):
        self.session = session
        self._encryptor = Encryptor()

    def create(self, data: UserCreate) -> User:
        """Validate, encrypt sensitive fields, hash password and persist a new user.

        Raises:
            AppError: If email, phone or document number is already registered.
            AppError: If a unique UID could not be generated after max retries.
        """
        payload = self._build_payload(data)

        for _ in range(self._MAX_UID_RETRIES):
            user = self._try_save(self._build_user(payload))
            if user: return user
            
        raise UID_GENERATION_FAILED        
        
    def update(self, uid: str, data: UserUpdate | UserAdminUpdate) -> User:
        ...

    def delete(self, uid: str) -> None:
        ...

    def ban(self, uid: str) -> None:
        ...

    def suspend(self, uid: str) -> None:
        ...

    def _build_payload(self, data: UserCreate) -> dict:
        """Serialize schema and encrypt sensitive fields."""
        payload = data.model_dump()

        payload['password_hash'] = Hasher.generate(payload.pop('password'))
        document_number = payload.get('document_number')
        if document_number is not None:
            payload['document_number'] = self._encryptor.encrypt(document_number)
        
        return payload

    def _build_user(self, payload: dict) -> User:
        """Instantiate a User with a freshly generated UID."""
        return User(
            uid=UID.generate(prefix=self._UID_PREFIX),
            **payload,
        )

    def _try_save(self, user: User) -> User:
        """Persist a user, raising AppError on constraint violations.

        - On success: returns the saved User.
        - On duplicate email, phone or document: raises the corresponding AppError.
        - On UID collision: returns None to signal a retry is needed.

        Raises:
            AppError: If a unique constraint on email, phone or document is violated.
        """
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user

        except IntegrityError as e:
            self.session.rollback()
            error = str(e.orig).lower()

            for constraint, app_error in self._UNIQUE_CONSTRAINTS.items():
                if constraint in error:
                    raise app_error from e

            if 'ix_users_uid' in error or '"uid"' in error:
                return None

            raise
