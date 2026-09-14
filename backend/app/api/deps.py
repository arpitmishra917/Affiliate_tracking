from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(id=user_id, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
        
    import uuid
    try:
        user_uuid = uuid.UUID(token_data.id)
    except ValueError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    from app.models.user import StatusEnum
    if current_user.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

def get_current_active_admin_or_manager(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.ADMIN.value, RoleEnum.MANAGER, RoleEnum.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
