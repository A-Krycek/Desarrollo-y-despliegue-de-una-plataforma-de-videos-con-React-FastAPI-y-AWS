import React from 'react';
import { Avatar } from '../atoms';
import { VideoThumbnail, VideoMetadata } from '../molecules';

export const VideoCard = ({ video, onSelectVideo }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectVideo(video.id);
    }
  };

  return (
    <article
      className="video-card"
      onClick={() => onSelectVideo(video.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Reproducir video: ${video.title} por ${video.user_name || 'Usuario'}`}
    >
<VideoThumbnail
        thumbnailUrl={video.thumbnail_url}
        title={video.title}
        showPlayOverlay={true}
      />
<div className="video-info">
        <Avatar
          name={video.user_name || 'U'}
          size="md"
        />
<VideoMetadata
          title={video.title}
          authorName={video.user_name || 'Usuario'}
          views={video.views}
          createdAt={video.created_at}
        />
      </div>
    </article>
  );
};
