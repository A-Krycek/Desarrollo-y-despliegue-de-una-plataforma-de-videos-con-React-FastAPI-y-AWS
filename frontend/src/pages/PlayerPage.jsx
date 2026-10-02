import React, { useState, useEffect } from 'react';
import { getVideoById, getVideos, recordVideoView } from '../api/client';
import { PlayerTemplate } from '../components/templates';

/**
 * PÁGINA 3: REPRODUCTOR
 * Utiliza arquitectura atómica integrando el PlayerTemplate.
 * Muestra:
 * Video (HTML5/MP4), Título, Descripción, Usuario publicador, Número de vistas,
 * Comentarios (organismo CommentSection), Videos recomendados cargados dinámicamente.
 */
export const PlayerPage = ({ videoId, onSelectVideo, onBackToHome, onRequireAuth }) => {
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState(null);

  // Cargar video principal de forma pura (GET) y registrar la vista de forma separada y atómica (POST /views)
  useEffect(() => {
    const fetchCurrentVideo = async () => {
      if (!videoId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getVideoById(videoId);
        setVideo(data);

        // Registrar vista en endpoint atómico dedicado
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

  // Cargar videos recomendados dinámicamente desde la API (excluyendo el actual)
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!videoId) return;
      try {
        setLoadingRecs(true);
        const data = await getVideos({ exclude_id: videoId, limit: 8 });
        // Soporta tanto formato paginado { items: [...] } como array directo
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
