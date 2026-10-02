import React, { useState } from 'react';
import { Eye, Calendar, ArrowLeft, Share2, Check } from 'lucide-react';
import { resolveMediaUrl } from '../../api/client';
import { Button, Avatar, StatItem } from '../atoms';

export const VideoPlayerSection = ({ video, onBackToHome }) => {
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const videoStreamUrl = resolveMediaUrl(video.video_url);

  return (
    <div className="player-main-section">
      {/* BOTÓN VOLVER */}
      <div className="player-back-bar">
        <Button
          variant="back"
          onClick={onBackToHome}
          icon={ArrowLeft}
        >
          Volver al Catálogo
        </Button>
      </div>

      {/* REPRODUCTOR DE VIDEO HTML5 (S3 VIDEOS) */}
      <div className="video-player-wrapper">
        <video
          controls
          autoPlay
          playsInline
          src={videoStreamUrl}
          poster={resolveMediaUrl(video.thumbnail_url)}
          className="html5-video-player"
        >
          Tu navegador no soporta la reproducción de video HTML5 en formato MP4.
        </video>
      </div>

      {/* METADATOS DEL VIDEO */}
      <div className="video-details-section">
        <h1 className="player-video-title">{video.title}</h1>

        <div className="player-meta-bar">
          {/* AUTOR Y AVATAR */}
          <div className="author-info-box">
            <Avatar name={video.user_name || 'U'} size="lg" />
            <div>
              <span className="author-name-large">{video.user_name || 'Usuario'}</span>
              <span className="author-subtext">Creador verificado</span>
            </div>
          </div>

          {/* ESTADÍSTICAS Y ACCIONES */}
          <div className="player-stats-box">
            <span className="player-stat">
              <Eye size={18} />
              <strong>{video.views}</strong> vistas
            </span>
            <span className="player-stat">
              <Calendar size={18} />
              {formatDate(video.created_at)}
            </span>
            <Button
              variant="share"
              onClick={handleShare}
              icon={copied ? Check : Share2}
            >
              <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
            </Button>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        {video.description && (
          <div className="video-description-box">
            <h4 className="desc-heading">Descripción</h4>
            <p className="desc-content">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
