import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

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

const data = (request) => request.then((res) => res.data);

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url}`;
};

export const registerUser = (name, email, password) =>
  data(apiClient.post('/users', { name, email, password }));

export const loginUser = (email, password) =>
  data(apiClient.post('/login', { email, password }));

export const getUserProfile = (id) =>
  data(apiClient.get(`/users/${id}`));

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

export const getPresignedUploadUrls = (videoExt, thumbExt) =>
  data(apiClient.post('/videos/presigned-url', {
    video_ext: videoExt,
    thumb_ext: thumbExt,
  }));

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

export const registerDirectVideo = (payload) =>
  data(apiClient.post('/videos/direct', payload));

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

export const getVideoComments = (videoId, params = {}) =>
  data(apiClient.get(`/videos/${videoId}/comments`, { params }));

export const addVideoComment = (videoId, content) =>
  data(apiClient.post(`/videos/${videoId}/comments`, { content }));
