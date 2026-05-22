from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.utils.exceptions import AppError


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handle AppError exceptions and return a structured JSON response."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'code': exc.code,
            'detail': exc.detail,
        },
    )


async def validation_error_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic ValidationError and return a structured JSON response."""
    errors = [
        {
            'code': 'VALIDATION_ERROR',
            'field': '.'.join(str(loc) for loc in error['loc']),
            'detail': error['msg'],
        }
        for error in exc.errors()
    ]

    return JSONResponse(status_code=400, content={'errors': errors})
