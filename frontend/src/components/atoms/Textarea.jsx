import React from 'react';

export const Textarea = ({
  id,
  placeholder = '',
  value,
  onChange,
  rows = 3,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      className={`form-textarea ${className}`.trim()}
      {...props}
    />
  );
};
