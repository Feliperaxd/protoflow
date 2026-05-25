from enum import Enum


class UserStatus(str, Enum):
    BANNED = 'banned'
    ACTIVE = 'active'
    DELETED = 'deleted'
    INACTIVE = 'inactive'
    SUSPENDED = 'suspended'

class UserRole(str, Enum):
    ADMIN = 'admin'
    CUSTOMER = 'customer'
    SUPPLIER = 'supplier'

class UserDocumentType(str, Enum):
    CPF = 'cpf'
    CNPJ = 'cnpj'
