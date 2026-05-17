from fastapi import FastAPI

from database import Base, engine
from users import model

app = FastAPI()

Base.metadata.create_all(bind=engine)
