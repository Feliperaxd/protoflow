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
from app.utils.password import PasswordHash

_UNIQUE_CONSTRAINTS = {
    'ix_users_email': EMAIL_ALREADY_REGISTERED,
    'ix_users_phone': PHONE_ALREADY_REGISTERED,
    'ix_users_document_number': DOCUMENT_ALREADY_REGISTERED,
}


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
        return self._persist_with_uid_retry(payload)

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

    def _build_user(self, payload: dict) -> User:
        """Instantiate a User with a freshly generated UID."""
        return User(
            uid=UID.generate(prefix=self._UID_PREFIX),
            **payload,
        )

    """
    Para criar o usuario
    1 - arrumar o payload, já criando o UID
    2 - usa o try save
    """
    #ARRUMAR ISSO TA RUIM, CLAUDE NAO SABE O Q TA FAZENDO< NAO ESTA SEMANTICO
    def _persist_with_uid_retry(self, payload: dict) -> User:
        """
        Persist a user, retrying with a new UID on collision.

        - On success: returns the saved User.
        - On duplicate email/phone/document: raises AppError immediately.
        - On UID collision: generates a new UID and retries.
        - After max retries: raises UID_GENERATION_FAILED.
        """
        for _ in range(self._MAX_UID_RETRIES):
            user = self._build_user(payload)

            try:
                self.session.add(user)
                self.session.commit()
                self.session.refresh(user)
                return user  # sucesso — sai aqui

            except IntegrityError as e:
                self.session.rollback()
                error_str = str(e.orig).lower()

                # erro conhecido (email, phone, document) — volta pro front
                for constraint, app_error in _UNIQUE_CONSTRAINTS.items():
                    if constraint in error_str:
                        raise app_error from e

                # colisão de UID — tenta de novo com um novo UID
                if 'ix_users_uid' in error_str or '"uid"' in error_str:
                    continue

                # erro desconhecido — relança
                raise

        raise UID_GENERATION_FAILED
