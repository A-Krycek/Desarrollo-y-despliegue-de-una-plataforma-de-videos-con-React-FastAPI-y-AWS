import React from 'react';
import { Mail, Calendar, Film } from 'lucide-react';
import { Avatar, StatItem } from '../atoms';

export const UserProfileCard = ({ user }) => {
  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="profile-card">
      <div className="profile-header-info">
        <Avatar name={user.name} size="profile" />
        <div className="profile-text-details">
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-meta-row">
            <span className="profile-meta-item">
              <Mail size={16} />
              {user.email}
            </span>
            <span className="meta-dot">•</span>
            <span className="profile-meta-item">
              <Calendar size={16} />
              Miembro desde {formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stat-box">
        <div className="stat-number">{user.video_count || 0}</div>
        <div className="stat-label">
          <Film size={14} className="stat-icon-inline" /> Videos Publicados
        </div>
      </div>
    </div>
  );
};
