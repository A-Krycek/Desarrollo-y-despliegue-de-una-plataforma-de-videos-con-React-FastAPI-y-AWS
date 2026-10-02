import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Video, User
from app.schemas import (
    VideoResponse,
    VideoUpdate,
    MessageResponse,
    PresignedUrlRequest,
    PresignedUrlResponse,
    VideoCreateDirect,
    PaginatedVideosResponse
)
from app.auth import get_current_user
from app.config import settings
from app.s3 import (
    upload_file_stream,
    delete_file_from_s3_or_local,
    generate_presigned_upload_url,
    validate_file_extension,
    build_media_url
)

router = APIRouter(prefix="/videos", tags=["Videos"])

def to_video_response(video: Video, user_name: str = "Usuario") -> VideoResponse:

    return VideoResponse(
        id=video.id,
        title=video.title,
        description=video.description or "",
        video_url=video.video_url,
        thumbnail_url=video.thumbnail_url,
        views=video.views,
        user_id=video.user_id,
        user_name=user_name,
        created_at=video.created_at
    )

@router.post(
    "/presigned-url",
    response_model=PresignedUrlResponse,
    summary="Generar Presigned URLs para subida directa a S3",
    description="Permite al cliente subir archivos directamente a S3 sin cargar ancho de banda ni RAM en EC2."
)
def get_presigned_urls(
    req: PresignedUrlRequest,
    current_user: User = Depends(get_current_user)
):
    video_info = generate_presigned_upload_url(
        bucket_name=settings.S3_BUCKET_VIDEOS,
        file_type="videos",
        ext=req.video_ext
    )
    thumb_info = generate_presigned_upload_url(
        bucket_name=settings.S3_BUCKET_THUMBNAILS,
        file_type="thumbnails",
        ext=req.thumb_ext
    )
    return PresignedUrlResponse(video=video_info, thumbnail=thumb_info)

@router.post(
    "/direct",
    response_model=VideoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar metadata tras subida directa a S3",
    description="El backend valida las keys y construye URLs seguras hacia los buckets S3 configurados."
)
def register_direct_video(
    video_in: VideoCreateDirect,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    validate_file_extension(video_in.video_key, settings.ALLOWED_VIDEO_EXTENSIONS)
    validate_file_extension(video_in.thumbnail_key, settings.ALLOWED_THUMBNAIL_EXTENSIONS)

    video_url = build_media_url(settings.S3_BUCKET_VIDEOS, video_in.video_key, "videos")
    thumbnail_url = build_media_url(settings.S3_BUCKET_THUMBNAILS, video_in.thumbnail_key, "thumbnails")

    new_video = Video(
        title=video_in.title.strip(),
        description=(video_in.description or "").strip(),
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        views=0,
        user_id=current_user.id
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    return to_video_response(new_video, current_user.name)

@router.post(
    "",
    response_model=VideoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Publicar un nuevo video (Streaming de archivos / Fallback)",
    description="Sube el archivo por streaming directo (validando tamaño <= 100MB) a S3 o almacenamiento local y registra en RDS."
)
async def upload_video(
    title: str = Form(..., min_length=1, max_length=255, description="Título del video"),
    description: Optional[str] = Form("", description="Descripción detallada del video"),
    file: UploadFile = File(..., description="Archivo de video MP4 (Máximo 100MB)"),
    thumbnail: UploadFile = File(..., description="Miniatura de video (JPG, JPEG o PNG)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video_url = await upload_file_stream(
        file=file,
        bucket_name=settings.S3_BUCKET_VIDEOS,
        folder_type="videos",
        content_type="video/mp4"
    )

    thumb_content_type = thumbnail.content_type or "image/jpeg"
    thumbnail_url = await upload_file_stream(
        file=thumbnail,
        bucket_name=settings.S3_BUCKET_THUMBNAILS,
        folder_type="thumbnails",
        content_type=thumb_content_type
    )

    new_video = Video(
        title=title.strip(),
        description=(description or "").strip(),
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        views=0,
        user_id=current_user.id
    )
    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return to_video_response(new_video, current_user.name)

@router.get(
    "",
    response_model=PaginatedVideosResponse,
    summary="Listar videos con paginación",
    description="Obtiene el catálogo de videos con soporte para búsqueda, paginación real y total de páginas."
)
def list_videos(
    q: Optional[str] = Query(None, description="Término de búsqueda"),
    user_id: Optional[int] = Query(None, description="Filtrar por ID de usuario"),
    exclude_id: Optional[int] = Query(None, description="Excluir un ID de video"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(20, ge=1, le=100, description="Cantidad por página"),
    db: Session = Depends(get_db)
):
    query = db.query(Video, User.name.label("user_name")).join(User, Video.user_id == User.id)

    if q:
        search_filter = f"%{q.strip()}%"
        query = query.filter(
            (Video.title.ilike(search_filter)) | (Video.description.ilike(search_filter))
        )

    if user_id is not None:
        query = query.filter(Video.user_id == user_id)

    if exclude_id is not None:
        query = query.filter(Video.id != exclude_id)

    total = query.count()
    offset = (page - 1) * limit
    results = query.order_by(Video.created_at.desc()).offset(offset).limit(limit).all()

    items = [to_video_response(v, author_name) for v, author_name in results]
    pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedVideosResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.get(
    "/{id}",
    response_model=VideoResponse,
    summary="Obtener detalle de un video (Solo lectura)",
    description="Consulta la información del video para el reproductor sin mutar el estado de vistas (operación GET pura)."
)
def get_video_by_id(id: int, db: Session = Depends(get_db)):
    result = db.query(Video, User.name.label("user_name")).join(
        User, Video.user_id == User.id
    ).filter(Video.id == id).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no existe."
        )

    video, author_name = result
    return to_video_response(video, author_name)

@router.post(
    "/{id}/views",
    summary="Registrar vista de video (Atómico)",
    description="Incrementa atómicamente el contador de vistas en SQL frente a concurrencia."
)
def record_video_view(id: int, db: Session = Depends(get_db)):
    rows = db.query(Video).filter(Video.id == id).update({Video.views: Video.views + 1})
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no existe."
        )
    db.commit()
    return {"message": "Vista registrada correctamente", "video_id": id}

@router.put(
    "/{id}",
    response_model=VideoResponse,
    summary="Actualizar información del video",
    description="Permite al autor del video actualizar el título y/o descripción."
)
def update_video(
    id: int,
    video_in: VideoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(Video.id == id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no encontrado."
        )

    if video.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este video."
        )

    if video_in.title is not None:
        video.title = video_in.title.strip()
    if video_in.description is not None:
        video.description = video_in.description.strip()

    db.commit()
    db.refresh(video)

    return to_video_response(video, current_user.name)

@router.delete(
    "/{id}",
    response_model=MessageResponse,
    summary="Eliminar video",
    description="Elimina el video de la base de datos RDS y borra los archivos correspondientes en S3."
)
async def delete_video(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(Video.id == id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no encontrado."
        )

    if video.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este video."
        )

    video_url = video.video_url
    thumbnail_url = video.thumbnail_url

    db.delete(video)
    db.commit()

    await delete_file_from_s3_or_local(video_url, settings.S3_BUCKET_VIDEOS, "videos")
    await delete_file_from_s3_or_local(thumbnail_url, settings.S3_BUCKET_THUMBNAILS, "thumbnails")

    return MessageResponse(
        message=f"El video con ID {id} fue eliminado exitosamente de RDS y S3."
    )
