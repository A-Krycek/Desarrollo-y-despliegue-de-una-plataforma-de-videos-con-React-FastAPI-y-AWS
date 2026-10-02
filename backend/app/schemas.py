from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ==========================================
# USUARIOS
# ==========================================
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Nombre completo del usuario")
    email: EmailStr = Field(..., description="Correo electrónico único")
    password: str = Field(..., min_length=6, description="Contraseña de al menos 6 caracteres")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Correo electrónico registrado")
    password: str = Field(..., description="Contraseña")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime
    video_count: Optional[int] = 0

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==========================================
# VIDEOS
# ==========================================
class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Nuevo título del video")
    description: Optional[str] = Field(None, description="Nueva descripción del video")

class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = ""
    video_url: str
    thumbnail_url: str
    views: int
    user_id: int
    user_name: Optional[str] = "Usuario"
    created_at: datetime

class PresignedUrlRequest(BaseModel):
    video_ext: str = Field(".mp4", description="Extensión del video (.mp4)")
    thumb_ext: str = Field(".jpg", description="Extensión de miniatura (.jpg, .jpeg, .png)")

class PresignedUrlResponse(BaseModel):
    video: Dict[str, Any]
    thumbnail: Dict[str, Any]

class VideoCreateDirect(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = ""
    video_key: str = Field(..., description="Key del archivo en S3 generado por el backend")
    thumbnail_key: str = Field(..., description="Key de la miniatura en S3 generada por el backend")

class PaginatedVideosResponse(BaseModel):
    items: List[VideoResponse]
    total: int
    page: int
    limit: int
    pages: int

# ==========================================
# COMENTARIOS
# ==========================================
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, description="Texto del comentario")

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    user_id: int
    user_name: Optional[str] = "Usuario"
    video_id: int
    created_at: datetime

class PaginatedCommentsResponse(BaseModel):
    items: List[CommentResponse]
    total: int
    page: int
    limit: int

# ==========================================
# RESPUESTAS GENÉRICAS
# ==========================================
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
