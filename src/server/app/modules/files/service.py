import uuid as uuid_lib

from app.modules.files.enums import FileStatus
from app.modules.files.errors import (
    FILE_ALREADY_DELETED, FILE_NOT_FOUND,
    FILE_TOO_LARGE, INVALID_FILE_TYPE
)
from app.modules.files.model import File
from app.modules.files.schemas import FileResponse
from app.services.base import BaseService
from app.services.mixins import StatusMixin
from app.services.storage.base import BaseStorage
from app.services.storage.local import LocalStorage


class FileService(BaseService, StatusMixin):
    """Service layer for file management operations."""

    _NOT_FOUND_ERROR = FILE_NOT_FOUND

    _MAX_SIZE_IMAGE: int = 10 * 1024 * 1024     # 10 MB
    _MAX_SIZE_MODEL: int = 50 * 1024 * 1024     # 50 MB
    _MAX_SIZE_DOCUMENT: int = 20 * 1024 * 1024  # 20 MB

    _IMAGE_TYPES: frozenset[str] = frozenset({
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    })
    _MODEL_TYPES: frozenset[str] = frozenset({
        'model/stl',
        'model/obj',
    })
    _DOCUMENT_TYPES: frozenset[str] = frozenset({
        'application/pdf',
    })
    _ALLOWED_TYPES: frozenset[str] = (
        _IMAGE_TYPES | _MODEL_TYPES | _DOCUMENT_TYPES
    )

    def __init__(
        self,
        session,
        storage: BaseStorage | None = None,
    ) -> None:
        self.session = session
        self._storage = storage or LocalStorage()

    # --- public ---

    def upload(
        self,
        file: bytes,
        filename: str,
        mime_type: str,
    ) -> FileResponse:
        """Save a file to storage and persist its record.

        Args:
            file (bytes): Raw file content.
            filename (str): Original filename from the user.
            mime_type (str): MIME type of the file.

        Raises:
            AppError: If the file type is not allowed.
            AppError: If the file exceeds the maximum allowed size.

        Returns:
            FileResponse: The persisted file record.
        """
        self._validate_upload(file, mime_type)

        file_uuid = uuid_lib.uuid4().hex
        url = self._storage.save(file, filename, file_uuid)

        instance = File(
            uuid=file_uuid,
            url=url,
            filename=filename,
            mime_type=mime_type,
            size_bytes=len(file),
        )
        return FileResponse.model_validate(self._try_commit(instance))

    def get(self, id: int) -> FileResponse:
        """Fetch a file record by internal ID."""
        return FileResponse.model_validate(
            self._load_one(File, id=id)
        )

    def delete(self, id: int) -> None:
        """Remove file from storage and soft delete its record."""
        file = self._load_one(File, id=id)
        self._storage.delete(file.url)
        self._set_status(File, id, FileStatus.DELETED)

    def deactivate(self, id: int) -> None:
        """Deactivate a file by setting its status to INACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(File, id, FileStatus.INACTIVE)

    def activate(self, id: int) -> None:
        """Activate a file by setting its status to ACTIVE."""
        self._ensure_not_deleted(id)
        self._set_status(File, id, FileStatus.ACTIVE)

    def _validate_upload(self, file: bytes, mime_type: str) -> None:
        """Validate file type and size before upload."""
        if mime_type not in self._ALLOWED_TYPES:
            raise INVALID_FILE_TYPE

        if mime_type in self._MODEL_TYPES:
            max_size = self._MAX_SIZE_MODEL
        elif mime_type in self._DOCUMENT_TYPES:
            max_size = self._MAX_SIZE_DOCUMENT
        else:
            max_size = self._MAX_SIZE_IMAGE

        if len(file) > max_size:
            raise FILE_TOO_LARGE

    def _ensure_not_deleted(self, id: int) -> None:
        """Raise AppError if the file has been deleted."""
        file = self._load_one(File, id=id)
        if file.status == FileStatus.DELETED:
            raise FILE_ALREADY_DELETED
