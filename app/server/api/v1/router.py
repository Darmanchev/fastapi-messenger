from fastapi import APIRouter
from app.server.api.v1.endpoints import channels, messages

router = APIRouter(prefix="/api/v1")

router.include_router(channels.router)
router.include_router(messages.router)