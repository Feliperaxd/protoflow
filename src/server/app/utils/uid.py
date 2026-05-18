import secrets
import string


class UID:
    _CHARS = string.ascii_uppercase + string.digits

    @staticmethod
    def generate(
        prefix: str | None = None,
        left_size: int = 2,
        right_size: int = 3,
    ) -> str:
        """
        Generate a random public UID.

        Keyword Args:
            prefix (str | None): Optional UID prefix.
            left_size (int): Characters before the dash.
            right_size (int): Characters after the dash.

        Returns:
            str: Generated UID.
        """

        left = ''.join(
            secrets.choice(UID._CHARS)
            for _ in range(left_size)
        )
        right = ''.join(
            secrets.choice(UID._CHARS)
            for _ in range(right_size)
        )

        uid = f'{left}-{right}'

        if prefix:
            return f'{prefix}-{uid}'

        return uid
