import os

from cryptography.fernet import Fernet, InvalidToken

from app.config.settings import ENCRYPTION_KEY


class Encryptor:
    """Symmetric encryption using Fernet (AES-128-CBC + HMAC)."""

    def __init__(self) -> None:
        self._fernet = Fernet(self._load_key())

    def encrypt(self, value: str) -> str:
        """Encrypt a string and return the token."""
        return self._fernet.encrypt(value.encode('utf-8')).decode('utf-8')

    def decrypt(self, token: str) -> str:
        """Decrypt a token and return the original value.

        Raises:
            ValueError: If the token is invalid or corrupted.
        """
        try:
            return self._fernet.decrypt(
                token.encode('utf-8')
            ).decode('utf-8')
        except InvalidToken as e:
            raise ValueError('Invalid or corrupted token.') from e

    @staticmethod
    def _load_key() -> bytes:
        """Load the encryption key from environment variables."""
        if not ENCRYPTION_KEY:
            raise EnvironmentError(
                'ENCRYPTION_KEY is not defined in environment variables.'
            )
        return ENCRYPTION_KEY.encode()
