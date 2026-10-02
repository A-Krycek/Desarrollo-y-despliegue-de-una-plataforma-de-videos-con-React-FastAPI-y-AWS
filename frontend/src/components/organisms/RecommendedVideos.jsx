import React from 'react';
import { Film } from 'lucide-react';
import { Spinner } from '../atoms';
import { RecommendedCard } from '../molecules';

export const RecommendedVideos = ({
  recommended = [],
  loading = false,
  onSelectVideo,
}) => {
  return (
    <aside className="player-sidebar">
      <div className="sidebar-header">
        <Film size={20} />
        <h3>Videos recomendados</h3>
      </div>

      {loading ? (
        <div className="loading-recs">
          <Spinner size={24} text="Cargando sugerencias..." />
        </div>
      ) : recommended.length === 0 ? (
        <div className="empty-recs">
          <p>No hay más videos sugeridos por el momento.</p>
        </div>
      ) : (
        <div className="recommended-list">
          {recommended.map((item) => (
            <RecommendedCard
              key={item.id}
              video={item}
              onSelectVideo={onSelectVideo}
            />
          ))}
        </div>
      )}
    </aside>
  );
};
