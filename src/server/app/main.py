from fastapi import FastAPI

from database import Base, engine
from models import File, User

app = FastAPI()

Base.metadata.create_all(bind=engine)
