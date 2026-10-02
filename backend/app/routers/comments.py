from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comment, Video, User
from app.schemas import CommentCreate, CommentResponse, PaginatedCommentsResponse
from app.auth import get_current_user

router = APIRouter(prefix="/videos/{id}/comments", tags=["Comentarios"])


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Agregar un comentario al video",
    description="Registra un nuevo comentario para el video especificado en la base de datos RDS."
)
def add_comment(
    id: int,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(Video.id == id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no existe."
        )

    new_comment = Comment(
        content=comment_in.content.strip(),
        user_id=current_user.id,
        video_id=id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return CommentResponse(
        id=new_comment.id,
        content=new_comment.content,
        user_id=new_comment.user_id,
        user_name=current_user.name,
        video_id=new_comment.video_id,
        created_at=new_comment.created_at
    )


@router.get(
    "",
    response_model=PaginatedCommentsResponse,
    summary="Listar comentarios de un video con paginación",
    description="Consulta los comentarios asociados al video ordenados cronológicamente con paginación real."
)
def get_video_comments(
    id: int,
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(50, ge=1, le=100, description="Límite por página"),
    db: Session = Depends(get_db)
):
    video = db.query(Video).filter(Video.id == id).first()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video con ID {id} no existe."
        )

    query = db.query(Comment, User.name.label("user_name")).join(
        User, Comment.user_id == User.id
    ).filter(
        Comment.video_id == id
    )

    total = query.count()
    offset = (page - 1) * limit
    results = query.order_by(
        Comment.created_at.desc()
    ).offset(offset).limit(limit).all()

    items = [
        CommentResponse(
            id=c.id,
            content=c.content,
            user_id=c.user_id,
            user_name=author_name,
            video_id=c.video_id,
            created_at=c.created_at
        )
        for c, author_name in results
    ]

    return PaginatedCommentsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )
