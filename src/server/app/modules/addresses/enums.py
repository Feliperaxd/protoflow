from enum import Enum


class AddressStatus(str, Enum):
    ACTIVE = 'ACTIVE'
    DELETED = 'DELETED'
    INACTIVE = 'INACTIVE'
