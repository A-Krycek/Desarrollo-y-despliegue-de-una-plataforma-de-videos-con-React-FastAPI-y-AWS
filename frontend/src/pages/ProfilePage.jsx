import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVideos, deleteVideo } from '../api/client';
import { ProfileTemplate } from '../components/templates';

export const ProfilePage = ({ onSelectVideo, onOpenUpload, onRequireAuth, refreshKey = 0 }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [videoToEdit, setVideoToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const fetchUserVideos = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getVideos({ user_id: user.id, limit: 100 });
      setUserVideos(Array.isArray(data) ? data : (data?.items || []));
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Error al cargar videos del usuario:', err);
      setError('No se pudieron obtener tus videos subidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserVideos();
    }
  }, [isAuthenticated, user?.id, refreshKey]);

  const handleDelete = async (videoId, videoTitle) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el video "${videoTitle}"? Se borrará de Amazon S3 y de la base de datos RDS permanentemente.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(videoId);
      await deleteVideo(videoId);
      setUserVideos((prev) => prev.filter((v) => v.id !== videoId));
      setNotification(`Video "${videoTitle}" eliminado correctamente.`);
      setTimeout(() => setNotification(null), 3000);
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Error al eliminar video:', err);
      alert('Error al intentar eliminar el video de S3/RDS.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (video) => {
    setVideoToEdit(video);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setNotification('Video actualizado exitosamente.');
    setTimeout(() => setNotification(null), 3000);
    fetchUserVideos();
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-required-screen">
        <h2>Debes iniciar sesión para ver tu perfil</h2>
        <button className="btn-primary" onClick={onRequireAuth}>
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <ProfileTemplate
      user={user}
      userVideos={userVideos}
      loading={loading}
      error={error}
      notification={notification}
      videoToEdit={videoToEdit}
      isEditModalOpen={isEditModalOpen}
      deletingId={deletingId}
      onSelectVideo={onSelectVideo}
      onEditVideo={handleEditClick}
      onDeleteVideo={handleDelete}
      onCloseEditModal={() => setIsEditModalOpen(false)}
      onUpdateSuccess={handleEditSuccess}
      onOpenUpload={onOpenUpload}
    />
  );
};

export default ProfilePage;
