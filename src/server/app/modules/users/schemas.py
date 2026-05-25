from datetime import datetime
from typing import Annotated

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    field_validator,
    model_validator,
)
from pydantic_core.core_schema import ValidationInfo

from app.modules.users.enums import UserDocumentType, UserRole, UserStatus
from app.utils.validators import Validators


def validate_document_number(
    value: str,
    info: ValidationInfo,
) -> str:
    document_type = info.data.get('document_type')

    if document_type == UserDocumentType.CPF:
        return Validators.cpf(value)

    if document_type == UserDocumentType.CNPJ:
        return Validators.cnpj(value)

    raise ValueError('Invalid document type.')


class UserBase(BaseModel):

    @field_validator('phone', check_fields=False)
    @classmethod
    def _validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return Validators.phone(value)

    @field_validator('document_number', check_fields=False)
    @classmethod
    def _validate_document(
        cls,
        value: str | None,
        info: ValidationInfo,
    ) -> str | None:
        if value is None:
            return value
        return validate_document_number(value, info)


class UserCreate(UserBase):
    name: str
    phone: str | None
    email: EmailStr
    password: str
    document_type: UserDocumentType | None
    document_number: str | None
    role: UserRole
    bio: str | None


class UserPublicUpdate(UserBase):
    name: str | None = None
    phone: str | None = None
    bio: str | None = None


class UserFullUpdate(UserBase):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    avatar_url_id: int | None = None
    document_type: UserDocumentType | None = None
    document_number: str | None = None
    bio: str | None = None
    internal_note: str | None = None
    status: UserStatus | None = None
    role: UserRole | None = None

    @model_validator(mode='after')
    def _validate_document_fields(self) -> 'UserFullUpdate':
        has_type = self.document_type is not None
        has_number = self.document_number is not None

        if has_type != has_number:
            raise ValueError(
                'document_type and document_number'
                ' must be provided together.'
            )

        return self


class UserPublicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    uid: str
    name: str
    email: str
    phone: str | None
    document_type: UserDocumentType | None
    document_number: str | None
    role: UserRole
    bio: str | None
    status: UserStatus
    email_verified_at: datetime | None
    terms_accepted_at: datetime | None
    created_at: datetime


class UserFullResponse(UserPublicResponse):
    model_config = ConfigDict(from_attributes=True)

    id: int
    avatar_url_id: int | None
    internal_note: str | None
    last_login_at: datetime | None
    updated_at: datetime
    