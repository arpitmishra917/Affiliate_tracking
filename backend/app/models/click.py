from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from .base import BaseModel, get_utc_now

class Click(BaseModel):
    __tablename__ = "clicks"

    click_id = Column(String, unique=True, nullable=False, index=True)
    tracking_link_id = Column(Uuid(as_uuid=True), ForeignKey("tracking_links.id"), nullable=False, index=True)
    affiliate_id = Column(Uuid(as_uuid=True), ForeignKey("affiliates.id"), nullable=False, index=True)
    offer_id = Column(Uuid(as_uuid=True), ForeignKey("offers.id"), nullable=False, index=True)
    sub_id = Column(String, nullable=True, index=True)
    clicked_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now, index=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)

    tracking_link = relationship("TrackingLink")
    affiliate = relationship("Affiliate")
    offer = relationship("Offer")
