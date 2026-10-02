import React from 'react';
import { Eye, Calendar } from 'lucide-react';
import { StatItem } from '../atoms';

export const VideoMetadata = ({
  title,
  authorName = 'Usuario',
  views = 0,
  createdAt,
  className = '',
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

  const formatViews = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M vistas`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K vistas`;
    return `${count} ${count === 1 ? 'vista' : 'vistas'}`;
  };

  return (
    <div className={`video-metadata ${className}`.trim()}>
      <h3 className="video-title" title={title}>
        {title}
      </h3>

      <div className="video-author">
        <span className="author-name">{authorName}</span>
      </div>

      <div className="video-stats">
        <StatItem
          icon={Eye}
          value={formatViews(views)}
        />
        <span className="stat-separator">•</span>
        <StatItem
          icon={Calendar}
          value={formatDate(createdAt)}
        />
      </div>
    </div>
  );
};
