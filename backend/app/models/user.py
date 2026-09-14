from sqlalchemy import Column, String, Enum
from sqlalchemy.orm import relationship
import enum

from .base import BaseModel

class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    AFFILIATE = "AFFILIATE"

class StatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class User(BaseModel):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(RoleEnum, native_enum=False), nullable=False)
    status = Column(Enum(StatusEnum, native_enum=False), default=StatusEnum.ACTIVE)

    # relationships will be defined on other models or here
