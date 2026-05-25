from abc import ABC, abstractmethod


class BaseStorage(ABC):
    """Abstract base class for file storage backends."""

    @abstractmethod
    def save(self, file: bytes, filename: str) -> str:
        """Save a file and return its public URL."""

    @abstractmethod
    def delete(self, url: str) -> None:
        """Delete a file by its URL."""
