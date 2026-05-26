import uuid as uuid_lib

from app.modules.files.enums import FileStatus
from app.modules.files.errors import FILE_ALREADY_DELETED, FILE_NOT_FOUND
from app.modules.files.model import File
from app.modules.files.schemas import FileResponse
from app.services.base import BaseService
from app.services.mixins import StatusMixin
from app.services.storage.base import BaseStorage
from app.services.storage.local import LocalStorage


class FileService(BaseService, StatusMixin):
    """Service layer for file management operations."""

    _NOT_FOUND_ERROR = FILE_NOT_FOUND

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

        Returns:
            FileResponse: The persisted file record.
        """
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

    def _ensure_not_deleted(self, id: int) -> None:
        """Raise AppError if the file has been deleted."""
        file = self._load_one(File, id=id)
        if file.status == FileStatus.DELETED:
            raise FILE_ALREADY_DELETED
        