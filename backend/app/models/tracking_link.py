from sqlalchemy import Column, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from .base import BaseModel
from .user import StatusEnum

class TrackingLink(BaseModel):
    __tablename__ = "tracking_links"

    tracking_code = Column(String, unique=True, nullable=False, index=True)
    affiliate_id = Column(Uuid(as_uuid=True), ForeignKey("affiliates.id"), nullable=False)
    offer_id = Column(Uuid(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    status = Column(Enum(StatusEnum, native_enum=False), default=StatusEnum.ACTIVE)

    affiliate = relationship("Affiliate")
    offer = relationship("Offer")
