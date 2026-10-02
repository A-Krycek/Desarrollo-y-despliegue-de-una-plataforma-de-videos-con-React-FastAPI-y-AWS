import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms';

export const ModalHeader = ({ id, title, icon: Icon = null, onClose, disabled = false }) => {
  return (
    <div className="modal-header">
      <div className="modal-header-title">
        {Icon && <Icon size={20} className="modal-header-icon" />}
        <h2 id={id}>{title}</h2>
      </div>
      <Button
        variant="close"
        onClick={onClose}
        disabled={disabled}
        title="Cerrar modal"
        aria-label="Cerrar modal"
      >
        <X size={20} />
      </Button>
    </div>
  );
};
