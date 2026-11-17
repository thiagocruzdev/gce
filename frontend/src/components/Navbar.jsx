import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import iconeImg from '../images/icone.jpeg';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, fazerLogout, ehProprietario, ehColaborador, ehCliente } = useAuth();

  // Definição dos menus com base no perfil de acesso
  let menus = [];

  if (!usuario) {
    menus = [
      { path: '/login', label: 'Entrar', match: (p) => p === '/login' }
    ];
  } else if (ehCliente) {
    // Cliente: consulta e realiza os próprios agendamentos + consulta catálogo de serviços
    menus = [
      { path: '/agendamentos', label: 'Meus Agendamentos', match: (p) => p.startsWith('/agendamentos') },
      { path: '/agendamentos/novo', label: '+ Novo Agendamento', match: (p) => p === '/agendamentos/novo' },
      { path: '/servicos', label: 'Catálogo de Serviços', match: (p) => p.startsWith('/servicos') }
    ];
  } else if (ehColaborador) {
    // Colaborador: consulta agendamentos feitos e a fazer + clientes + procedimentos
    menus = [
      { path: '/', label: 'Início', match: (p) => p === '/' },
      { path: '/agendamentos', label: 'Minha Agenda', match: (p) => p.startsWith('/agendamentos') },
      { path: '/clientes', label: 'Clientes', match: (p) => p.startsWith('/clientes') },
      { path: '/servicos', label: 'Serviços', match: (p) => p.startsWith('/servicos') },
      { path: '/produtos', label: 'Produtos', match: (p) => p.startsWith('/produtos') }
    ];
  } else {
    // Proprietário: administra tudo + relatórios
    menus = [
      { path: '/', label: 'Início', match: (p) => p === '/' },
      { path: '/agendamentos', label: 'Agendamentos', match: (p) => p.startsWith('/agendamentos') },
      { path: '/clientes', label: 'Clientes', match: (p) => p.startsWith('/clientes') },
      { path: '/colaboradores', label: 'Colaboradores', match: (p) => p.startsWith('/colaboradores') },
      { path: '/servicos', label: 'Serviços', match: (p) => p.startsWith('/servicos') },
      { path: '/produtos', label: 'Produtos', match: (p) => p.startsWith('/produtos') },
      { path: '/vendas', label: 'Vendas', match: (p) => p.startsWith('/vendas') },
      { path: '/posvenda', label: 'Pós-Venda', match: (p) => p.startsWith('/posvenda') },
      { path: '/relatorios', label: '📊 Relatórios', match: (p) => p.startsWith('/relatorios') }
    ];
  }

  function getBadgePerfil() {
    if (!usuario) return null;
    const r = (usuario.role || '').toUpperCase();
    if (r === 'PROPRIETARIO') {
      return <span className="badge badge-confirmado" style={{ fontSize: '11px' }}>👑 Proprietário</span>;
    }
    if (r === 'COLABORADOR') {
      return <span className="badge badge-pendente" style={{ fontSize: '11px' }}>💼 Colaborador</span>;
    }
    return <span className="badge badge-pago" style={{ fontSize: '11px' }}>💆‍♀️ Cliente</span>;
  }

  return (
    <header className="navbar-topo">
      <div className="navbar-inner" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/" className="navbar-logo">
          <img
            src={iconeImg}
            alt="Ícone Renata Faveri"
            className="navbar-icone-img"
          />
          <div className="logo-texto">
            <h1>Renata Faveri</h1>
            <span>Beauty &amp; Academy</span>
          </div>
        </Link>

        <nav className="navbar-menu" style={{ flexWrap: 'wrap' }}>
          {menus.map((m) => {
            const isActive = m.match(location.pathname);
            return (
              <Link
                key={m.path}
                to={m.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        {/* ÁREA DO USUÁRIO LOGADO / SAIR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {usuario ? (
            <>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {usuario.nome}
                </span>
                {getBadgePerfil()}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  fazerLogout();
                  navigate('/login');
                }}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
