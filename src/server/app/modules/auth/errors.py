from app.utils.exceptions import AppError

# 409 - Conflict
EMAIL_ALREADY_REGISTERED = AppError(
    status_code=409,
    message='This email is already registered.',
)

# 401 - Unauthorized
INVALID_CREDENTIALS = AppError(
    status_code=401,
    message='Invalid email or password.',
)
INVALID_REFRESH_TOKEN = AppError(
    status_code=401,
    message='Invalid or revoked refresh token.',
)
TOKEN_EXPIRED = AppError(
    status_code=401,
    message='Refresh token has expired.',
)