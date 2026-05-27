from app.utils.exceptions import AppError

# 404 - Not Found
ADDRESS_NOT_FOUND = AppError(
    code='ADDRESS_NOT_FOUND',
    detail='Address not found.',
    status_code=404,
)

# 409 - Conflict
ADDRESS_ALREADY_DELETED = AppError(
    code='ADDRESS_ALREADY_DELETED',
    detail='This address has been deleted and cannot be modified.',
    status_code=409,
)
