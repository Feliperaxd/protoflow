from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from dependencies.auth import get_current_user, require_admin, require_owner
from dependencies.services import get_user_service
from users.model import User
from users.schemas import UserAdminUpdate, UserCreate, UserUpdate
from users.service import UserService

router = APIRouter(prefix='/users', tags=['users'])

APRENDER COMO USAR ISSO
@router.post('/', status_code=status.HTTP_201_CREATED)
def create(
    data: UserCreate,
    service: UserService = Depends(get_user_service),
):
    return service.create(data)


@router.patch('/{uid}')
def update(
    uid: str,
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    require_owner(current_user, uid)
    return service.update(uid, data)


@router.patch('/{uid}/admin')
def admin_update(
    uid: str,
    data: UserAdminUpdate,
    current_user: User = Depends(require_admin),
    service: UserService = Depends(get_user_service),
):
    return service.update(uid, data)


@router.delete('/{uid}', status_code=status.HTTP_204_NO_CONTENT)
def delete(
    uid: str,
    current_user: User = Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    require_owner(current_user, uid)
    return service.delete(uid)


@router.post('/{uid}/ban', status_code=status.HTTP_204_NO_CONTENT)
def ban(
    uid: str,
    current_user: User = Depends(require_admin),
    service: UserService = Depends(get_user_service),
):
    return service.ban(uid)


@router.post('/{uid}/suspend', status_code=status.HTTP_204_NO_CONTENT)
def suspend(
    uid: str,
    current_user: User = Depends(require_admin),
    service: UserService = Depends(get_user_service),
):
    return service.suspend(uid)
