// ==========================================
// ARQUITECTURA ATÓMICA - EXPORTACIONES
// ==========================================

// Átomos
export * from './atoms';

// Moléculas
export * from './molecules';

// Organismos
export * from './organisms';

// Plantillas (Templates)
export * from './templates';

// Compatibilidad hacia atrás para importaciones directas de componentes legacy
export { Navbar } from './organisms/Navbar';
export { VideoCard } from './organisms/VideoCard';
export { VideoPlayerSection } from './organisms/VideoPlayerSection';
export { CommentSection } from './organisms/CommentSection';
export { RecommendedVideos } from './organisms/RecommendedVideos';
export { UploadModal } from './organisms/UploadModal';
export { EditVideoModal } from './organisms/EditVideoModal';
export { UserVideoList } from './organisms/UserVideoList';
export { HeroBanner } from './organisms/HeroBanner';
