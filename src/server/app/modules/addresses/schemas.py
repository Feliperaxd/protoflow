from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.addresses.enums import AddressStatus


class AddressCreate(BaseModel):
    name: str | None = None
    street: str
    street_number: str
    complement: str | None = None
    neighborhood: str
    city: str
    region: str
    postal_code: str
    country: str


class AddressUpdate(BaseModel):
    name: str | None = None
    street: str | None = None
    street_number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None
    country: str | None = None


class AddressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str | None
    street: str
    street_number: str
    complement: str | None
    neighborhood: str
    city: str
    region: str
    postal_code: str
    country: str
    status: AddressStatus
    created_at: datetime
    updated_at: datetime
