import React from 'react';

export const FormField = ({
  id,
  label,
  required = false,
  icon: Icon = null,
  error = null,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id}>
          {label} {required && <span className="text-primary">*</span>}
        </label>
      )}
      {Icon ? (
        <div className="input-with-icon">
          <Icon size={18} className="field-icon" />
          {children}
        </div>
      ) : (
        children
      )}
      {error && <span className="field-error-text">{error}</span>}
    </div>
  );
};
