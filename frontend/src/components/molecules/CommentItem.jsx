import React from 'react';
import { Avatar } from '../atoms';

export const CommentItem = ({ comment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="comment-item">
      <Avatar name={comment.user_name || 'U'} size="sm" />
      <div className="comment-body">
        <div className="comment-meta">
          <span className="comment-author">{comment.user_name || 'Usuario'}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
      </div>
    </div>
  );
};
