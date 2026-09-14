from sqlalchemy import Column, String, Enum, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid
import uuid

from .base import BaseModel, get_utc_now
from .user import StatusEnum

class AffiliateOffer(BaseModel):
    __tablename__ = "affiliate_offers"

    affiliate_id = Column(Uuid(as_uuid=True), ForeignKey("affiliates.id"), nullable=False)
    offer_id = Column(Uuid(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('affiliate_id', 'offer_id', name='uq_affiliate_offer'),
    )

class ManagerOffer(BaseModel):
    __tablename__ = "manager_offers"

    manager_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    offer_id = Column(Uuid(as_uuid=True), ForeignKey("offers.id"), nullable=False)
    
    __table_args__ = (
        UniqueConstraint('manager_id', 'offer_id', name='uq_manager_offer'),
    )

class Offer(BaseModel):
    __tablename__ = "offers"

    name = Column(String, nullable=False)
    advertiser_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    destination_url = Column(Text, nullable=False)
    click_id_parameter = Column(String, nullable=True)
    sub_id_parameter = Column(String, nullable=True)
    status = Column(Enum(StatusEnum, native_enum=False), default=StatusEnum.ACTIVE)

    affiliates = relationship("Affiliate", secondary="affiliate_offers", back_populates="offers")
