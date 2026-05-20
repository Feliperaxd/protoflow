from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.utils.exceptions import AppError


class BaseService:
    """Base service with common database operations."""

    _UNIQUE_CONSTRAINTS: dict[str, AppError] = {}

    def __init__(self, session: Session) -> None:
        self.session = session

    def _try_commit(self, instance) -> object | None:
        """Persist any pending changes to the database.

        - On success: returns the saved instance.
        - On known unique constraint: raises the corresponding AppError.
        - On UID collision: returns None to signal a retry is needed.

        Args:
            instance: The model instance to persist.

        Raises:
            AppError: If a unique constraint is violated.

        Returns:
            object: The persisted instance, refreshed from the database.
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
