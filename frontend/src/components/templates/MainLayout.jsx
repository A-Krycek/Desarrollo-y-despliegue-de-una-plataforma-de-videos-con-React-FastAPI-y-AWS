import React from 'react';
import { Navbar } from '../organisms/Navbar';

export const MainLayout = ({
  currentPage,
  setCurrentPage,
  onSearch,
  onOpenUpload,
  children,
}) => {
  return (
    <div className="app-layout">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onSearch={onSearch}
        onOpenUpload={onOpenUpload}
      />
      <main className="app-main-content">
        {children}
      </main>
      <footer className="app-footer">
        <div className="footer-container">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Plataforma de Videos. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
