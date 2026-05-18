from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database.connection import get_database
from users.model import User
from users.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')

APRENDER COMO USAR ISSO
def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_database),
) -> User:
    """Decode JWT token and return the authenticated user."""
    ...


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the authenticated user has admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Admin access required.',
        )

    return current_user


def require_owner(current_user: User, uid: str) -> User:
    """Ensure the authenticated user is the resource owner."""
    if current_user.uid != uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Access denied.',
        )

    return current_user