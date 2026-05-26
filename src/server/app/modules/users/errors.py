from app.utils.exceptions import AppError

# 500 - Internal Server Error
UID_GENERATION_FAILED = AppError(
    code='UID_GENERATION_FAILED',
    detail='Could not generate a unique UID. Please try again.',
    status_code=500,
)

# 409 - Conflict
EMAIL_ALREADY_REGISTERED = AppError(
    code='EMAIL_ALREADY_REGISTERED',
    detail='The email is already in use.',
    status_code=409,
)

PHONE_ALREADY_REGISTERED = AppError(
    code='PHONE_ALREADY_REGISTERED',
    detail='The phone is already in use.',
    status_code=409,
)

USER_ALREADY_DELETED = AppError(
    code='USER_ALREADY_DELETED',
    detail='This user has been deleted and cannot be modified.',
    status_code=409,
)

DOCUMENT_ALREADY_REGISTERED = AppError(
    code='DOCUMENT_ALREADY_REGISTERED',
    detail='The document number is already in use.',
    status_code=409,
)

# 404 - Not Found
USER_NOT_FOUND = AppError(
    code='USER_NOT_FOUND',
    detail='User not found.',
    status_code=404,
)

# 403 - Forbidden
USER_BANNED = AppError(
    code='USER_BANNED',
    detail='This account has been banned.',
    status_code=403,
)

USER_SUSPENDED = AppError(
    code='USER_SUSPENDED',
    detail='This account is temporarily suspended.',
    status_code=403,
)

USER_INACTIVE = AppError(
    code='USER_INACTIVE',
    detail='This account is inactive.',
    status_code=403,
)

# 401 - Unauthorized
INVALID_CREDENTIALS = AppError(
    code='INVALID_CREDENTIALS',
    detail='Invalid email or password.',
    status_code=401,
)

EMAIL_NOT_VERIFIED = AppError(
    code='EMAIL_NOT_VERIFIED',
    detail='Please verify your email before continuing.',
    status_code=401,
)

# 400 - Bad Request
INVALID_DOCUMENT_NUMBER = AppError(
    code='INVALID_DOCUMENT_NUMBER',
    detail='The document number is invalid.',
    status_code=400,
)

INVALID_DOCUMENT_TYPE = AppError(
    code='INVALID_DOCUMENT_TYPE',
    detail='Invalid document type.',
    status_code=400,
)

DOCUMENT_FIELDS_REQUIRED_TOGETHER = AppError(
    code='DOCUMENT_FIELDS_REQUIRED_TOGETHER',
    detail='document_type and document_number must be updated together.',
    status_code=400,
)

WEAK_PASSWORD = AppError(
    code='WEAK_PASSWORD',
    detail='The password does not meet the security requirements.',
    status_code=400,
)
