class TransitOpsException(Exception):
    """
    Base exception for the TransitOps application.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 400,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ResourceNotFoundException(TransitOpsException):
    def __init__(self, resource: str):
        super().__init__(
            message=f"{resource} not found.",
            status_code=404,
        )


class ConflictException(TransitOpsException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=409,
        )


class ValidationException(TransitOpsException):
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=400,
        )


class UnauthorizedException(TransitOpsException):
    def __init__(self):
        super().__init__(
            message="Unauthorized.",
            status_code=401,
        )


class ForbiddenException(TransitOpsException):
    def __init__(self):
        super().__init__(
            message="Permission denied.",
            status_code=403,
        )
