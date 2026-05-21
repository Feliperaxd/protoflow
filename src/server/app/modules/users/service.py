from sqlalchemy.exc import IntegrityError

from app.modules.users.errors import (
    DOCUMENT_ALREADY_REGISTERED,
    EMAIL_ALREADY_REGISTERED,
    PHONE_ALREADY_REGISTERED,
    UID_GENERATION_FAILED,
)
from app.utils.uid import UID
from app.utils.hashing import Hasher
from app.modules.users.model import User
from app.utils.encryption import Encryptor
from app.modules.users.schemas import UserAdminUpdate, UserCreate, UserUpdate



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
             
             USAR ESSE TRY AQUI MAS DAI TEM QUE COLOCAR TBM QUE SE TIVER ix_users_UId
               for _ in range(self._MAX_UID_RETRIES):
            try:
                return self._try_commit(self._build_user(payload))
            except IntegrityError:
                continue
        raise UID_GENERATION_FAILED

    def update(
        self,
        uid: str,
        data: UserUpdate | UserAdminUpdate
    ) -> User:
        """Find user by UID, apply changes and persist.

        Raises:
            AppError: If user is not found.
            AppError: If email, phone or document number is already registered.
        """
        user = self._get_by_uid(uid)
        payload = self._build_payload(data, exclude_unset=True)

        for field, value in payload.items():
            setattr(user, field, value)

        return self._try_update(user)


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

        if 'password' in payload:
            payload['password_hash'] = Hasher.generate(payload.pop('password'))

        if 'document_number' in payload and payload['document_number'] is not None:
            payload['document_number'] = self._encryptor.encrypt(payload['document_number'])

        return payload

    def _build_user(self, payload: dict) -> User:
        """Instantiate a User with a freshly generated UID."""
        return User(
            uid=UID.generate(prefix=self._UID_PREFIX),
            **payload,
        )
    TROCAR O TRY COMMIT PARA O BASE
    def _try_commit(self, instance: User) -> User | None:
        """Persist any pending changes to the database.

        - On success: returns the saved instance.
        - On duplicate email, phone or document: raises the corresponding AppError.
        - On UID collision: returns None to signal a retry is needed.

        Args:
            instance (User): The model instance to persist.

        Raises:
            AppError: If a unique constraint on email, phone or document is violated.

        Returns:
            User: The persisted instance, refreshed from the database.
            None: If a UID collision occurred, signaling a retry is needed.
        """
        try:
            self.session.add(instance)
            self.session.commit()
            self.session.refresh(instance)
            return instance

        except IntegrityError as e:
            self.session.rollback()
            error = str(e.orig).lower()

            for constraint, app_error in self._UNIQUE_CONSTRAINTS.items():
                if constraint in error:
                    raise app_error from e

            if 'ix_users_uid' in error or '"uid"' in error:
                return None

            raise
