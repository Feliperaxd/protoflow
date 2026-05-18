from fastapi import Depends
from sqlalchemy.orm import Session

from database.connection import get_database
from users.service import UserService

APRENDER COMO USAR ISSO
def get_user_service(session: Session = Depends(get_database)) -> UserService:
    """Inject a UserService with an active database session."""
    return UserService(session)
