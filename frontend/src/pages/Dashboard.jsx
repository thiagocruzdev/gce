import React, { useEffect, useState } from 'react';
import { getClientes, getAgendamentos, getServicos, getVendas } from '../services/api';

export default function Dashboard({ setTelaAtual }) {
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);
  const [ultimasVendas, setUltimasVendas] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [clientes, agendamentos, servicos, vendas] = await Promise.all([
        getClientes().catch(() => []),
        getAgendamentos().catch(() => []),
        getServicos().catch(() => []),
        getVendas().catch(() => [])
      ]);

      setTotalClientes(clientes.length || 0);
      setTotalAgendamentos(agendamentos.length || 0);
      setTotalServicos(servicos.length || 0);

      const somaVendas = (vendas || []).reduce((acc, v) => acc + (v.valor_final || 0), 0);
      setTotalVendas(somaVendas);

      setUltimosAgendamentos((agendamentos || []).slice(0, 5));
      setUltimasVendas((vendas || []).slice(0, 5));
    } catch (erro) {
      console.log('Erro ao carregar dashboard:', erro);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Painel Principal</h2>
          <p>Visão geral de atendimentos, clientes e faturamento da clínica</p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-card-label">Clientes Cadastrados</div>
          <div className="metric-card-value">{totalClientes}</div>
          <div className="metric-card-sub">Base ativa de clientes</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Agendamentos</div>
          <div className="metric-card-value">{totalAgendamentos}</div>
          <div className="metric-card-sub">Horários registrados</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Serviços Oferecidos</div>
          <div className="metric-card-value">{totalServicos}</div>
          <div className="metric-card-sub">Procedimentos no catálogo</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Faturamento Total</div>
          <div className="metric-card-value">
            R$ {Number(totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-card-sub">Receita acumulada</div>
        </div>
      </div>

      {/* Tabela de Próximos Agendamentos */}
      <div className="table-card">
        <div className="table-header-box">
          <h3>Próximos Agendamentos</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setTelaAtual('agendamentos')}>
            Ver todos
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimosAgendamentos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">Nenhum agendamento registrado ainda.</td>
                </tr>
              ) : (
                ultimosAgendamentos.map((item) => {
                  const statusClass = (item.status || '').toLowerCase();
                  return (
                    <tr key={item.id}>
                      <td>{item.data_marcada ? new Date(item.data_marcada).toLocaleDateString('pt-BR') : '-'}</td>
                      <td><strong>{item.hora_inicio || '-'}</strong></td>
                      <td>{item.cliente?.pessoa?.nome || 'Cliente'}</td>
                      <td>{item.servico?.nome || 'Serviço'}</td>
                      <td>{item.colaborador?.pessoa?.nome || 'Profissional'}</td>
                      <td>
                        <span className={`badge badge-${statusClass}`}>
                          {item.status || 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Últimas Vendas */}
      <div className="table-card">
        <div className="table-header-box">
          <h3>Últimas Vendas &amp; Faturamentos</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => setTelaAtual('vendas')}>
            Ver todas
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Profissional</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVendas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty">Nenhuma venda registrada ainda.</td>
                </tr>
              ) : (
                ultimasVendas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{v.cliente?.pessoa?.nome || 'Cliente'}</td>
                    <td>{v.colaborador?.pessoa?.nome || 'Profissional'}</td>
                    <td><strong>R$ {Number(v.valor_final || 0).toFixed(2)}</strong></td>
                    <td>
                      <span className="badge badge-pago">
                        {v.status || 'Pago'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
