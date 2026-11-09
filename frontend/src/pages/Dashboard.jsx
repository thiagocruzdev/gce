import React, { useEffect, useState } from 'react';
import { getClientes, getAgendamentos, getServicos, getProdutos, getVendas } from '../services/api';

export default function Dashboard({ setTelaAtual }) {
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const clientes = await getClientes();
      const agendamentos = await getAgendamentos();
      const servicos = await getServicos();
      const produtos = await getProdutos();
      const vendas = await getVendas();

      setTotalClientes(clientes.length || 0);
      setTotalAgendamentos(agendamentos.length || 0);
      setTotalServicos(servicos.length || 0);
      setTotalProdutos(produtos.length || 0);

      let somaVendas = 0;
      for (let i = 0; i < vendas.length; i++) {
        somaVendas += vendas[i].valor_final || 0;
      }
      setTotalVendas(somaVendas);

      setUltimosAgendamentos(agendamentos.slice(0, 5));
    } catch (erro) {
      console.log('Erro ao carregar dados:', erro);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Visão Geral da Clínica</h2>
      </div>

      <div className="cards">
        <div className="card">
          <h3>{totalClientes}</h3>
          <p>Clientes Cadastrados</p>
        </div>
        <div className="card">
          <h3>{totalAgendamentos}</h3>
          <p>Agendamentos Feitos</p>
        </div>
        <div className="card">
          <h3>{totalServicos}</h3>
          <p>Serviços Oferecidos</p>
        </div>
        <div className="card">
          <h3>{totalProdutos}</h3>
          <p>Produtos no Estoque</p>
        </div>
        <div className="card">
          <h3>R$ {totalVendas.toFixed(2)}</h3>
          <p>Total em Vendas</p>
        </div>
      </div>

      <div className="tabela-container">
        <div style={{ padding: '15px' }}>
          <h3>Últimos Agendamentos</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Data</th>
              <th>Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ultimosAgendamentos.length === 0 ? (
              <tr>
                <td colSpan="5">Nenhum agendamento encontrado</td>
              </tr>
            ) : (
              ultimosAgendamentos.map((item) => (
                <tr key={item.id}>
                  <td>{item.cliente?.pessoa?.nome || 'Não informado'}</td>
                  <td>{item.servico?.nome || 'Não informado'}</td>
                  <td>{new Date(item.data_marcada).toLocaleDateString('pt-BR')}</td>
                  <td>{item.hora_inicio || '-'}</td>
                  <td>{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
