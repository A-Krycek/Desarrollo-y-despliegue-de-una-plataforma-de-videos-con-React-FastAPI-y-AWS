import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button, Spinner } from '../atoms';
import { VideoPlayerSection, CommentSection, RecommendedVideos } from '../organisms';

export const PlayerTemplate = ({
  video,
  recommended = [],
  loading = false,
  loadingRecs = false,
  error = null,
  onSelectVideo,
  onBackToHome,
  onRequireAuth,
}) => {
  if (loading) {
    return (
      <div className="player-loading-container">
        <Spinner size={48} text="Cargando reproductor y video desde Amazon S3..." />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="player-error-container">
        <AlertCircle size={48} className="error-icon" />
        <h2>{error || 'Video no encontrado'}</h2>
        <Button
          variant="secondary"
          onClick={onBackToHome}
          icon={ArrowLeft}
        >
          Volver al catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="player-layout">
<main className="player-main">
        <VideoPlayerSection
          video={video}
          onBackToHome={onBackToHome}
        />
<CommentSection
          videoId={video.id}
          onRequireAuth={onRequireAuth}
        />
      </main>
<RecommendedVideos
        recommended={recommended}
        loading={loadingRecs}
        onSelectVideo={onSelectVideo}
      />
    </div>
  );
};
