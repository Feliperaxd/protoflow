from enum import Enum


class FileStatus(str, Enum):
    ACTIVE = 'active'
    DELETED = 'deleted'
    INACTIVE = 'inactive'
