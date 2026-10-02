import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AuthTemplate } from '../components/templates';

export const AuthPage = ({ onAuthSuccess }) => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isLoginMode && !name.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      if (isLoginMode) {
        await login(email, password);
        setSuccessMsg('¡Sesión iniciada con éxito!');
      } else {
        await register(name.trim(), email, password);
        setSuccessMsg('¡Cuenta creada y sesión iniciada con éxito!');
      }

      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 700);
    } catch (err) {
      console.error('Error de autenticación:', err);
      const detail = err.response?.data?.detail || 'Error en las credenciales. Verifica los datos ingresados.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthTemplate
      isLoginMode={isLoginMode}
      onToggleMode={(mode) => {
        setIsLoginMode(mode);
        setError(null);
      }}
      name={name}
      onNameChange={(e) => setName(e.target.value)}
      email={email}
      onEmailChange={(e) => setEmail(e.target.value)}
      password={password}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      successMsg={successMsg}
    />
  );
};

export default AuthPage;
