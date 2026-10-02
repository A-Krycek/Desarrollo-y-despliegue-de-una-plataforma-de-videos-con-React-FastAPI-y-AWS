import React, { useState, useEffect, useCallback } from 'react';
import {
  uploadVideo,
  getPresignedUploadUrls,
  uploadFileDirectToS3,
  registerDirectVideo,
} from '../../api/client';
import { Upload, FileVideo, Image as ImageIcon } from 'lucide-react';
import { Button, Alert, Input, Textarea } from '../atoms';
import { ModalHeader, FormField } from '../molecules';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !uploading) {
        onClose();
      }
    },
    [uploading, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.mp4')) {
      setError('Formato de video inválido. Solo se admiten archivos .MP4.');
      e.target.value = '';
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El tamaño del video excede el límite máximo permitido de 100 MB.');
      e.target.value = '';
      return;
    }

    setVideoFile(file);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }

    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Formato de imagen inválido. Solo se admiten imágenes JPG, JPEG o PNG.');
      e.target.value = '';
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Por favor ingresa un título para el video.');
      return;
    }

    if (!videoFile) {
      setError('Por favor selecciona un archivo de video MP4.');
      return;
    }

    if (!thumbnailFile) {
      setError('Por favor selecciona una miniatura (JPG, JPEG o PNG).');
      return;
    }

    try {
      setUploading(true);
      setProgress(5);

      const videoExt = '.' + (videoFile.name.split('.').pop() || 'mp4').toLowerCase();
      const thumbExt = '.' + (thumbnailFile.name.split('.').pop() || 'jpg').toLowerCase();

      const presigned = await getPresignedUploadUrls(videoExt, thumbExt);
      let newVideo;

      if (presigned?.video?.direct_s3 && presigned?.video?.upload_url) {

        await uploadFileDirectToS3(
          presigned.video.upload_url,
          videoFile,
          'video/mp4',
          (pct) => setProgress(Math.round(pct * 0.7))
        );

        const thumbType = thumbnailFile.type || 'image/jpeg';
        await uploadFileDirectToS3(
          presigned.thumbnail.upload_url,
          thumbnailFile,
          thumbType,
          (pct) => setProgress(70 + Math.round(pct * 0.25))
        );

        setProgress(98);

        newVideo = await registerDirectVideo({
          title: title.trim(),
          description: description.trim(),
          video_key: presigned.video.key,
          thumbnail_key: presigned.thumbnail.key,
        });
      } else {

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('file', videoFile);
        formData.append('thumbnail', thumbnailFile);

        newVideo = await uploadVideo(formData, (percent) => {
          setProgress(percent);
        });
      }

      setProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setUploading(false);
        resetForm();
        if (onUploadSuccess) onUploadSuccess(newVideo);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error al subir video a S3/EC2:', err);
      const detail = err.response?.data?.detail || 'Error al procesar la subida del video.';
      setError(detail);
      setUploading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      <div className="modal-container">
        <ModalHeader
          id="upload-modal-title"
          title="Publicar nuevo video en AWS"
          icon={Upload}
          onClose={handleClose}
          disabled={uploading}
        />

        <Alert type="error" message={error} />
        {success && (
          <Alert
            type="success"
            message="¡Video y miniatura subidos a S3 y registrados en RDS con éxito!"
          />
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <FormField id="video-title" label="Título del video" required>
            <Input
              id="video-title"
              placeholder="Ej: Tutorial de Despliegue en AWS con FastAPI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              required
            />
          </FormField>

          <FormField id="video-desc" label="Descripción">
            <Textarea
              id="video-desc"
              placeholder="Escribe una breve descripción del contenido..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </FormField>
<div className="form-group">
            <label className="file-drop-label" htmlFor="video-file-input">
              <span className="file-label-title">Archivo de Video (MP4) *</span>
              <span className="file-label-subtitle">Bucket S3 Videos · Máximo 100 MB</span>
            </label>
            <div className={`file-upload-box ${videoFile ? 'has-file' : ''}`}>
              <FileVideo size={32} className="upload-box-icon" />
              {videoFile ? (
                <div className="file-info-selected">
                  <span className="file-name">{videoFile.name}</span>
                  <span className="file-size">
                    ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="file-prompt">
                  <p>Arrastra tu archivo MP4 aquí o haz clic para examinar</p>
                  <span>Solo archivos con extensión .mp4</span>
                </div>
              )}
              <input
                id="video-file-input"
                type="file"
                accept=".mp4,video/mp4"
                onChange={handleVideoChange}
                disabled={uploading}
                className="hidden-file-input"
                aria-label="Seleccionar archivo de video MP4"
              />
            </div>
          </div>
<div className="form-group">
            <label className="file-drop-label" htmlFor="thumbnail-file-input">
              <span className="file-label-title">Miniatura de portada *</span>
              <span className="file-label-subtitle">Bucket S3 Miniaturas · Formatos JPG, JPEG o PNG</span>
            </label>
            <div className={`file-upload-box ${thumbnailFile ? 'has-file' : ''}`}>
              {thumbnailPreview ? (
                <div className="thumbnail-preview-wrap">
                  <img
                    src={thumbnailPreview}
                    alt="Preview miniatura"
                    className="preview-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="preview-filename">{thumbnailFile.name}</span>
                </div>
              ) : (
                <>
                  <ImageIcon size={32} className="upload-box-icon" />
                  <div className="file-prompt">
                    <p>Haz clic para subir la miniatura de portada</p>
                    <span>Formatos admitidos: JPG, JPEG, PNG</span>
                  </div>
                </>
              )}
              <input
                id="thumbnail-file-input"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleThumbnailChange}
                disabled={uploading}
                className="hidden-file-input"
                aria-label="Seleccionar miniatura de imagen"
              />
            </div>
          </div>
{uploading && (
            <div className="progress-section" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-labels">
                <span>Subiendo archivos a Amazon S3...</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
<div className="modal-footer">
            <Button
              variant="cancel"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="modal-submit"
              disabled={uploading || !videoFile || !thumbnailFile || !title.trim()}
              loading={uploading}
              icon={Upload}
            >
              {uploading ? `Subiendo (${progress}%)...` : 'Publicar Video en S3'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
