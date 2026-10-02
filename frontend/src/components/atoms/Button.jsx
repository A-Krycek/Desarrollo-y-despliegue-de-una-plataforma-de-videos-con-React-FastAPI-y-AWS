import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  'secondary-sm': 'btn-secondary-sm',
  hero: 'btn-hero-primary',
  danger: 'btn-danger',
  cancel: 'btn-cancel',
  refresh: 'btn-refresh',
  submit: 'btn-auth-submit',
  'comment-submit': 'btn-submit-comment',
  'modal-submit': 'btn-primary btn-submit-modal',
  back: 'btn-back',
  share: 'btn-share',
  close: 'btn-close-modal',
  nav: 'nav-button',
};

export const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  title = '',
  'aria-label': ariaLabel,
  icon: Icon = null,
  ...props
}) => {
  const variantClass = VARIANTS[variant] ?? variant;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${className}`.trim()}
      title={title}
      aria-label={ariaLabel || title || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="spinner" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
};
