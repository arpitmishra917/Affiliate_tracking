from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from .base import BaseModel
from .user import StatusEnum

class Affiliate(BaseModel):
    __tablename__ = "affiliates"

    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    manager_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    affiliate_code = Column(String, unique=True, nullable=False, index=True)
    status = Column(Enum(StatusEnum, native_enum=False), default=StatusEnum.ACTIVE)

    user = relationship("User", foreign_keys=[user_id])
    manager = relationship("User", foreign_keys=[manager_id])
    
    offers = relationship("Offer", secondary="affiliate_offers", back_populates="affiliates")
