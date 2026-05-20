import bcrypt


class Hasher:
    """Utility class for hashing and verifying passwords using bcrypt."""

    @staticmethod
    def generate(password: str) -> str:
        """Generate a bcrypt hash for the given password."""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify(password: str, hashed: str) -> bool:
        """Check whether a plain-text password matches a bcrypt hash."""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    