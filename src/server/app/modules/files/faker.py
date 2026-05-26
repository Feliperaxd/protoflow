class FakeFile:
    """Factory for generating fake file payloads for testing purposes."""

    @classmethod
    def get_image(cls) -> tuple[bytes, str, str]:
        """Generate a minimal valid JPEG image."""
        # JPEG mínimo válido de 1x1 pixel
        content = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9,
        ])
        return content, 'fake_image.jpg', 'image/jpeg'

    @classmethod
    def get_document(cls) -> tuple[bytes, str, str]:
        """Generate a minimal valid PDF document."""
        content = b'%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF'
        return content, 'fake_document.pdf', 'application/pdf'

    @classmethod
    def get_model(cls) -> tuple[bytes, str, str]:
        """Generate a minimal valid ASCII STL model."""
        content = (
            b'solid fake\n'
            b'  facet normal 0 0 1\n'
            b'    outer loop\n'
            b'      vertex 0 0 0\n'
            b'      vertex 1 0 0\n'
            b'      vertex 0 1 0\n'
            b'    endloop\n'
            b'  endfacet\n'
            b'endsolid fake\n'
        )
        return content, 'fake_model.stl', 'model/stl'
