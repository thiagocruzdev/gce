import React from 'react';
import iconeImg from '../images/icone.jpeg';

export default function Navbar({ telaAtual, setTelaAtual }) {
  const menus = [
    { id: 'inicio', label: 'Início' },
    { id: 'agendamentos', label: 'Agendamentos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'colaboradores', label: 'Colaboradores' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'vendas', label: 'Vendas' },
    { id: 'posvenda', label: 'Pós-Venda' }
  ];

  return (
    <header className="navbar-topo">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => setTelaAtual('inicio')}>
          <img
            src={iconeImg}
            alt="Ícone Renata Faveri"
            className="navbar-icone-img"
          />
          <div className="logo-texto">
            <h1>Renata Faveri</h1>
            <span>Beauty &amp; Academy</span>
          </div>
        </div>

        <nav className="navbar-menu">
          {menus.map((m) => (
            <button
              key={m.id}
              className={`nav-link ${telaAtual === m.id ? 'active' : ''}`}
              onClick={() => setTelaAtual(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
