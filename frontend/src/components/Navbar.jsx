import React from 'react';

export default function Navbar({ telaAtual, setTelaAtual }) {
  return (
    <div>
      <header>
        <h1>Clínica Estética - Sistema de Gestão</h1>
        <span>Usuário</span>
      </header>
      <nav>
        <button
          className={telaAtual === 'inicio' ? 'ativo' : ''}
          onClick={() => setTelaAtual('inicio')}
        >
          Início
        </button>
        <button
          className={telaAtual === 'clientes' ? 'ativo' : ''}
          onClick={() => setTelaAtual('clientes')}
        >
          Clientes
        </button>
        <button
          className={telaAtual === 'colaboradores' ? 'ativo' : ''}
          onClick={() => setTelaAtual('colaboradores')}
        >
          Colaboradores
        </button>
        <button
          className={telaAtual === 'servicos' ? 'ativo' : ''}
          onClick={() => setTelaAtual('servicos')}
        >
          Serviços
        </button>
        <button
          className={telaAtual === 'produtos' ? 'ativo' : ''}
          onClick={() => setTelaAtual('produtos')}
        >
          Produtos
        </button>
        <button
          className={telaAtual === 'agendamentos' ? 'ativo' : ''}
          onClick={() => setTelaAtual('agendamentos')}
        >
          Agendamentos
        </button>
        <button
          className={telaAtual === 'vendas' ? 'ativo' : ''}
          onClick={() => setTelaAtual('vendas')}
        >
          Vendas
        </button>
        <button
          className={telaAtual === 'posvenda' ? 'ativo' : ''}
          onClick={() => setTelaAtual('posvenda')}
        >
          Pós-Venda
        </button>
      </nav>
    </div>
  );
}
