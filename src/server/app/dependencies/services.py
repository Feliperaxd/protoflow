import os

from fastapi import Depends
from sqlalchemy.orm import Session

from database.connection import get_database

'''
APRENDER COMO USAR ISSO
def get_user_service(session: Session = Depends(get_database)) -> UserService:
    """Inject a UserService with an active database session."""
    return UserService(session)
'''

def get_file_service(session) -> FileService:
    if os.getenv('ENVIRONMENT') == 'production':
        ...
    else:
        storage = LocalStorage()
    return FileService(session, storage=storage)
