from typing import Annotated, TypeAlias

from pydantic import BaseModel, BeforeValidator, EmailStr, field_validator
from pydantic_core.core_schema import ValidationInfo

from enums.user import UserDocumentType, UserRole
from utils.validators import Validators


CPF: TypeAlias = Annotated[str, BeforeValidator(Validators.cpf)]
CNPJ: TypeAlias = Annotated[str, BeforeValidator(Validators.cnpj)]
PHONE: TypeAlias = Annotated[str, BeforeValidator(Validators.phone)]


def validate_document_number(
    value: str | None,
    info: ValidationInfo,
) -> str | None:
    if value is None:
        return value

    document_type = info.data.get('document_type')

    if document_type == UserDocumentType.CPF:
        return Validators.cpf(value)

    if document_type == UserDocumentType.CNPJ:
        return Validators.cnpj(value)

    raise ValueError('Invalid document type!')


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    phone: PHONE
    document_type: UserDocumentType
    document_number: str

    @field_validator('document_number')
    @classmethod
    def _validate_document(cls, value, info):
        return validate_document_number(value, info)

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role: UserRole | None = None
    phone: PHONE | None = None
    document_type: UserDocumentType | None = None
    document_number: str | None = None

    @field_validator('document_number')
    @classmethod
    def _validate_document(cls, value, info):
        return validate_document_number(value, info)

FAZER A ROUTERS
