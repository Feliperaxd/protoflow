import enum

# === User ===
class UserStatus(enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    SUSPENDED = 'suspended'

class UserDocumentType(enum.Enum):
    CPF = 'cpf'
    CNPJ = 'cnpj'

class FileStatus(enum.Enum):
    ACTIVE = 'active'
    INACTIVE = 'inactive'
