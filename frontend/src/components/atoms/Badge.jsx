import React from 'react';

export const Badge = ({
  children,
  variant = 'count', // 'count' | 'hero' | 'footer'
  icon: Icon = null,
  className = '',
}) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'count': return 'catalog-count-badge';
      case 'hero': return 'hero-badge';
      case 'footer': return 'footer-badge';
      default: return 'badge';
    }
  };

  return (
    <span className={`${getBadgeClass()} ${className}`.trim()}>
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
};
