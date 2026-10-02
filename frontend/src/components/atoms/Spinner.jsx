import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 24, text = '', className = '' }) => {
  return (
    <div className={`spinner-wrapper ${className}`.trim()}>
      <Loader2 size={size} className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};
