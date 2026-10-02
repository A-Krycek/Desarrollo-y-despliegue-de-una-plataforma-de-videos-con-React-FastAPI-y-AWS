import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const Alert = ({ type = 'error', message, detail, className = '' }) => {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={`alert-box ${isError ? 'alert-error' : isSuccess ? 'alert-success' : 'alert-info'} ${className}`.trim()}>
      {isError && <AlertCircle size={18} style={{ flexShrink: 0 }} />}
      {isSuccess && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
      {!isError && !isSuccess && <Info size={18} style={{ flexShrink: 0 }} />}
      <div>
        <span>{message}</span>
        {detail && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>{detail}</p>}
      </div>
    </div>
  );
};
