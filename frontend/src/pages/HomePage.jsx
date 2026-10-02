import React, { useState, useEffect } from 'react';
import { getVideos } from '../api/client';
import { HomeTemplate } from '../components/templates';

export const HomePage = ({ searchQuery, onSelectVideo, onOpenUpload, refreshKey = 0 }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchVideos = async (pageToFetch = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = {
        page: pageToFetch,
        limit: 12,
      };
      if (searchQuery && searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      const data = await getVideos(params);

      const items = Array.isArray(data) ? data : (data?.items || []);
      const total = Array.isArray(data) ? data.length : (data?.total ?? items.length);
      const pages = Array.isArray(data) ? 1 : (data?.pages ?? 1);
      const currentPage = Array.isArray(data) ? 1 : (data?.page ?? pageToFetch);

      if (append) {
        setVideos((prev) => [...prev, ...items]);
      } else {
        setVideos(items);
      }

      setPage(currentPage);
      setTotalPages(pages);
      setTotalCount(total);
    } catch (err) {
      console.error('Error al obtener catálogo de videos:', err);
      setError('No se pudo conectar con el servidor EC2 de FastAPI. Verifica que la API esté activa.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos(1, false);
  }, [searchQuery, refreshKey]);

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchVideos(page + 1, true);
    }
  };

  return (
    <HomeTemplate
      searchQuery={searchQuery}
      videos={videos}
      loading={loading}
      loadingMore={loadingMore}
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      error={error}
      onRefresh={() => fetchVideos(1, false)}
      onLoadMore={handleLoadMore}
      onSelectVideo={onSelectVideo}
      onOpenUpload={onOpenUpload}
    />
  );
};

export default HomePage;
