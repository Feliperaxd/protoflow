from enum import Enum


class UserStatu(str, Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    BANNED = 'banned'

class UserRole(str, Enum):
    ADMIN = 'admin'
    CUSTOMER = 'customer'
    SUPPLIER = 'supplier'

class UserDocumentType(str, Enum):
    CPF = 'cpf'
    CNPJ = 'cnpj'
