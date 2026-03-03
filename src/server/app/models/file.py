from datetime import datetime

from sqlalchemy import BigInteger, Enum, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from db.base import Base
from enums import FileStatus


class File(Base):
    __tablename__ = 'files'

    # === Identity ===
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uid: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # === Core ===
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    filename: Mapped[str] = mapped_column(String(250), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[FileStatus] = mapped_column(
        Enum(FileStatus, name='file_status_enum'),
        default=FileStatus.ACTIVE,
        nullable=False
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
