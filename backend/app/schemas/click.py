from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ClickBase(BaseModel):
    click_id: str
    tracking_link_id: UUID
    affiliate_id: UUID
    offer_id: UUID
    sub_id: Optional[str] = None
    clicked_at: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None

class ClickResponse(ClickBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
