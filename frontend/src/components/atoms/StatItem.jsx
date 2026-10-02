import React from 'react';

export const StatItem = ({ icon: Icon, value, label, className = '' }) => {
  return (
    <span className={`stat-item ${className}`.trim()}>
      {Icon && <Icon size={14} className="stat-icon" />}
      {value !== undefined && value !== null && <span>{value} </span>}
      {label && <span>{label}</span>}
    </span>
  );
};
