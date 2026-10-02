import io
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_token(client):
    user_payload = {
        "name": "Usuario Test",
        "email": "pytest_user@example.com",
        "password": "Password123!"
    }
    client.post("/users", json=user_payload)
    res = client.post("/login", json={"email": user_payload["email"], "password": user_payload["password"]})
    return res.json()["access_token"]

def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_user_registration(client):
    user_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "Password123!"
    }
    res = client.post("/users", json=user_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == user_payload["email"]
    assert "id" in data

def test_user_login_invalid(client):
    res = client.post("/login", json={"email": "nonexistent@example.com", "password": "wrong"})
    assert res.status_code == 401

def test_presigned_url_generation(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    payload = {"video_ext": ".mp4", "thumb_ext": ".jpg"}
    res = client.post("/videos/presigned-url", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "video" in data
    assert "thumbnail" in data
    assert "upload_url" in data["video"]

def test_video_upload_and_stream(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    fake_mp4 = io.BytesIO(b"\x00\x00\x00\x20ftypisom" + b"\x00" * 1024)
    fake_jpg = io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 512)

    files = {
        "file": ("test_video.mp4", fake_mp4, "video/mp4"),
        "thumbnail": ("test_thumb.jpg", fake_jpg, "image/jpeg"),
    }
    data = {
        "title": "Video de Prueba Pytest",
        "description": "Prueba automatizada de subida por chunks"
    }
    res = client.post("/videos", data=data, files=files, headers=headers)
    assert res.status_code == 201
    video = res.json()
    assert video["title"] == "Video de Prueba Pytest"
    assert video["views"] == 0

    vid_id = video["id"]
    res_get = client.get(f"/videos/{vid_id}")
    assert res_get.status_code == 200
    assert res_get.json()["views"] == 0

    res_view = client.post(f"/videos/{vid_id}/views")
    assert res_view.status_code == 200
    res_after = client.get(f"/videos/{vid_id}")
    assert res_after.json()["views"] == 1

def test_comments_and_pagination(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    videos_resp = client.get("/videos?limit=1").json()
    items = videos_resp["items"] if isinstance(videos_resp, dict) and "items" in videos_resp else videos_resp
    assert len(items) > 0
    vid_id = items[0]["id"]

    res_c = client.post(
        f"/videos/{vid_id}/comments",
        json={"content": "Comentario de prueba unitaria"},
        headers=headers
    )
    assert res_c.status_code == 201

    res_list = client.get(f"/videos/{vid_id}/comments?page=1&limit=10")
    assert res_list.status_code == 200
    comments_resp = res_list.json()
    comments = comments_resp["items"] if isinstance(comments_resp, dict) and "items" in comments_resp else comments_resp
    assert len(comments) >= 1
