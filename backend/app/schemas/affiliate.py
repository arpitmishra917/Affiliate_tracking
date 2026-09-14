from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import StatusEnum
from .user import UserResponse

class AffiliateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    manager_id: Optional[UUID] = None # Optional for Manager, optional for Admin (defaults to Admin)
    password: Optional[str] = None

class AffiliateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    password: Optional[str] = None
    status: Optional[StatusEnum] = None

class AffiliateResponse(BaseModel):
    id: UUID
    user_id: UUID
    manager_id: UUID
    affiliate_code: str
    status: StatusEnum
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
