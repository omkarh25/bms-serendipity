"""
Test configuration and fixtures using actual kaas.db database.
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.api.deps import get_db
from app.services.notification.telegram import TelegramNotificationProvider

# Use actual kaas.db database
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'kaas.db'))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    """Create database session for testing using actual kaas.db."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    """Create FastAPI test client with actual database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture
def mock_notification_provider(mocker):
    """Mock notification provider for testing."""
    mock_provider = mocker.Mock(spec=TelegramNotificationProvider)
    mock_provider.connect.return_value = True
    mock_provider.send_notification.return_value = True
    mock_provider.verify_connection.return_value = True
    return mock_provider
