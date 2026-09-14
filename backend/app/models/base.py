import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.types import Uuid

from app.core.database import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class BaseModel(Base):
    __abstract__ = True

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
