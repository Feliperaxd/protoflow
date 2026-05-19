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

from app.database import Base, engine
from app.modules.users import model
from app.modules.files import model

app = FastAPI()

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

from app.database.connection import get_database
from app.modules.users.enums import UserDocumentType
from app.modules.users.enums import UserRole
from app.modules.users.schemas import UserCreate
from app.modules.users.service import UserService
from app.modules.users.faker import FakeUser

for _ in range(1000):
    session = next(get_database())
    service = UserService(session)
    service.create(UserCreate(**FakeUser.get_for_create()))
    print(_)
    session.close()

