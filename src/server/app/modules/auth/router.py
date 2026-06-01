from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_database
from app.modules.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.modules.auth.service import AuthService

router = APIRouter(prefix='/auth', tags=['auth'])


def get_auth_service(
    db: Session = Depends(get_database)
) -> AuthService:
    return AuthService(db)


@router.post(
    '/register',
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
):
    return service.register(data.email, data.password)


@router.post('/login', response_model=TokenResponse)
def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    return service.login(data.email, data.password)


@router.post('/refresh', response_model=TokenResponse)
def refresh(
    data: RefreshRequest,
    service: AuthService = Depends(get_auth_service),
):
    return service.refresh(data.refresh_token)


@router.post('/logout', status_code=status.HTTP_204_NO_CONTENT)
def logout(
    data: RefreshRequest,
    service: AuthService = Depends(get_auth_service),
):
    service.logout(data.refresh_token)
    