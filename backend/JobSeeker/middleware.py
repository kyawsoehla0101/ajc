from django.http import JsonResponse
from django_ratelimit.exceptions import Ratelimited
import logging

logger = logging.getLogger(__name__)

class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, Ratelimited):
            logger.warning(f"Rate limit exceeded for {request.META.get('REMOTE_ADDR')} on {request.path}")
            response = JsonResponse(
                {"detail": "Too many attempts, please wait one minute before trying again."}, 
                status=429
            )
            # Add retry-after header for better rate limit handling
            response['Retry-After'] = '60'
            return response
        return None