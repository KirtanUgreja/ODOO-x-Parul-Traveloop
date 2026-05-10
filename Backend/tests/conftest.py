import os
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from unittest.mock import patch


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
def mock_redis():
    """Provide a mock Redis client for testing."""
    redis_data = {}
    
    class MockRedis:
        def get(self, key):
            return redis_data.get(key)
        
        def setex(self, key, ttl, value):
            redis_data[key] = value
        
        def delete(self, key):
            if key in redis_data:
                del redis_data[key]
        
        def incr(self, key):
            redis_data[key] = redis_data.get(key, 0) + 1
            return redis_data[key]
        
        def exists(self, key):
            return 1 if key in redis_data else 0
        
        def expire(self, key, ttl):
            pass
    
    return MockRedis()


@pytest_asyncio.fixture
async def async_client(mock_redis):
    """Create test client with mocked Redis."""
    os.environ.setdefault("APP_ENV", "test")
    
    # Mock Redis across the application
    with patch('app.redis_client.get_redis', return_value=mock_redis):
        with patch('app.services.otp_service.get_redis', return_value=mock_redis):
            with patch('app.services.token_service.get_redis', return_value=mock_redis):
                from app.main import app
                
                transport = ASGITransport(app=app)
                async with AsyncClient(transport=transport, base_url="http://test") as client:
                    yield client
