from fastapi.testclient import TestClient
from app.main import app
import pytest
from datetime import datetime, timedelta

client = TestClient(app)

# Test data
test_client = {
    "client_name": "Test Client",
    "email": "test@example.com",
    "password": "testpassword123"
}

test_client_update = {
    "client_name": "Updated Test Client",
    "email": "updated@example.com"
}

@pytest.mark.asyncio
async def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Client Management API"}

@pytest.mark.asyncio
async def test_signup():
    response = client.post("/auth/signup", json=test_client)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["client_name"] == test_client["client_name"]
    assert data["email"] == test_client["email"]
    return data["id"]

@pytest.mark.asyncio
async def test_login():
    response = client.post("/auth/login", json={
        "email": test_client["email"],
        "password": test_client["password"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]

@pytest.mark.asyncio
async def test_get_clients():
    token = await test_login()
    response = client.get("/clients", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

@pytest.mark.asyncio
async def test_get_client():
    token = await test_login()
    client_id = await test_signup()
    response = client.get(f"/clients/{client_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == client_id
    assert data["client_name"] == test_client["client_name"]

@pytest.mark.asyncio
async def test_update_client():
    token = await test_login()
    client_id = await test_signup()
    response = client.put(
        f"/clients/{client_id}",
        json=test_client_update,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == client_id
    assert data["client_name"] == test_client_update["client_name"]
    assert data["email"] == test_client_update["email"]

@pytest.mark.asyncio
async def test_delete_client():
    token = await test_login()
    client_id = await test_signup()
    response = client.delete(
        f"/clients/{client_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "Client deleted successfully"}

@pytest.mark.asyncio
async def test_logout():
    token = await test_login()
    response = client.post("/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json() == {"message": "Successfully logged out"} 