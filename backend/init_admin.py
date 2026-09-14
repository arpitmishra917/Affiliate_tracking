from app.core.database import SessionLocal
from app.models.user import User, RoleEnum, StatusEnum
from app.core.security import get_password_hash

def init_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            password_hash=get_password_hash("admin123"),
            name="Admin User",
            role=RoleEnum.ADMIN,
            status=StatusEnum.ACTIVE
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@example.com / admin123")
    else:
        print("Admin user already exists")
    db.close()

if __name__ == "__main__":
    init_admin()
