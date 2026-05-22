from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.utils.exceptions import AppError


class BaseService:
    """Base service with common database operations.

    Subclasses should override class attributes to configure behaviour:

        _UNIQUE_ERRORS: maps database constraint names to the AppError
            that should be raised when that constraint is violated.
        _NOT_FOUND_ERROR: the AppError raised when _load() finds no record.
    """

    _UNIQUE_ERRORS: dict[str, AppError] = {}
    _NOT_FOUND_ERROR: AppError | None = None

    def __init__(self, session: Session) -> None:
        self.session = session

    def _load_one(self, model, **filters) -> object:
        """Fetch a single record by filters or raise if not found.

        Args:
            model: The SQLAlchemy model class to query.
            **filters: Column filters passed to filter_by (e.g. uid='abc').

        Raises:
            AppError: If no record matches the given filters.

        Returns:
            object: The matching model instance.
        """
        instance = self.session.query(model).filter_by(**filters).first()
        if not instance:
            raise self._NOT_FOUND_ERROR
        return instance

    def _load_all(self, model) -> list:
        """Fetch all records of a model.

        Args:
            model: The SQLAlchemy model class to query.

        Returns:
            list: All records of the given model.
        """
        return self.session.query(model).all()

    def _exists(self, model, **filters) -> bool:
        """Check whether a record matching the filters exists.

        Args:
            model: The SQLAlchemy model class to query.
            **filters: Column filters passed to filter_by (e.g. email='a@b.com').

        Returns:
            bool: True if a matching record exists, False otherwise.
        """
        return self.session.query(model).filter_by(**filters).first() is not None

    def _update_fields(self, instance, payload: dict) -> object:
        """Apply a dict of fields to an instance and commit.

        Args:
            instance: The model instance to update.
            payload (dict): Field names and values to apply.

        Raises:
            AppError: If a known unique constraint is violated.
            IntegrityError: If an unexpected constraint is violated.

        Returns:
            object: The updated instance, refreshed from the database.
        """
        for field, value in payload.items():
            setattr(instance, field, value)
        return self._try_commit(instance)

    def _delete(self, instance) -> None:
        """Remove a record from the database.

        Args:
            instance: The model instance to delete.
        """
        self.session.delete(instance)
        self.session.commit()

    def _try_commit(self, instance) -> object:
        """Persist any pending changes to the database.

        - On success: returns the saved instance.
        - On known unique constraint: raises the corresponding AppError.
        - On unknown constraint violation: re-raises the original IntegrityError.

        Args:
            instance: The model instance to persist.

        Raises:
            AppError: If a known unique constraint is violated.
            IntegrityError: If an unexpected constraint is violated.

        Returns:
            object: The persisted instance, refreshed from the database.
        """
        try:
            self.session.add(instance)
            self.session.commit()
            self.session.refresh(instance)
            return instance

        except IntegrityError as e:
            self.session.rollback()
            error = str(e.orig).lower()

            for constraint, app_error in self._UNIQUE_ERRORS.items():
                if constraint in error:
                    raise app_error from e

            raise
