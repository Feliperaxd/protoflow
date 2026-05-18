class AppError(Exception):
    def __init__(
        self,
        code: int,
        detail: int,
        status_code: int
    ) -> None:
        super().__init__(detail)

        self.code = code
        self.detail = detail
        self.status_code = status_code
