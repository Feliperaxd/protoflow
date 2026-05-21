import bcrypt
import hashlib


class Hasher:
    """Utility class for hashing and verifying values."""

    @staticmethod
    def hash_password(password: str, rounds: int = 12) -> str:
        """Generate a bcrypt hash for the given password.

        Args:
            password (str): The plain-text password to hash.
            rounds (int): The bcrypt cost factor. Defaults to 12.

        Raises:
            ValueError: If the password is empty.

        Returns:
            str: The bcrypt hash.
        """
        if not password:
            raise ValueError('Password cannot be empty.')

        salt = bcrypt.gensalt(rounds=rounds)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def check_password(password: str, hashed: str) -> bool:
        """Verify whether a plain-text password matches a bcrypt hash.

        Args:
            password (str): The plain-text password to check.
            hashed (str): The bcrypt hash to compare against.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    @staticmethod
    def digest(value: str) -> str:
        """Generate a deterministic SHA-256 hash for the given value.

        Unlike hash_password(), always produces the same output for the same
        input. Use for searchable or comparable fields like document numbers.

        Args:
            value (str): The value to hash.

        Returns:
            str: The SHA-256 hex digest.
        """
        return hashlib.sha256(value.encode('utf-8')).hexdigest()
