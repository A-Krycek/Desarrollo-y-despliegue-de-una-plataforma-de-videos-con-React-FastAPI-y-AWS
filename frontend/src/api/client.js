import axios from 'axios';

// La URL base apunta a la IP pública o dominio de la instancia EC2
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para inyectar token JWT automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper conciso para extraer .data de las respuestas
const data = (request) => request.then((res) => res.data);

// Helper para resolver URLs de videos y miniaturas (S3, CloudFront o local)
export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

// ==========================================
// SERVICIOS DE USUARIO
// ==========================================
export const registerUser = (name, email, password) =>
  data(apiClient.post('/users', { name, email, password }));

export const loginUser = (email, password) =>
  data(apiClient.post('/login', { email, password }));

export const getUserProfile = (id) =>
  data(apiClient.get(`/users/${id}`));

// ==========================================
// SERVICIOS DE VIDEOS
// ==========================================
export const getVideos = (params = {}) =>
  data(apiClient.get('/videos', { params }));

export const getVideoById = (id) =>
  data(apiClient.get(`/videos/${id}`));

export const updateVideo = (id, payload) =>
  data(apiClient.put(`/videos/${id}`, payload));

export const deleteVideo = (id) =>
  data(apiClient.delete(`/videos/${id}`));

export const recordVideoView = (id) =>
  data(apiClient.post(`/videos/${id}/views`));

// Solicitar Presigned URLs para subida directa a S3 (Arquitectura Escalable)
export const getPresignedUploadUrls = (videoExt, thumbExt) =>
  data(apiClient.post('/videos/presigned-url', {
    video_ext: videoExt,
    thumb_ext: thumbExt,
  }));

// Subir archivo directamente a Amazon S3 mediante HTTP PUT usando la Presigned URL
export const uploadFileDirectToS3 = (uploadUrl, file, contentType, onProgress) =>
  axios.put(uploadUrl, file, {
    headers: { 'Content-Type': contentType },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

// Registrar metadata en FastAPI y RDS tras subida directa a S3
export const registerDirectVideo = (payload) =>
  data(apiClient.post('/videos/direct', payload));

// Subida tradicional streaming multipart (fallback si no hay S3 configurado)
export const uploadVideo = (formData, onProgress) =>
  data(
    apiClient.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    })
  );

// ==========================================
// SERVICIOS DE COMENTARIOS
// ==========================================
export const getVideoComments = (videoId, params = {}) =>
  data(apiClient.get(`/videos/${videoId}/comments`, { params }));

export const addVideoComment = (videoId, content) =>
  data(apiClient.post(`/videos/${videoId}/comments`, { content }));
