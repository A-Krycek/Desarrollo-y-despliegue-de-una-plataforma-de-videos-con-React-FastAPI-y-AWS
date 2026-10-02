import React, { useState, useEffect } from 'react';
import { getVideoById, getVideos, recordVideoView } from '../api/client';
import { PlayerTemplate } from '../components/templates';

export const PlayerPage = ({ videoId, onSelectVideo, onBackToHome, onRequireAuth }) => {
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentVideo = async () => {
      if (!videoId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getVideoById(videoId);
        setVideo(data);

        recordVideoView(videoId).catch((err) => {
          console.warn('No se pudo registrar la vista:', err);
        });
      } catch (err) {
        console.error('Error al cargar video:', err);
        setError('No se pudo cargar el video seleccionado.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentVideo();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [videoId]);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!videoId) return;
      try {
        setLoadingRecs(true);
        const data = await getVideos({ exclude_id: videoId, limit: 8 });

        setRecommended(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error('Error al cargar recomendados:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommended();
  }, [videoId]);

  return (
    <PlayerTemplate
      video={video}
      recommended={recommended}
      loading={loading}
      loadingRecs={loadingRecs}
      error={error}
      onSelectVideo={onSelectVideo}
      onBackToHome={onBackToHome}
      onRequireAuth={onRequireAuth}
    />
  );
};

export default PlayerPage;
