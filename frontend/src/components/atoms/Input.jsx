import React from 'react';

export const Input = ({
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  hasIcon = false,
  ...props
}) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`form-input ${hasIcon ? 'icon-padded' : ''} ${className}`.trim()}
      {...props}
    />
  );
};
