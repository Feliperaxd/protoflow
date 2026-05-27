from datetime import datetime

from sqlalchemy import TIMESTAMP, Char, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import OrmBase
from app.modules.addresses.enums import AddressStatus


class Address(OrmBase):
    __tablename__ = 'addresses'

    # === Identity ===
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey('users.id'),
        nullable=False,
    )

    # === Core ===
    name: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    street: Mapped[str] = mapped_column(
        String(150), nullable=False
    )
    street_number: Mapped[str] = mapped_column(
        String(15), nullable=False
    )
    complement: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )
    neighborhood: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    city: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    region: Mapped[str] = mapped_column(
        String(10), nullable=False
    )
    postal_code: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    country: Mapped[str] = mapped_column(
        Char(2), nullable=False
    )
    status: Mapped[AddressStatus] = mapped_column(
        Enum(AddressStatus, name='address_status_enum'),
        default=AddressStatus.ACTIVE,
        nullable=False,
    )

    # === Audit ===
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    