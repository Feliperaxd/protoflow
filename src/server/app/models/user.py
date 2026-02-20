from datetime import datetime

from sqlalchemy import BigInteger, Enum, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from db.base import Base
from enums import UserStatus


class User(Base):
    __tablename__ = "users"

    # === Identity ===
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # === Authentication ===
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    # === Profile ===
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    avatar_url_id: Mapped[int | None] = mapped_column(BigInteger)

    # === Documents ===
    document_type: Mapped[int | None] = mapped_column(Integer)
    document_number: Mapped[str | None] = mapped_column(String(70))

    # === Metadata ===
    internal_note: Mapped[str | None] = mapped_column(Text)

    # === Status ===
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus),
        default=UserStatus.ACTIVE,
        nullable=False,
    )

    # === Activity ===
    last_login_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    email_verified_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))
    terms_accepted_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

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
