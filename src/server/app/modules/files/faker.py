import os
import uuid


class FakeFile:
    """Factory for generating fake file payloads for testing purposes."""

    _MB = 1024 * 1024

    @classmethod
    def get_jpeg(cls, size_mb: float = 0) -> tuple[bytes, str, str]:
        """Generate a minimal valid JPEG image."""
        header = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
            0x00, 0x01, 0x00, 0x00,
        ])
        footer = bytes([0xFF, 0xD9])
        padding = cls._generate_padding(
            size_mb, len(header) + len(footer)
        )
        content = header + padding + footer
        return (
            content, 
            cls._generate_filename('fake_image', 'jpg'), 
            'image/jpeg'
        )

    @classmethod
    def get_pdf(cls, size_mb: float = 0) -> tuple[bytes, str, str]:
        """Generate a minimal valid PDF document."""
        header = b'%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n'
        footer = b'%%EOF'
        padding = cls._generate_padding(
            size_mb, len(header) + len(footer)
        )
        content = header + padding + footer
        return (
            content,
            cls._generate_filename('fake_document', 'pdf'),
            'application/pdf',
        )

    @classmethod
    def get_stl(cls, size_mb: float = 0) -> tuple[bytes, str, str]:
        """Generate a minimal valid ASCII STL model."""
        header = b'solid fake\n'
        footer = b'endsolid fake\n'
        padding = cls._generate_padding(
            size_mb, len(header) + len(footer)
        )
        content = header + padding + footer
        return (
            content,
            cls._generate_filename('fake_model', 'stl'),
            'model/stl',
        )

    @classmethod
    def get_text(cls, size_mb: float = 0) -> tuple[bytes, str, str]:
        """Generate a plain text file."""
        header = b'Hello, World!\n'
        padding = cls._generate_padding(size_mb, len(header))
        content = header + padding
        return (
            content,
            cls._generate_filename('fake_text', 'txt'),
            'text/plain',
        )

    @classmethod
    def _generate_filename(cls, prefix: str, ext: str) -> str:
        """Generate a unique filename with a random suffix."""
        return f'{prefix}_{uuid.uuid4().hex[:8]}.{ext}'

    @classmethod
    def _generate_padding(cls, size_mb: float, current_size: int) -> bytes:
        """Generate random padding bytes to reach the target size."""
        target = int(size_mb * cls._MB)
        padding_size = max(0, target - current_size)
        return os.urandom(padding_size)
    