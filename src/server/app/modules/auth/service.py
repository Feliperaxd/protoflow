import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config.settings import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    SECRET_KEY,
)
from app.modules.auth.errors import (
    INVALID_CREDENTIALS,
    INVALID_REFRESH_TOKEN,
    TOKEN_EXPIRED,
)
from app.modules.auth.schemas import TokenResponse
from app.modules.refresh_tokens.model import RefreshToken
from app.modules.users.model import User
from app.services.base import BaseService
from app.utils.hashing import Hasher


class AuthService(BaseService):
    """Service layer for authentication operations."""

    def __init__(self, session, user_service=None) -> None:
        super().__init__(session)
        from app.modules.users.service import UserService
        self._user_service = user_service or UserService(session)

    # --- public ---

    def register(self, name: str, email: str, password: str) -> TokenResponse:
        """Create a new user and return access and refresh tokens.

        Args:
            name (str): The user's name.
            email (str): The user's email.
            password (str): The plain-text password.

        Raises:
            AppError: If the email is already registered.

        Returns:
            TokenResponse: The access and refresh tokens.
        """
        from app.modules.users.schemas import UserCreate

        user = self._user_service.create(UserCreate(
            name=name,
            email=email,
            password=password,
        ))

        return self._generate_tokens(user.id)

    def login(self, email: str, password: str) -> TokenResponse:
        """Validate credentials and return access and refresh tokens.

        Args:
            email (str): The user's email.
            password (str): The plain-text password.

        Raises:
            AppError: If credentials are invalid.

        Returns:
            TokenResponse: The access and refresh tokens.
        """
        user = self.session.query(User).filter_by(email=email).first()
        if not user or not Hasher.check_password(password, user.password_hash):
            raise INVALID_CREDENTIALS

        return self._generate_tokens(user.id)

    def refresh(self, raw_token: str) -> TokenResponse:
        """Validate refresh token and return new tokens.

        Args:
            raw_token (str): The raw refresh token.

        Raises:
            AppError: If the token is invalid, expired or revoked.

        Returns:
            TokenResponse: New access and refresh tokens.
        """
        token_hash = Hasher.digest(raw_token)
        stored = self.session.query(RefreshToken).filter_by(
            token_hash=token_hash
        ).first()

        if not stored or stored.revoked_at:
            raise INVALID_REFRESH_TOKEN

        now = datetime.now(timezone.utc)
        if stored.expires_at < now:
            raise TOKEN_EXPIRED

        stored.revoked_at = now
        self.session.commit()

        return self._generate_tokens(stored.user_id)

    def logout(self, raw_token: str) -> None:
        """Revoke a refresh token.

        Args:
            raw_token (str): The raw refresh token to revoke.

        Raises:
            AppError: If the token is invalid or already revoked.
        """
        token_hash = Hasher.digest(raw_token)
        stored = self.session.query(RefreshToken).filter_by(
            token_hash=token_hash
        ).first()

        if not stored or stored.revoked_at:
            raise INVALID_REFRESH_TOKEN

        stored.revoked_at = datetime.now(timezone.utc)
        self.session.commit()

    # --- private ---

    def _generate_tokens(self, user_id: int) -> TokenResponse:
        """Generate and store access and refresh tokens for a user."""
        access_token = self._create_access_token(user_id)
        refresh_token, refresh_token_hash = self._create_refresh_token()
        self._store_refresh_token(user_id, refresh_token_hash)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    def _create_access_token(self, user_id: int) -> str:
        """Generate a signed JWT access token."""
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = {'sub': str(user_id), 'exp': expire}
        return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

    def _create_refresh_token(self) -> tuple[str, str]:
        """Generate a random refresh token and its hash."""
        raw = secrets.token_urlsafe(64)
        return raw, Hasher.digest(raw)

    def _store_refresh_token(self, user_id: int, token_hash: str) -> None:
        """Persist a refresh token to the database."""
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
        instance = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.session.add(instance)
        self.session.commit()
        