"""
import uvicorn
from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base
from app.modules.users import model as user_model
from app.modules.files import model as file_model
from app.modules.users.router import router as user_router

app = FastAPI()

app.include_router(user_router)
app.add_exception_handler(AppError, app_error_handler)

Base.metadata.create_all(bind=engine)


if __name__ == '__main__':
    uvicorn.run('main:app', host='0.0.0.0', port=8000, reload=True)"""




from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

from app.database.base import OrmBase
from app.database.connection import engine
from app.modules.users import model
from app.modules.files import model
from app.database.connection import get_database
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService
from app.modules.users.enums import UserDocumentType
from app.modules.users.faker import FakeUser
from app.utils.exceptions import AppError
from app.utils.exception_handlers import app_error_handler, validation_error_handler
from pydantic import ValidationError

app = FastAPI()

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(ValidationError, validation_error_handler)

"""

OrmBase.metadata.drop_all(bind=engine)
OrmBase.metadata.create_all(bind=engine)

for i in range(1000):
    session = next(get_database())
    service = UserService(session)
    service.create(UserCreate(**FakeUser.get_for_create()))
    print(i)
    session.close()
"""

session = next(get_database())
service = UserService(session)
print(service.get_full(id=1))
