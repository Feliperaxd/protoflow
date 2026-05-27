from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.base import BaseService
    from app.utils.exceptions import AppError


class StatusMixin:
    """Mixin for services that manage models with a status field.

    Requires BaseService to be in the MRO.
    """

    _ALREADY_DELETED_ERROR: AppError | None = None

    def _ensure_not_deleted(self: BaseService, model, id: int) -> None:
        """Raise AppError if the instance has been deleted."""
        instance = self._load_one(model, id=id)
        if instance.status.value == 'DELETED':
            raise self._ALREADY_DELETED_ERROR

    def _set_status(self: BaseService, model, id: int, status) -> None:
        """Update the status field of any model instance."""
        instance = self._load_one(model, id=id)
        instance.status = status
        self._try_commit(instance)


class TimestampMixin:
    """Mixin for services that manage timestamp fields.

    Requires BaseService to be in the MRO.
    """

    def _set_timestamp(
        self: BaseService,
        model,
        id: int,
        field: str,
    ) -> None:
        """Update a timestamp field of any model instance."""
        instance = self._load_one(model, id=id)
        if not hasattr(instance, field):
            raise AttributeError(
                f'{model.__name__} does not have a {field} field.'
            )
        setattr(instance, field, datetime.now(UTC))
        self._try_commit(instance)
        