import React from 'react';
import { HardDrive, Server, Database, Cloud } from 'lucide-react';
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
      {/* NAVBAR ORGANISM */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onSearch={onSearch}
        onOpenUpload={onOpenUpload}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="app-main-content">
        {children}
      </main>

      {/* PIE DE PÁGINA CON ARQUITECTURA AWS */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-badges">
            <span className="footer-badge">
              <HardDrive size={14} /> S3 Frontend (SPA)
            </span>
            <span className="footer-badge">
              <Server size={14} /> EC2 (FastAPI)
            </span>
            <span className="footer-badge">
              <Database size={14} /> Amazon RDS (DB)
            </span>
            <span className="footer-badge">
              <Cloud size={14} /> S3 Media (Videos & Miniaturas)
            </span>
          </div>
          <p className="footer-copyright">
            Plataforma de Videos Cloud · Arquitectura Serverless & Cloud AWS
          </p>
        </div>
      </footer>
    </div>
  );
};
