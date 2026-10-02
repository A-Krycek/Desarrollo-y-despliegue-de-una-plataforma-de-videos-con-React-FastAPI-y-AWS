"""
Script de pruebas automatizadas para la API de la Plataforma de Videos.
Valida todos los endpoints requeridos por la actividad.
"""
import io
import sys

# Asegurar salida utf-8 en consola de Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from app.database import Base, get_db

# Base de datos en memoria para pruebas independientes sin requerir conexión a RDS externa
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)

client = TestClient(app)


def run_all_tests():
    print("==================================================")
    print(" INICIANDO PRUEBAS DE LA PLATAFORMA DE VIDEOS API")
    print("==================================================")

    # 1. Healthcheck
    res = client.get("/health")
    assert res.status_code == 200, f"Error en /health: {res.text}"
    print("[OK] 1. GET /health - OK")

    # 2. Registro de Usuario (POST /users)
    user_payload = {
        "name": "Estudiante AWS",
        "email": "estudiante@cloud.edu",
        "password": "Password123!"
    }
    res = client.post("/users", json=user_payload)
    if res.status_code == 201:
        user_id = res.json()["id"]
        print(f"[OK] 2. POST /users - Usuario registrado exitosamente (ID: {user_id})")
    else:
        print("[INFO] 2. POST /users - Usuario ya existía, procediendo a login.")

    # 3. Login de Usuario (POST /login)
    login_payload = {
        "email": "estudiante@cloud.edu",
        "password": "Password123!"
    }
    res = client.post("/login", json=login_payload)
    assert res.status_code == 200, f"Error en /login: {res.text}"
    login_data = res.json()
    token = login_data["access_token"]
    user_id = login_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"[OK] 3. POST /login - JWT generado con éxito para user_id {user_id}")

    # 4. Perfil de Usuario (GET /users/{id})
    res = client.get(f"/users/{user_id}", headers=headers)
    assert res.status_code == 200, f"Error en /users/{user_id}: {res.text}"
    profile = res.json()
    assert profile["email"] == "estudiante@cloud.edu"
    print(f"[OK] 4. GET /users/{{id}} - Perfil obtenido: {profile['name']} ({profile['video_count']} videos)")

    # 5. Publicación de Video (POST /videos)
    fake_mp4_content = b"\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2mp41" + b"\x00" * 2048
    fake_jpg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"\x00" * 512

    files = {
        "file": ("arquitectura_aws.mp4", io.BytesIO(fake_mp4_content), "video/mp4"),
        "thumbnail": ("miniatura_aws.jpg", io.BytesIO(fake_jpg_content), "image/jpeg"),
    }
    data = {
        "title": "Despliegue de React y FastAPI en AWS EC2 y S3",
        "description": "Video demostrativo de la arquitectura en la nube con Amazon RDS."
    }
    res = client.post("/videos", data=data, files=files, headers=headers)
    assert res.status_code == 201, f"Error en POST /videos: {res.text}"
    video_data = res.json()
    video_id = video_data["id"]
    print(f"[OK] 5. POST /videos - Video publicado exitosamente (ID: {video_id})")
    print(f"     URL Video: {video_data['video_url']}")
    print(f"     URL Miniatura: {video_data['thumbnail_url']}")

    # 6. Catálogo de Videos (GET /videos)
    res = client.get("/videos")
    assert res.status_code == 200, f"Error en GET /videos: {res.text}"
    videos_resp = res.json()
    videos_list = videos_resp["items"] if isinstance(videos_resp, dict) and "items" in videos_resp else videos_resp
    assert len(videos_list) >= 1
    print(f"[OK] 6. GET /videos - Catálogo obtenido con {len(videos_list)} videos (Paginado)")

    # 7. Reproductor de Video (GET /videos/{id}) y Registro de Vista Atómico (POST /videos/{id}/views)
    res = client.get(f"/videos/{video_id}")
    assert res.status_code == 200, f"Error en GET /videos/{video_id}: {res.text}"
    video_detail = res.json()
    assert video_detail["id"] == video_id

    # Registrar vista en endpoint atómico desacoplado
    res_view = client.post(f"/videos/{video_id}/views")
    assert res_view.status_code == 200
    res_after = client.get(f"/videos/{video_id}").json()
    assert res_after["views"] >= 1
    print(f"[OK] 7. GET /videos/{{id}} (lectura pura) y POST /videos/{{id}}/views (incremento atómico: {res_after['views']})")

    # 8. Agregar Comentario (POST /videos/{id}/comments)
    comment_payload = {
        "content": "Excelente explicación de los buckets de S3 y la base de datos RDS."
    }
    res = client.post(f"/videos/{video_id}/comments", json=comment_payload, headers=headers)
    assert res.status_code == 201, f"Error en POST /videos/{video_id}/comments: {res.text}"
    comment_data = res.json()
    comment_id = comment_data["id"]
    print(f"[OK] 8. POST /videos/{{id}}/comments - Comentario creado (ID: {comment_id})")

    # 9. Listar Comentarios (GET /videos/{id}/comments)
    res = client.get(f"/videos/{video_id}/comments")
    assert res.status_code == 200, f"Error en GET /videos/{video_id}/comments: {res.text}"
    comments_resp = res.json()
    comments_list = comments_resp["items"] if isinstance(comments_resp, dict) and "items" in comments_resp else comments_resp
    assert len(comments_list) >= 1
    print(f"[OK] 9. GET /videos/{{id}}/comments - Comentarios listados: {len(comments_list)}")

    # 10. Actualizar Video (PUT /videos/{id})
    update_payload = {
        "title": "Despliegue en AWS (Actualizado)",
        "description": "Descripción actualizada mediante PUT /videos/{id}."
    }
    res = client.put(f"/videos/{video_id}", json=update_payload, headers=headers)
    assert res.status_code == 200, f"Error en PUT /videos/{video_id}: {res.text}"
    updated_video = res.json()
    assert updated_video["title"] == "Despliegue en AWS (Actualizado)"
    print(f"[OK] 10. PUT /videos/{{id}} - Video actualizado correctamente")

    # 11. Eliminar Video (DELETE /videos/{id})
    res = client.delete(f"/videos/{video_id}", headers=headers)
    assert res.status_code == 200, f"Error en DELETE /videos/{video_id}: {res.text}"
    print(f"[OK] 11. DELETE /videos/{{id}} - Video eliminado de la base de datos y almacenamiento")

    # Verificar que ya no existe
    res = client.get(f"/videos/{video_id}")
    assert res.status_code == 404
    print(f"[OK] 12. GET /videos/{{id}} tras eliminación retornó 404 Not Found como se esperaba")

    print("==================================================")
    print(" TODAS LAS PRUEBAS (12/12) PASARON EXITOSAMENTE! ")
    print("==================================================")

if __name__ == "__main__":
    run_all_tests()
