import React from 'react';
import { Play } from 'lucide-react';
import { resolveMediaUrl } from '../../api/client';

export const VideoThumbnail = ({
  thumbnailUrl,
  title,
  showPlayOverlay = true,
  className = '',
}) => {
  const resolvedUrl = resolveMediaUrl(thumbnailUrl);

  return (
    <div className={`thumbnail-container ${className}`.trim()}>
      <img
        src={resolvedUrl}
        alt={title || 'Miniatura del video'}
        className="thumbnail-img"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/video-placeholder.svg';
        }}
      />
      {showPlayOverlay && (
        <div className="play-overlay" aria-hidden="true">
          <div className="play-icon-bg">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};
