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
    value: str,
    info: ValidationInfo,
) -> str:
    document_type = info.data.get('document_type')

    if document_type == UserDocumentType.CPF:
        return Validators.cpf(value)

    if document_type == UserDocumentType.CNPJ:
        return Validators.cnpj(value)

    raise ValueError('Invalid document type!')

class UserBase(BaseModel):
    @field_validator('phone', check_fields=False)
    @classmethod
    def _validate_phone(cls, value):
        if value is None:
            return value
        return Validators.phone(value)

    @field_validator('document_number', check_fields=False)
    @classmethod
    def _validate_document(cls, value, info):
        if value is None:
            return value
        return validate_document_number(value, info)


class UserCreate(UserBase):
    name: str
    phone: PHONE | None
    email: EmailStr
    password: str
    document_type: UserDocumentType | None
    document_number: str | None
    role: UserRole
    bio: str | None


class UserUpdate(UserBase):
    name: str | None = None
    phone: PHONE | None = None
    bio: str | None = None


class UserAdminUpdate(UserBase):
    name: str | None = None
    phone: PHONE | None = None
    email: EmailStr | None = None
    avatar_url_id: int | None = None
    document_type: UserDocumentType | None = None
    document_number: str | None = None
    bio: str | None = None
    internal_note: str | None = None
    status: UserStatus | None = None
    role: UserRole | None = None


class UserEmailVerification(BaseModel):
    email_verified_at: datetime


class UserTermsAcceptance(BaseModel):
    terms_accepted_at: datetime


class UserLoginUpdate(BaseModel):
    last_login_at: datetime
