from datetime import datetime
from typing import Annotated, TypeAlias

from pydantic import BaseModel, BeforeValidator, EmailStr, field_validator
from pydantic_core.core_schema import ValidationInfo

from app.modules.users.enums import UserDocumentType, UserRole, UserStatus
from app.utils.validators import Validators


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
    phone: PHONE
    email: EmailStr
    password: str
    document_type: UserDocumentType
    document_number: str
    role: UserRole
    bio: str

    @field_validator('phone')
    @classmethod
    def _validate_phone(cls, value):
        return Validators.phone(value)

    @field_validator('document_number')
    @classmethod
    def _validate_document(cls, value, info):
        return validate_document_number(value, info)

class UserUpdate(BaseModel):
    name: str | None = None
    phone: PHONE | None = None
    bio: str | None = None

    @field_validator('phone')
    @classmethod
    def _validate_phone(cls, value):
        if value is None:
            return value

        return Validators.phone(value)

class UserAdminUpdate(BaseModel):
    role: UserRole | None = None
    status: UserStatus | None = None
    internal_note: str | None = None

class UserEmailVerification(BaseModel):
    email_verified_at: datetime


class UserTermsAcceptance(BaseModel):
    terms_accepted_at: datetime


class UserLoginUpdate(BaseModel):
    last_login_at: datetime
