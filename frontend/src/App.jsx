import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext';
import { MainLayout } from './components/templates';
import { UploadModal } from './components/organisms';
import { Spinner } from './components/atoms';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

export function App() {
  const { isAuthenticated, loading } = useAuth();

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

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
{currentPage === 'home' && (
          <HomePage
            searchQuery={searchQuery}
            onSelectVideo={handleSelectVideo}
            onOpenUpload={handleOpenUpload}
            refreshKey={refreshKey}
          />
        )}
{currentPage === 'player' && (
          <PlayerPage
            videoId={selectedVideoId}
            onSelectVideo={handleSelectVideo}
            onBackToHome={() => navigateTo('home')}
            onRequireAuth={() => navigateTo('auth')}
          />
        )}
{currentPage === 'profile' && (
          <ProfilePage
            onSelectVideo={handleSelectVideo}
            onOpenUpload={handleOpenUpload}
            onRequireAuth={() => navigateTo('auth')}
            refreshKey={refreshKey}
          />
        )}
{currentPage === 'auth' && (
          <AuthPage
            onAuthSuccess={() => navigateTo('home')}
          />
        )}
      </Suspense>
<UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {

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
