from app.utils.exceptions import AppError

# 409 - Conflict
FILE_ALREADY_DELETED = AppError(
    code='FILE_ALREADY_DELETED',
    detail='This file has been deleted and cannot be modified.',
    status_code=409,
)

# 404 - Not Found
FILE_NOT_FOUND = AppError(
    code='FILE_NOT_FOUND',
    detail='File not found.',
    status_code=404,
)

# 400 - Bad Request
INVALID_FILE_TYPE = AppError(
    code='INVALID_FILE_TYPE',
    detail='The file type is not allowed.',
    status_code=400,
)

FILE_TOO_LARGE = AppError(
    code='FILE_TOO_LARGE',
    detail='The file exceeds the maximum allowed size.',
    status_code=400,
)
