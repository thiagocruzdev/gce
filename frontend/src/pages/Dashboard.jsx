import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClientes, getAgendamentos, getServicos, getVendas } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { ehProprietario, ehColaborador, usuario } = useAuth();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [totalServicos, setTotalServicos] = useState(0);
  const [totalVendas, setTotalVendas] = useState(0);
  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);
  const [ultimasVendas, setUltimasVendas] = useState([]);

  useEffect(() => {
    carregarDados();
  }, [ehProprietario, ehColaborador, usuario]);

  async function carregarDados() {
    try {
      const promessas = [
        getClientes().catch(() => []),
        getAgendamentos(ehColaborador && usuario?.id_pessoa ? { id_colaborador: usuario.id_pessoa } : {}).catch(() => []),
        getServicos().catch(() => [])
      ];

      if (ehProprietario) {
        promessas.push(getVendas().catch(() => []));
      }

      const resultados = await Promise.all(promessas);
      const clientes = resultados[0] || [];
      const agendamentos = resultados[1] || [];
      const servicos = resultados[2] || [];
      const vendas = ehProprietario ? (resultados[3] || []) : [];

      setTotalClientes(clientes.length || 0);
      setTotalAgendamentos(agendamentos.length || 0);
      setTotalServicos(servicos.length || 0);

      if (ehProprietario) {
        const somaVendas = vendas.reduce((acc, v) => acc + (v.valor_final || 0), 0);
        setTotalVendas(somaVendas);
        setUltimasVendas(vendas.slice(0, 5));
      }

      setUltimosAgendamentos(agendamentos.slice(0, 5));
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

      <div className="metric-cards-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/clientes')}>
          <div className="metric-card-label">Clientes Cadastrados</div>
          <div className="metric-card-value">{totalClientes}</div>
          <div className="metric-card-sub">Base ativa de clientes &rarr;</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/agendamentos')}>
          <div className="metric-card-label">Agendamentos</div>
          <div className="metric-card-value">{totalAgendamentos}</div>
          <div className="metric-card-sub">Horários registrados &rarr;</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/servicos')}>
          <div className="metric-card-label">Serviços Oferecidos</div>
          <div className="metric-card-value">{totalServicos}</div>
          <div className="metric-card-sub">Procedimentos no catálogo &rarr;</div>
        </div>

        {ehProprietario && (
          <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/vendas')}>
            <div className="metric-card-label">Faturamento Total</div>
            <div className="metric-card-value">
              R$ {Number(totalVendas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="metric-card-sub">Receita acumulada &rarr;</div>
          </div>
        )}
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <h3>Próximos Agendamentos</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/agendamentos')}>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ultimosAgendamentos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhum agendamento registrado ainda.</td>
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
                      <td>
                        <button
                          className="btn-ver"
                          onClick={() => navigate(`/agendamentos/${item.id}`)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ehProprietario && (
        <div className="table-card">
          <div className="table-header-box">
            <h3>Últimas Vendas &amp; Faturamentos</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/vendas')}>
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ultimasVendas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="table-empty">Nenhuma venda registrada ainda.</td>
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
                      <td>
                        <button
                          className="btn-ver"
                          onClick={() => navigate(`/vendas/${v.id}`)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
