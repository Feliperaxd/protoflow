import bcrypt


class PasswordHash:
    """Utility class for hashing and verifying passwords using bcrypt."""

    @staticmethod
    def get(password: str) -> bytes:
        """Generate a bcrypt hash for the given password."""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt)

    @staticmethod
    def check(password: str, hashed: bytes) -> bool:
        """Check whether a plain-text password matches a bcrypt hash."""
        return bcrypt.checkpw(password.encode('utf-8'), hashed)
    