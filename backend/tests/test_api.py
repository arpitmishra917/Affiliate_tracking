from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash
import uuid

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create an admin user for tests
    admin = User(
        id=uuid.uuid4(),
        name="Test Admin",
        email="admin_test@example.com",
        password_hash=get_password_hash("password123"),
        role=RoleEnum.ADMIN
    )
    db.add(admin)
    db.commit()
    db.close()
    yield

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_login():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin_test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin_test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
