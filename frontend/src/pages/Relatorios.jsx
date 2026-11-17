import React, { useEffect, useState } from 'react';
import {
  getRelatorioMultiTabelas,
  getRelatorioAgrupamentos,
  getRelatorioPivot
} from '../services/api';

export default function Relatorios() {
  const [abaAtiva, setAbaAtiva] = useState('multi');

  const [dadosMulti, setDadosMulti] = useState([]);
  const [totaisMulti, setTotaisMulti] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregandoMulti, setCarregandoMulti] = useState(false);

  const [dadosAgrupamento, setDadosAgrupamento] = useState(null);
  const [carregandoAgrupamento, setCarregandoAgrupamento] = useState(false);

  const [dadosPivot, setDadosPivot] = useState(null);
  const [anoPivot, setAnoPivot] = useState(new Date().getFullYear());
  const [carregandoPivot, setCarregandoPivot] = useState(false);

  useEffect(() => {
    if (abaAtiva === 'multi') {
      carregarMultiTabelas();
    } else if (abaAtiva === 'agrupamento') {
      carregarAgrupamentos();
    } else if (abaAtiva === 'pivot') {
      carregarPivot();
    }
  }, [abaAtiva]);

  async function carregarMultiTabelas() {
    try {
      setCarregandoMulti(true);
      const res = await getRelatorioMultiTabelas({
        status: filtroStatus,
        data_inicio: dataInicio,
        data_fim: dataFim
      });
      setDadosMulti(res.dados || []);
      setTotaisMulti(res.totalizacao || null);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoMulti(false);
    }
  }

  async function carregarAgrupamentos() {
    try {
      setCarregandoAgrupamento(true);
      const res = await getRelatorioAgrupamentos();
      setDadosAgrupamento(res);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoAgrupamento(false);
    }
  }

  async function carregarPivot() {
    try {
      setCarregandoPivot(true);
      const res = await getRelatorioPivot(anoPivot);
      setDadosPivot(res);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoPivot(false);
    }
  }

  function aplicarFiltrosMulti(e) {
    e.preventDefault();
    carregarMultiTabelas();
  }

  function limparFiltrosMulti() {
    setFiltroStatus('');
    setDataInicio('');
    setDataFim('');
    setTimeout(carregarMultiTabelas, 10);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Relatórios</h2>
          <p>Consultas com múltiplas tabelas, totalizações, agrupamentos e matriz Pivot</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={`btn ${abaAtiva === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('multi')}
        >
          Múltiplas Tabelas
        </button>

        <button
          type="button"
          className={`btn ${abaAtiva === 'agrupamento' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('agrupamento')}
        >
          Agrupamentos
        </button>

        <button
          type="button"
          className={`btn ${abaAtiva === 'pivot' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('pivot')}
        >
          Consulta Pivot
        </button>
      </div>

      {abaAtiva === 'multi' && (
        <div>
          {totaisMulti && (
            <div className="metric-cards-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-label">Faturamento Total</div>
                <div className="metric-card-value" style={{ color: 'var(--green-text)' }}>
                  R$ {Number(totaisMulti.total_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-card-sub">
                  Bruto: R$ {Number(totaisMulti.total_bruto || 0).toFixed(2)} | Descontos: R$ {Number(totaisMulti.total_descontos || 0).toFixed(2)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Total de Vendas</div>
                <div className="metric-card-value">{totaisMulti.total_vendas}</div>
                <div className="metric-card-sub">Registros encontrados</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Ticket Médio</div>
                <div className="metric-card-value">
                  R$ {Number(totaisMulti.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-card-sub">Média por venda</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Itens Vendidos</div>
                <div className="metric-card-value">{totaisMulti.total_itens_vendidos}</div>
                <div className="metric-card-sub">Produtos e procedimentos</div>
              </div>
            </div>
          )}

          <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <form onSubmit={aplicarFiltrosMulti} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ minWidth: '150px' }}>
                <label style={{ fontSize: '12px' }}>Status</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="form-group" style={{ minWidth: '150px' }}>
                <label style={{ fontSize: '12px' }}>Data Inicial</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ minWidth: '150px' }}>
                <label style={{ fontSize: '12px' }}>Data Final</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Filtrar
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={limparFiltrosMulti}>
                  Limpar
                </button>
              </div>
            </form>
          </div>

          <div className="table-card">
            <div className="table-header-box">
              <h3>Vendas com Dados em Múltiplas Tabelas</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {dadosMulti.length} registros
              </span>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>Profissional</th>
                    <th>Item Principal</th>
                    <th>Pagamento</th>
                    <th>Avaliação</th>
                    <th>Bruto</th>
                    <th>Desconto</th>
                    <th>Líquido</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {carregandoMulti ? (
                    <tr>
                      <td colSpan="12" className="table-empty">Carregando...</td>
                    </tr>
                  ) : dadosMulti.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="table-empty">Nenhum registro encontrado.</td>
                    </tr>
                  ) : (
                    dadosMulti.map((item) => (
                      <tr key={item.id_venda}>
                        <td>#{item.id_venda}</td>
                        <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                        <td><strong>{item.cliente_nome}</strong></td>
                        <td style={{ fontSize: '12px' }}>{item.cliente_cpf}</td>
                        <td>{item.colaborador_nome}</td>
                        <td>{item.procedimento_principal}</td>
                        <td><span className="badge badge-confirmado">{item.formas_pagamento}</span></td>
                        <td>{item.avaliacao_pos_venda}</td>
                        <td>R$ {item.valor_bruto.toFixed(2)}</td>
                        <td>R$ {item.valor_desconto.toFixed(2)}</td>
                        <td><strong>R$ {item.valor_final.toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge ${item.status === 'Pago' ? 'badge-pago' : 'badge-pendente'}`}>
                            {item.status}
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
      )}

      {abaAtiva === 'agrupamento' && (
        <div>
          {carregandoAgrupamento ? (
            <div className="table-empty">Carregando...</div>
          ) : !dadosAgrupamento ? (
            <div className="table-empty">Sem dados.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
              <div className="table-card">
                <div className="table-header-box">
                  <h3>Faturamento por Colaborador</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Vendas</th>
                        <th>Total Faturado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.por_colaborador || []).map((c) => (
                        <tr key={c.id_colaborador}>
                          <td><strong>{c.nome}</strong></td>
                          <td>{c.quantidade_vendas}</td>
                          <td><strong>R$ {c.total_faturado.toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header-box">
                  <h3>Vendas por Item / Procedimento</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.por_procedimento || []).map((p, idx) => (
                        <tr key={idx}>
                          <td><strong>{p.nome}</strong></td>
                          <td>
                            <span className={`badge ${p.tipo === 'SERVICO' ? 'badge-confirmado' : 'badge-pendente'}`}>
                              {p.tipo}
                            </span>
                          </td>
                          <td>{p.quantidade_total}</td>
                          <td><strong>R$ {p.total_arrecadado.toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header-box">
                  <h3>Agendamentos por Status</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.agendamentos_por_status || []).map((st, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className={`badge badge-${st.status.toLowerCase()}`}>
                              {st.status}
                            </span>
                          </td>
                          <td><strong>{st.quantidade}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="table-card">
                <div className="table-header-box">
                  <h3>Recebimentos por Forma de Pagamento</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Forma</th>
                        <th>Transações</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.por_forma_pagamento || []).map((pg, idx) => (
                        <tr key={idx}>
                          <td><strong>{pg.forma}</strong></td>
                          <td>{pg.quantidade}</td>
                          <td><strong>R$ {pg.valor_total.toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'pivot' && (
        <div>
          <div className="table-card">
            <div className="table-header-box">
              <div>
                <h3>Consulta Pivot: Colaborador x Mês do Ano</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px' }}>Ano:</label>
                <select
                  value={anoPivot}
                  onChange={(e) => {
                    setAnoPivot(parseInt(e.target.value));
                    setTimeout(carregarPivot, 10);
                  }}
                  style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              {carregandoPivot ? (
                <div className="table-empty">Carregando...</div>
              ) : !dadosPivot || !dadosPivot.linhas ? (
                <div className="table-empty">Sem dados.</div>
              ) : (
                <table style={{ minWidth: '900px', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Colaborador</th>
                      {(dadosPivot.meses || []).map((m) => (
                        <th key={m} style={{ textAlign: 'center' }}>{m}</th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosPivot.linhas.map((linha) => (
                      <tr key={linha.id_colaborador}>
                        <td><strong>{linha.nome}</strong></td>
                        {Object.values(linha.meses || {}).map((col) => (
                          <td key={col.mes_index} style={{ textAlign: 'center' }}>
                            {col.faturamento > 0 ? (
                              <span>R$ {col.faturamento.toFixed(0)}</span>
                            ) : (
                              <span style={{ color: '#ccc' }}>-</span>
                            )}
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <strong>R$ {linha.total_ano.toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', background: 'var(--bg-hover)' }}>
                      <td>TOTAL</td>
                      {(dadosPivot.totais_por_mes || []).map((tm) => (
                        <td key={tm.mes_index} style={{ textAlign: 'center' }}>
                          R$ {tm.total_faturamento.toFixed(0)}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center' }}>
                        R$ {Number(dadosPivot.total_geral || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
