import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../atoms';

export const HeroBanner = ({ onOpenUpload }) => {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot-live" /> AWS Cloud Video Architecture
        </div>
        <h1 className="hero-title">
          Plataforma de Streaming en la Nube
        </h1>
        <p className="hero-description">
          Videos almacenados en <strong>Amazon S3</strong>, procesamiento con <strong>FastAPI en EC2</strong> y base de datos relacional en <strong>Amazon RDS</strong>.
        </p>
      </div>
      <div className="hero-actions">
        <Button
          variant="hero"
          onClick={onOpenUpload}
          icon={Upload}
        >
          Publicar Video
        </Button>
      </div>
    </section>
  );
};
