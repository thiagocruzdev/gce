import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { usuario, carregando, temPermissao } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !temPermissao(allowedRoles)) {
    return (
      <div className="view-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '8px' }}>
          Acesso Restrito
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Seu perfil não possui permissão para acessar esta página.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/agendamentos" className="btn btn-primary">
            Ir para Agendamentos
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
