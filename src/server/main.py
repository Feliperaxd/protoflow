from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile
from pydantic import ValidationError

from app.database.base import OrmBase
from app.database.connection import engine, get_database
from app.modules.files import model as file_model
from app.modules.files.service import FileService
from app.modules.users import model as user_model
from app.modules.users.faker import FakeUser
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService
from app.utils.exception_handlers import (
    app_error_handler,
    validation_error_handler,
)
from app.utils.exceptions import AppError

app = FastAPI()

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(ValidationError, validation_error_handler)
session = next(get_database())
service = FileService(session)
service.activate(2)

@app.post('/files')
async def upload_file(file: UploadFile):
    session = next(get_database())
    service = FileService(session)
    content = await file.read()
    return service.upload(
        file=content,
        filename=file.filename,
        mime_type=file.content_type,
    )


"""
# --- reset e seed ---

OrmBase.metadata.drop_all(bind=engine)
OrmBase.metadata.create_all(bind=engine)

for i in range(1000):
    session = next(get_database())
    service = UserService(session)
    service.create(UserCreate(**FakeUser.get_for_create()))
    print(i)
    session.close()
"""

"""
# --- testes avulsos ---

session = next(get_database())
service = UserService(session)
print(service.get_full(email='lipeamaralsantos@gmail.com'))
"""

OrmBase.metadata.create_all(bind=engine)

"""
if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)
"""
