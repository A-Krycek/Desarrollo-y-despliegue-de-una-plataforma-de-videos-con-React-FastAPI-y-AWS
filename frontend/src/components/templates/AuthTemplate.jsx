import React from 'react';
import { LogIn, UserPlus, User, Mail, Lock } from 'lucide-react';
import { Button, Alert, Input } from '../atoms';
import { FormField } from '../molecules';

export const AuthTemplate = ({
  isLoginMode,
  onToggleMode,
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  loading = false,
  error = null,
  successMsg = null,
}) => {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* ENCABEZADO DE TARJETA */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            {isLoginMode ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="auth-title">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear una Cuenta'}
          </h1>
          <p className="auth-subtitle">
            {isLoginMode
              ? 'Accede a tu cuenta para publicar y gestionar videos'
              : 'Únete a nuestra plataforma de videos desplegada en AWS'}
          </p>
        </div>

        {/* PESTAÑAS (TABS) */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLoginMode ? 'active' : ''}`}
            onClick={() => onToggleMode(true)}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLoginMode ? 'active' : ''}`}
            onClick={() => onToggleMode(false)}
          >
            Registro
          </button>
        </div>

        {/* MENSAJES DE ALERTA */}
        <Alert type="error" message={error} />
        <Alert type="success" message={successMsg} />

        {/* FORMULARIO */}
        <form onSubmit={onSubmit} className="auth-form">
          {!isLoginMode && (
            <FormField id="auth-name" label="Nombre Completo" required icon={User}>
              <Input
                id="auth-name"
                placeholder="Tu Nombre y Apellido"
                hasIcon={true}
                value={name}
                onChange={onNameChange}
                disabled={loading}
                required
              />
            </FormField>
          )}

          <FormField id="auth-email" label="Correo Electrónico" required icon={Mail}>
            <Input
              id="auth-email"
              type="email"
              placeholder="ejemplo@correo.com"
              hasIcon={true}
              value={email}
              onChange={onEmailChange}
              disabled={loading}
              required
            />
          </FormField>

          <FormField id="auth-password" label="Contraseña" required icon={Lock}>
            <Input
              id="auth-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              hasIcon={true}
              value={password}
              onChange={onPasswordChange}
              disabled={loading}
              required
            />
          </FormField>

          <Button
            type="submit"
            variant="submit"
            disabled={loading}
            loading={loading}
          >
            {isLoginMode ? 'Entrar a la plataforma' : 'Crear mi cuenta'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            {isLoginMode ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta registrada?'}
            {' '}
            <button
              type="button"
              className="btn-toggle-link"
              onClick={() => onToggleMode(!isLoginMode)}
            >
              {isLoginMode ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
