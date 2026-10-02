import React from 'react';
import { Play, Eye, Calendar, Edit2, Trash2, Loader2, Film, Plus } from 'lucide-react';
import { resolveMediaUrl } from '../../api/client';
import { Button, Spinner, StatItem } from '../atoms';

export const UserVideoList = ({
  videos = [],
  loading = false,
  onSelectVideo,
  onEditVideo,
  onDeleteVideo,
  deletingId = null,
  onOpenUpload,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner size={32} text="Cargando tus videos publicados..." />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="empty-profile-videos">
        <Film size={48} className="empty-icon" aria-hidden="true" />
        <h3>Aún no has publicado ningún video</h3>
        <p>Comparte tus creaciones multimedia alojándolas directamente en Amazon S3.</p>
        <Button
          variant="primary"
          onClick={onOpenUpload}
          icon={Plus}
        >
          Subir mi primer video
        </Button>
      </div>
    );
  }

  return (
    <div className="user-videos-list">
      {videos.map((video) => (
        <div key={video.id} className="user-video-row">
<div
            className="row-thumbnail"
            onClick={() => onSelectVideo(video.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectVideo(video.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Reproducir video: ${video.title}`}
            title="Reproducir video"
          >
            <img
              src={resolveMediaUrl(video.thumbnail_url)}
              alt={video.title}
              className="row-thumb-img"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/video-placeholder.svg';
              }}
            />
            <div className="row-play-badge" aria-hidden="true">
              <Play size={18} fill="white" />
            </div>
          </div>
<div className="row-info">
            <h3
              className="row-title"
              onClick={() => onSelectVideo(video.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectVideo(video.id);
                }
              }}
              role="button"
              tabIndex={0}
              title={video.title}
            >
              {video.title}
            </h3>

            {video.description && (
              <p className="row-desc">{video.description}</p>
            )}

            <div className="row-stats">
              <StatItem icon={Eye} value={video.views} label="vistas" />
              <span className="meta-dot">•</span>
              <StatItem icon={Calendar} value={formatDate(video.created_at)} />
            </div>
          </div>
<div className="row-actions">
            <Button
              variant="secondary-sm"
              className="btn-action btn-edit"
              onClick={() => onEditVideo(video)}
              title="Editar información"
              aria-label={`Editar video ${video.title}`}
              icon={Edit2}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              className="btn-action btn-delete"
              onClick={() => onDeleteVideo(video.id, video.title)}
              disabled={deletingId === video.id}
              title="Eliminar de RDS y S3"
              aria-label={`Eliminar video ${video.title}`}
              icon={deletingId === video.id ? Loader2 : Trash2}
            >
              {deletingId === video.id ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
