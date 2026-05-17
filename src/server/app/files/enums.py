from enum import Enum


class FileStatus(str, Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
