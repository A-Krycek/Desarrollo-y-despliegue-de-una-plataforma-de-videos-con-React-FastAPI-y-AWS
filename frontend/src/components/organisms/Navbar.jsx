import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Video, Home, Upload, LogOut, User } from 'lucide-react';
import { Button, Avatar } from '../atoms';
import { SearchBar } from '../molecules';

export const Navbar = ({ currentPage, setCurrentPage, onSearch, onOpenUpload }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '' && onSearch) {
      onSearch('');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
<div
          className="navbar-brand"
          onClick={() => setCurrentPage('home')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCurrentPage('home');
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="CloudTube Inicio"
        >
          <div className="logo-badge">
            <Video size={24} className="logo-icon" aria-hidden="true" />
          </div>
          <div className="brand-text">
            <span className="brand-title">CloudTube</span>
            <span className="brand-subtitle">AWS S3 · EC2 · RDS</span>
          </div>
        </div>
<SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
        />
<nav className="navbar-actions" aria-label="Navegación principal">
          <Button
            variant="nav"
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => setCurrentPage('home')}
            title="Página Principal"
            aria-label="Ir a página de inicio"
            icon={Home}
          >
            <span className="button-text">Inicio</span>
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                variant="nav"
                className="btn-upload"
                onClick={onOpenUpload}
                title="Publicar nuevo video"
                aria-label="Publicar nuevo video"
                icon={Upload}
              >
                <span className="button-text">Publicar</span>
              </Button>

              <Button
                variant="nav"
                className={`btn-profile ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => setCurrentPage('profile')}
                title="Mi Perfil y Gestión de Videos"
                aria-label={`Ver perfil de ${user.name}`}
              >
                <Avatar name={user.name} size="circle" />
                <span className="button-text user-name-truncate">{user.name}</span>
              </Button>

              <Button
                variant="nav"
                className="btn-logout"
                onClick={() => {
                  logout();
                  setCurrentPage('home');
                }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                icon={LogOut}
              />
            </>
          ) : (
            <Button
              variant="primary"
              className={currentPage === 'auth' ? 'active' : ''}
              onClick={() => setCurrentPage('auth')}
              aria-label="Iniciar sesión o registrarse"
              icon={User}
            >
              <span className="button-text">Acceder / Registro</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
