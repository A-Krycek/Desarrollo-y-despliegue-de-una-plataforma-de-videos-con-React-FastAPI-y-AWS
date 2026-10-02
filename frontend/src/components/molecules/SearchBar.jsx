import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../atoms';

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar videos por título o descripción...',
  className = '',
}) => {
  return (
    <form className={`navbar-search ${className}`.trim()} onSubmit={onSubmit} role="search">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="search-input"
          aria-label="Buscar videos por título o descripción"
        />
      </div>
      <Button type="submit" variant="primary" className="search-button" aria-label="Ejecutar búsqueda">
        Buscar
      </Button>
    </form>
  );
};
