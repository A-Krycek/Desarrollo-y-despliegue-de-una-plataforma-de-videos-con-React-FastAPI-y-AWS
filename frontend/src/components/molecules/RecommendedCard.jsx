import React from 'react';
import { Play } from 'lucide-react';
import { resolveMediaUrl } from '../../api/client';

export const RecommendedCard = ({ video, onSelectVideo }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectVideo(video.id);
    }
  };

  return (
    <div
      className="recommended-card"
      onClick={() => onSelectVideo(video.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Ver video recomendado: ${video.title}`}
    >
      <div className="recommended-thumbnail-box">
        <img
          src={resolveMediaUrl(video.thumbnail_url)}
          alt={video.title}
          className="recommended-img"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/video-placeholder.svg';
          }}
        />
        <div className="rec-play-overlay" aria-hidden="true">
          <Play size={16} fill="white" />
        </div>
      </div>

      <div className="recommended-info">
        <h4 className="recommended-title" title={video.title}>
          {video.title}
        </h4>
        <p className="recommended-author">{video.user_name || 'Usuario'}</p>
        <p className="recommended-views">
          {video.views} vistas • {formatDate(video.created_at)}
        </p>
      </div>
    </div>
  );
};
