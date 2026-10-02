import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, get_db
from app.routers import users, videos, comments

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Tablas de base de datos verificadas/creadas.")
    except Exception as e:
        print(f"[ADVERTENCIA BD] No se pudo conectar a la base de datos al inicio: {e}")
    yield

app = FastAPI(
    title="Video Platform API",
    description="API REST para Plataforma de Videos desplegada en AWS EC2 con S3 y RDS",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

cors_origins = settings.CORS_ORIGINS if "*" not in settings.CORS_ORIGINS else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
upload_dir = os.path.join(backend_dir, "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

app.include_router(users.router)
app.include_router(videos.router)
app.include_router(comments.router)

@app.get("/", tags=["General"])
def root():
    return {
        "message": "Bienvenido a la API de la Plataforma de Videos (FastAPI CLI)",
        "documentation": "/docs",
        "health": "/health"
    }

@app.get("/health", tags=["General"], summary="Verificación de estado real con sondeo de RDS")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "database": f"error: {str(e)}",
                "version": "1.0.0"
            }
        )
