from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.modules.files.enums import FileStatus


class FileUpload(BaseModel):
    filename: str
    mime_type: str


class FileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    filename: str
    mime_type: str
    size_bytes: int
    status: FileStatus
    created_at: datetime
    updated_at: datetime