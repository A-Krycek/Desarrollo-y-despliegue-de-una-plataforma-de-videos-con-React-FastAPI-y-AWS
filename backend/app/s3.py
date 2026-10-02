import os
import uuid
import shutil
import asyncio
from typing import Tuple, Optional, Dict, Any
from urllib.parse import urlparse
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import UploadFile, HTTPException, status
from app.config import settings

def get_s3_client():
    try:
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            return boto3.client(
                "s3",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
        else:
            return boto3.client("s3", region_name=settings.AWS_REGION)
    except Exception as e:
        print(f"[ADVERTENCIA S3] No se pudo inicializar cliente S3: {e}")
        return None

# Directorio local para almacenamiento de respaldo / desarrollo sin AWS
LOCAL_UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(os.path.join(LOCAL_UPLOAD_DIR, "videos"), exist_ok=True)
os.makedirs(os.path.join(LOCAL_UPLOAD_DIR, "thumbnails"), exist_ok=True)


def validate_file_extension(filename_or_ext: str, allowed_extensions: list) -> str:
    ext = filename_or_ext.lower()
    if not ext.startswith("."):
        _, ext = os.path.splitext(ext)
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no permitido ({ext}). Formatos válidos: {', '.join(allowed_extensions)}"
        )
    return ext


def build_media_url(bucket_name: str, key: str, folder_type: str = "videos") -> str:
    """Construye la URL segura de S3 o fallback local"""
    if settings.ENVIRONMENT == "production" or settings.AWS_ACCESS_KEY_ID or os.getenv("AWS_EXECUTION_ENV"):
        return f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    
    try:
        session = boto3.Session(region_name=settings.AWS_REGION)
        if session.get_credentials() is not None:
            return f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
    except Exception:
        pass

    return f"/uploads/{folder_type}/{key}"



def generate_presigned_upload_url(bucket_name: str, file_type: str, ext: str) -> Dict[str, Any]:
    """
    Genera una Presigned URL de Amazon S3 con validación estricta de extensiones.
    Permite subida directa frontend -> S3 con cero consumo de RAM en EC2.
    """
    allowed_exts = settings.ALLOWED_VIDEO_EXTENSIONS if file_type == "videos" else settings.ALLOWED_THUMBNAIL_EXTENSIONS
    valid_ext = validate_file_extension(ext, allowed_exts)

    unique_key = f"{uuid.uuid4().hex}{valid_ext}"
    s3_client = get_s3_client()
    content_type = "video/mp4" if file_type == "videos" else ("image/png" if valid_ext == ".png" else "image/jpeg")

    if s3_client:
        try:
            presigned_url = s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": bucket_name,
                    "Key": unique_key,
                    "ContentType": content_type,
                },
                ExpiresIn=3600,  # 1 hora
            )
            public_url = f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_key}"
            return {
                "upload_url": presigned_url,
                "public_url": public_url,
                "key": unique_key,
                "method": "PUT",
                "direct_s3": True
            }
        except Exception as e:
            print(f"[S3 Presigned Error] {e}")

    # Fallback si S3 aún no está configurado (modo local)
    return {
        "upload_url": f"/api/upload-stream/{file_type}",
        "public_url": f"/uploads/{file_type}/{unique_key}",
        "key": unique_key,
        "method": "POST",
        "direct_s3": False
    }


async def upload_file_stream(
    file: UploadFile,
    bucket_name: str,
    folder_type: str,
    content_type: str
) -> str:
    """
    Sube un archivo por streaming por bloques validando tamaño máximo (<= 100MB).
    Cero consumo excesivo de RAM y llamadas no bloqueantes.
    """
    allowed_exts = settings.ALLOWED_VIDEO_EXTENSIONS if folder_type == "videos" else settings.ALLOWED_THUMBNAIL_EXTENSIONS
    ext = validate_file_extension(file.filename or "", allowed_exts)
    unique_key = f"{uuid.uuid4().hex}{ext}"

    # Validar tamaño máximo leyendo en chunks de 64KB sin meter el archivo completo a RAM
    local_path = os.path.join(LOCAL_UPLOAD_DIR, folder_type, unique_key)
    file.file.seek(0)
    total_size = 0
    max_size = settings.MAX_VIDEO_SIZE_BYTES if folder_type == "videos" else 10 * 1024 * 1024  # 10MB para miniatura

    with open(local_path, "wb") as buffer:
        while True:
            chunk = file.file.read(64 * 1024)
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > max_size:
                buffer.close()
                if os.path.exists(local_path):
                    os.remove(local_path)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El archivo excede el tamaño máximo permitido ({max_size // (1024 * 1024)} MB)."
                )
            buffer.write(chunk)

    s3_client = get_s3_client()
    if s3_client:
        try:
            def _upload_to_s3():
                with open(local_path, "rb") as f_in:
                    s3_client.upload_fileobj(
                        Fileobj=f_in,
                        Bucket=bucket_name,
                        Key=unique_key,
                        ExtraArgs={"ContentType": content_type}
                    )

            await asyncio.to_thread(_upload_to_s3)
            # Limpiar archivo temporal local tras subir a S3
            if os.path.exists(local_path):
                os.remove(local_path)
            return f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_key}"
        except (ClientError, NoCredentialsError) as err:
            print(f"[S3 Stream Fallback] Usando almacenamiento local: {err}")

    return f"/uploads/{folder_type}/{unique_key}"


async def delete_file_from_s3_or_local(file_url: str, bucket_name: str, folder_type: str):
    """Elimina el archivo de S3 de manera no bloqueante o del almacenamiento local"""
    if not file_url:
        return

    # Si es URL local
    if file_url.startswith("/uploads/"):
        filename = os.path.basename(file_url)
        local_path = os.path.join(LOCAL_UPLOAD_DIR, folder_type, filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception as e:
                print(f"[Error borrado local] {e}")
        return

    # Si es URL de S3
    try:
        parsed = urlparse(file_url)
        key = parsed.path.lstrip("/")
        s3_client = get_s3_client()
        if s3_client and key:
            await asyncio.to_thread(s3_client.delete_object, Bucket=bucket_name, Key=key)
    except Exception as e:
        print(f"[Error borrado S3] {e}")
