import React from 'react';

export const Avatar = ({
  name = 'U',
  size = 'md',
  className = '',
}) => {
  const initial = (name || 'U').charAt(0).toUpperCase();

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'comment-avatar-small';
      case 'md': return 'author-avatar-badge';
      case 'lg': return 'author-avatar-large';
      case 'circle': return 'avatar-circle';
      case 'profile': return 'profile-avatar-large';
      case 'form': return 'comment-avatar';
      default: return 'author-avatar-badge';
    }
  };

  return (
    <div className={`${getSizeClass()} ${className}`.trim()}>
      {initial}
    </div>
  );
};
