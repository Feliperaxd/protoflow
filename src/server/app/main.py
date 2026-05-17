from fastapi import FastAPI

from database import Base, engine
from users import model
from files import model

app = FastAPI()

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

from database.connection import get_database
from users.enums import UserDocumentType
from users.enums import UserRole
from users.schemas import UserCreate
from users.service import UserService
from users.faker import FakeUser

for _ in range(100):
    session = next(get_database())
    service = UserService(session)
    service.create(UserCreate(**FakeUser.get_for_create()))
    print(_)
    session.close()