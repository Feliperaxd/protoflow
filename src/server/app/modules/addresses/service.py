from app.modules.addresses.enums import AddressStatus
from app.modules.addresses.errors import (
    ADDRESS_ALREADY_DELETED,
    ADDRESS_NOT_FOUND,
)
from app.modules.addresses.model import Address
from app.modules.addresses.schemas import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
)
from app.services.base import BaseService
from app.services.mixins import StatusMixin
from app.utils.exceptions import AppError


class AddressService(BaseService, StatusMixin):
    """Service layer for address management operations."""

    _NOT_FOUND_ERROR: AppError = ADDRESS_NOT_FOUND
    _ALREADY_DELETED_ERROR: AppError = ADDRESS_ALREADY_DELETED

    def create(
        self,
        user_id: int,
        data: AddressCreate,
    ) -> AddressResponse:
        """Validate and persist a new address.

        Args:
            user_id (int): The user's internal database ID.
            data (AddressCreate): The validated schema with address data.

        Returns:
            AddressResponse: The persisted address.
        """
        payload = data.model_dump()
        payload['user_id'] = user_id
        instance = Address(**payload)
        return AddressResponse.model_validate(
            self._try_commit(instance)
        )

    def get(self, id: int) -> AddressResponse:
        """Fetch an address by internal ID."""
        return AddressResponse.model_validate(
            self._load_one(Address, id=id)
        )

    def get_by_user(self, user_id: int) -> list[AddressResponse]:
        """Fetch all addresses for a user."""
        instances = self._load_all_by(Address, user_id=user_id)
        return [AddressResponse.model_validate(a) for a in instances]

    def update(self, id: int, data: AddressUpdate) -> AddressResponse:
        """Fetch an address by ID, apply changes and persist.

        Args:
            id (int): The address internal database ID.
            data (AddressUpdate): The validated schema with fields to update.

        Raises:
            AppError: If the address is not found.

        Returns:
            AddressResponse: The updated address.
        """
        self._ensure_not_deleted(id)
        address = self._load_one(Address, id=id)
        payload = data.model_dump(exclude_unset=True)
        return AddressResponse.model_validate(
            self._update_fields(address, payload)
        )

    def delete(self, id: int) -> None:
        """Soft delete an address by setting its status to DELETED."""
        self._ensure_not_deleted(id)
        self._set_status(Address, id, AddressStatus.DELETED)

    def activate(self, id: int) -> None:
        """Activate an address by setting its status to ACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(Address, id, AddressStatus.ACTIVE)

    def deactivate(self, id: int) -> None:
        """Deactivate an address by setting its status to INACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(Address, id, AddressStatus.INACTIVE)
