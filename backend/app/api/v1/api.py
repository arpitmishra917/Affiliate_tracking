from fastapi import APIRouter
from . import auth, users, affiliates, offers, tracking_links, clicks, tracking

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(affiliates.router, prefix="/affiliates", tags=["affiliates"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(tracking_links.router, prefix="/tracking-links", tags=["tracking-links"])
api_router.include_router(clicks.router, prefix="/clicks", tags=["clicks"])
# tracking is public, shouldn't have prefix /api/v1 in standard sense, but spec says GET /c/{tracking_code}
# So let's include tracking directly on the app, not on api_router. Or we can prefix it differently.
# Other routers will be added here
