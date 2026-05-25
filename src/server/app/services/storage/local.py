import uuid
from pathlib import Path

from app.services.storage.base import BaseStorage


class LocalStorage(BaseStorage):
    """Stores files on the local filesystem."""

    def __init__(self, base_path: str = 'uploads') -> None:
        self._base_path = Path(base_path)
        self._base_path.mkdir(parents=True, exist_ok=True)

    def save(self, file: bytes, filename: str) -> str:
        """Save a file and return its relative URL."""
        ext = Path(filename).suffix
        unique_name = f'{uuid.uuid4().hex}{ext}'
        path = self._base_path / unique_name
        path.write_bytes(file)
        return f'/uploads/{unique_name}'

    def delete(self, url: str) -> None:
        """Delete a file by its URL."""
        path = self._base_path / Path(url).name
        if path.exists():
            path.unlink()
