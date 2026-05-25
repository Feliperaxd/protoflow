from __future__ import annotations
from datetime import datetime, UTC
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.services.base import BaseService


class StatusMixin:
    """Mixin for services that manage models with a status field.
    
    Requires BaseService to be in the MRO.
    """

    def _set_status(self: BaseService, model, id: int, status) -> None:
        instance = self._load_one(model, id=id)
        instance.status = status
        self._try_commit(instance)

class TimestampMixin:
    """Mixin for services that manage timestamp fields."""

    def _set_timestamp(self: BaseService, model, id: int, field: str) -> None:
        instance = self._load_one(model, id=id)
        if not hasattr(instance, field):
            raise AttributeError(f'{model.__name__} does not have a {field} field.')
        setattr(instance, field, datetime.now(UTC))
        self._try_commit(instance)
        