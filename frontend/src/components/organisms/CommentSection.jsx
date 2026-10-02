import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVideoComments, addVideoComment } from '../../api/client';
import { MessageSquare, Send } from 'lucide-react';
import { Button, Avatar, Spinner } from '../atoms';
import { CommentItem } from '../molecules';

export const CommentSection = ({ videoId, onRequireAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVideoComments(videoId);
      const items = Array.isArray(data) ? data : data.items || [];
      setComments(items);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      setSubmitting(true);
      const added = await addVideoComment(videoId, newComment.trim());
      setComments([added, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      alert('Error al publicar comentario. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comments-section">
      <div className="comments-header">
        <h3 className="comments-title">
          <MessageSquare size={20} className="icon-mr" />
          Comentarios ({comments.length})
        </h3>
      </div>
{isAuthenticated ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <Avatar name={user.name} size="form" />
          <div className="comment-input-wrapper">
            <textarea
              className="comment-textarea"
              placeholder="Escribe un comentario respetuoso..."
              rows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <div className="comment-form-actions">
              <Button
                type="submit"
                variant="comment-submit"
                disabled={submitting || !newComment.trim()}
                loading={submitting}
                icon={Send}
              >
                Comentar
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Debes iniciar sesión para publicar un comentario.</p>
          <Button
            variant="secondary-sm"
            onClick={onRequireAuth}
          >
            Iniciar sesión
          </Button>
        </div>
      )}
<div className="comments-list">
        {loading ? (
          <div className="loading-state">
            <Spinner size={24} text="Cargando comentarios..." />
          </div>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : comments.length === 0 ? (
          <div className="empty-comments">
            <p>No hay comentarios aún. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </section>
  );
};
