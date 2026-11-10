import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Colaboradores from './pages/Colaboradores';
import Servicos from './pages/Servicos';
import Produtos from './pages/Produtos';
import Agendamentos from './pages/Agendamentos';
import Vendas from './pages/Vendas';
import PosVenda from './pages/PosVenda';

export default function App() {
  const [telaAtual, setTelaAtual] = useState('inicio');
  const [mensagem, setMensagem] = useState('');

  function exibirMensagem(texto) {
    setMensagem(texto);
    setTimeout(() => {
      setMensagem('');
    }, 3000);
  }

  return (
    <div className="app-layout">
      <Navbar telaAtual={telaAtual} setTelaAtual={setTelaAtual} />

      <main className="app-container">
        {mensagem && (
          <div className="alerta-toast">
            {mensagem}
          </div>
        )}

        {telaAtual === 'inicio' && <Dashboard setTelaAtual={setTelaAtual} />}
        {telaAtual === 'agendamentos' && <Agendamentos setMensagem={exibirMensagem} />}
        {telaAtual === 'clientes' && <Clientes setMensagem={exibirMensagem} />}
        {telaAtual === 'colaboradores' && <Colaboradores setMensagem={exibirMensagem} />}
        {telaAtual === 'servicos' && <Servicos setMensagem={exibirMensagem} />}
        {telaAtual === 'produtos' && <Produtos setMensagem={exibirMensagem} />}
        {telaAtual === 'vendas' && <Vendas setMensagem={exibirMensagem} />}
        {telaAtual === 'posvenda' && <PosVenda setMensagem={exibirMensagem} />}
      </main>

      <footer className="footer-simples">
        Renata Faveri &bull; Beauty &amp; Academy &bull; Sistema de Gestão Estética
      </footer>
    </div>
  );
}
