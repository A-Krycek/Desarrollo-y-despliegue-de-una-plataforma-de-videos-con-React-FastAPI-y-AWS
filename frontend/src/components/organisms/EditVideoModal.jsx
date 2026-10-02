import React, { useState, useEffect, useCallback } from 'react';
import { updateVideo } from '../../api/client';
import { Edit3 } from 'lucide-react';
import { Button, Alert, Input, Textarea } from '../atoms';
import { ModalHeader, FormField } from '../molecules';

export const EditVideoModal = ({ video, isOpen, onClose, onUpdateSuccess }) => {
  // Declarar todos los hooks incondicionalmente al inicio (Rules of Hooks)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sincronizar campos cuando cambia el video
  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setError(null);
    }
  }, [video]);

  // Cerrar con Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    },
    [saving, onClose]
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

  // Si no está abierto o no hay video, retornar null después de los hooks
  if (!isOpen || !video) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await updateVideo(video.id, {
        title: title.trim(),
        description: description.trim(),
      });
      if (onUpdateSuccess) onUpdateSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Error al actualizar video:', err);
      setError('No se pudo actualizar el video. Verifica tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="modal-container">
        <ModalHeader
          id="edit-modal-title"
          title="Editar información del video"
          icon={Edit3}
          onClose={onClose}
          disabled={saving}
        />

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit} className="modal-form">
          <FormField id="edit-title" label="Título del video" required>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              required
            />
          </FormField>

          <FormField id="edit-desc" label="Descripción">
            <Textarea
              id="edit-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
          </FormField>

          <div className="modal-footer">
            <Button
              variant="cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="modal-submit"
              loading={saving}
              disabled={saving || !title.trim()}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
