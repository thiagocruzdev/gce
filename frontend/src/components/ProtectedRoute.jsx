import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { usuario, carregando, temPermissao } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Carregando sessão...</div>
        <p>Verificando credenciais de acesso</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !temPermissao(allowedRoles)) {
    return (
      <div className="view-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
        <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '8px' }}>
          Acesso Restrito ao Perfil
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.6' }}>
          Seu perfil atual é <strong>{usuario.role}</strong> ({usuario.nome}).<br />
          Esta funcionalidade é exclusiva para os perfis: <strong>{allowedRoles.join(', ')}</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {usuario.role === 'CLIENTE' && (
            <Link to="/agendamentos" className="btn btn-primary">
              Ir para Meus Agendamentos
            </Link>
          )}
          {usuario.role === 'COLABORADOR' && (
            <Link to="/agendamentos" className="btn btn-primary">
              Ir para Minha Agenda
            </Link>
          )}
          {usuario.role === 'PROPRIETARIO' && (
            <Link to="/" className="btn btn-primary">
              Ir para o Painel Principal
            </Link>
          )}
        </div>
      </div>
    );
  }

  return children;
}
