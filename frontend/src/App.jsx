import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/templates';
import { UploadModal } from './components/organisms';
import { Spinner } from './components/atoms';
import './App.css';

// Lazy loading y code-splitting para optimizar el bundle inicial y puntuación Lighthouse
const HomePage = lazy(() => import('./pages/HomePage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

/**
 * COMPONENTE PRINCIPAL (SPA)
 * Arquitectura: React + Vite Single Page Application estructurada bajo Atomic Design.
 * Solo contiene las 4 páginas requeridas:
 * - Página 1: Registro / Login (AuthPage)
 * - Página 2: Principal (HomePage)
 * - Página 3: Reproductor (PlayerPage)
 * - Página 4: Perfil del usuario (ProfilePage)
 */
export function App() {
  const { isAuthenticated, loading } = useAuth();

  // Estados de navegación SPA: 'home' | 'player' | 'profile' | 'auth'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Clave reactiva para refrescar catálogos sin destruir el estado de la SPA (elimina window.location.reload)
  const [refreshKey, setRefreshKey] = useState(0);

  // Sincronizar navegación con Hash de URL para soporte de historial del navegador
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('player')) {
        const params = new URLSearchParams(hash.split('?')[1]);
        const id = params.get('id');
        if (id) {
          setSelectedVideoId(parseInt(id, 10));
          setCurrentPage('player');
          return;
        }
      }
      if (['home', 'profile', 'auth'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page, videoId = null) => {
    setCurrentPage(page);
    if (page === 'player' && videoId) {
      setSelectedVideoId(videoId);
      window.location.hash = `player?id=${videoId}`;
    } else {
      window.location.hash = page;
    }
  };

  const handleSelectVideo = (videoId) => {
    navigateTo('player', videoId);
  };

  const handleOpenUpload = () => {
    if (!isAuthenticated) {
      navigateTo('auth');
    } else {
      setIsUploadModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <Spinner size={48} text="Iniciando Plataforma de Videos AWS..." />
      </div>
    );
  }

  return (
    <MainLayout
      currentPage={currentPage}
      setCurrentPage={(page) => navigateTo(page)}
      onSearch={(term) => setSearchQuery(term)}
      onOpenUpload={handleOpenUpload}
    >
      <Suspense
        fallback={
          <div className="catalog-loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size={40} text="Cargando contenido..." />
          </div>
        }
      >
        {/* PÁGINA 2: PRINCIPAL */}
        {currentPage === 'home' && (
          <HomePage
            searchQuery={searchQuery}
            onSelectVideo={handleSelectVideo}
            onOpenUpload={handleOpenUpload}
            refreshKey={refreshKey}
          />
        )}

        {/* PÁGINA 3: REPRODUCTOR */}
        {currentPage === 'player' && (
          <PlayerPage
            videoId={selectedVideoId}
            onSelectVideo={handleSelectVideo}
            onBackToHome={() => navigateTo('home')}
            onRequireAuth={() => navigateTo('auth')}
          />
        )}

        {/* PÁGINA 4: PERFIL DEL USUARIO */}
        {currentPage === 'profile' && (
          <ProfilePage
            onSelectVideo={handleSelectVideo}
            onOpenUpload={handleOpenUpload}
            onRequireAuth={() => navigateTo('auth')}
            refreshKey={refreshKey}
          />
        )}

        {/* PÁGINA 1: REGISTRO / LOGIN */}
        {currentPage === 'auth' && (
          <AuthPage
            onAuthSuccess={() => navigateTo('home')}
          />
        )}
      </Suspense>

      {/* MODAL GLOBAL PARA PUBLICACIÓN DE VIDEO EN S3 */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          // Actualización de estado reactiva en vez de recargar la página entera (window.location.reload eliminado)
          setRefreshKey((prev) => prev + 1);
          if (currentPage !== 'profile' && currentPage !== 'home') {
            navigateTo('profile');
          }
        }}
      />
    </MainLayout>
  );
}

export default App;
