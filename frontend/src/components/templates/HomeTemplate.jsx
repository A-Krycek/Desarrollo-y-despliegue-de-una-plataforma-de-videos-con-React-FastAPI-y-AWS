import React from 'react';
import { Film, RefreshCw, PlayCircle } from 'lucide-react';
import { Button, Badge, Spinner, Alert } from '../atoms';
import { HeroBanner, VideoCard } from '../organisms';

export const HomeTemplate = ({
  searchQuery,
  videos = [],
  loading = false,
  loadingMore = false,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  error = null,
  onRefresh,
  onLoadMore,
  onSelectVideo,
  onOpenUpload,
}) => {
  const displayCount = totalCount || videos.length;

  return (
    <div className="home-page-container">
<HeroBanner onOpenUpload={onOpenUpload} />
<div className="catalog-header">
        <div className="catalog-title-wrapper">
          <Film size={22} className="catalog-icon" />
          <h2 className="catalog-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo de Videos'}
          </h2>
          <Badge variant="count">
            {displayCount} {displayCount === 1 ? 'video' : 'videos'}
          </Badge>
        </div>

        <Button
          variant="refresh"
          onClick={onRefresh}
          disabled={loading}
          title="Actualizar catálogo"
          icon={RefreshCw}
        >
          <span>Actualizar</span>
        </Button>
      </div>
<Alert
        type="error"
        message={error ? 'Error de conexión:' : null}
        detail={error}
      />
{loading ? (
        <div className="catalog-loading">
          <Spinner size={36} text="Obteniendo videos desde FastAPI en EC2..." />
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-catalog">
          <div className="empty-icon-wrap">
            <PlayCircle size={64} />
          </div>
          <h3>No se encontraron videos disponibles</h3>
          <p>
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otro término.`
              : 'Aún no se han publicado videos en la plataforma. ¡Sé el primero en subir uno!'}
          </p>
          <Button
            variant="hero"
            onClick={onOpenUpload}
          >
            Publicar el primer video
          </Button>
        </div>
      ) : (

        <>
          <div className="videos-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onSelectVideo={onSelectVideo}
              />
            ))}
          </div>

          {page < totalPages && (
            <div className="load-more-section">
              <Button
                variant="secondary"
                onClick={onLoadMore}
                loading={loadingMore}
                disabled={loadingMore}
                className="btn-load-more"
              >
                {loadingMore ? 'Cargando más videos...' : 'Cargar más videos'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
