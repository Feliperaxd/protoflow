from datetime import datetime

from sqlalchemy import Enum, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from db.base import Base
from enums import UserDocumentType, UserStatus


class User(Base):
    __tablename__ = 'users'

    # === Identity ===
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # === Relations ===
    avatar_url_id: Mapped[int | None] = mapped_column(Integer)

    # === Core ===
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(255), index=True, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    document_type: Mapped[UserDocumentType] = mapped_column(
        Enum(UserDocumentType, name='user_doc_type_enum'), nullable=False
    )
    document_number: Mapped[str] = mapped_column(String(70), nullable=False)
    internal_note: Mapped[str | None] = mapped_column(Text)

    # === Activity ===
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, name='user_status_enum'), default=UserStatus.ACTIVE, nullable=False
    )
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
