from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database.base import Base
from app.modules.users.enums import UserDocumentType, UserRole, UserStatus


class User(Base):
    __tablename__ = 'users'

    # === Identity ===
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # === Relations ===
    avatar_url_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey('files.id'), nullable=True
    )

    # === Core ===
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str] = mapped_column(
        String(255), index=True, unique=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    document_type: Mapped[UserDocumentType | None] = mapped_column(
        Enum(UserDocumentType, name='user_doc_type_enum'), nullable=True
    )
    document_number: Mapped[str | None] = mapped_column(String(14), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name='user_role_enum'),
        nullable=False,
    )
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    internal_note: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # === Activity ===
    status: Mapped[UserStatus] = mapped_column(
        Enum(UserStatus, name='user_status_enum'),
        default=UserStatus.ACTIVE,
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    email_verified_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    terms_accepted_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
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
