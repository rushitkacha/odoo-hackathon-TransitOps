import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("TransitOps")


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request: Request,
        call_next,
    ):

        start_time = time.perf_counter()

        response = await call_next(request)

        process_time = round(
            (time.perf_counter() - start_time) * 1000,
            2,
        )

        client_ip = request.client.host if request.client else "Unknown"

        logger.info(
            "%s | %s | %s | %s | %.2f ms",
            request.method,
            request.url.path,
            response.status_code,
            client_ip,
            process_time,
        )

        response.headers["X-Process-Time"] = str(process_time)

        return response
