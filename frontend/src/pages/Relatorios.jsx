import React, { useEffect, useState } from 'react';
import {
  getRelatorioMultiTabelas,
  getRelatorioAgrupamentos,
  getRelatorioPivot
} from '../services/api';

export default function Relatorios() {
  const [abaAtiva, setAbaAtiva] = useState('multi'); // 'multi' | 'agrupamento' | 'pivot'

  // Estados da Aba 1 (Múltiplas Tabelas)
  const [dadosMulti, setDadosMulti] = useState([]);
  const [totaisMulti, setTotaisMulti] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregandoMulti, setCarregandoMulti] = useState(false);

  // Estados da Aba 2 (Agrupamentos)
  const [dadosAgrupamento, setDadosAgrupamento] = useState(null);
  const [carregandoAgrupamento, setCarregandoAgrupamento] = useState(false);

  // Estados da Aba 3 (Pivot)
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
      console.error('Erro ao carregar relatório multi-tabelas:', err);
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
      console.error('Erro ao carregar agrupamentos:', err);
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
      console.error('Erro ao carregar pivot:', err);
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
          <h2>Relatórios &amp; Consultas Avançadas</h2>
          <p>Consultas com múltiplas tabelas, totalizações, agrupamentos e matriz cruzada (Pivot)</p>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS DE RELATÓRIO */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={`btn ${abaAtiva === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('multi')}
        >
          📊 Múltiplas Tabelas com Totalização (1,0 pt)
        </button>

        <button
          type="button"
          className={`btn ${abaAtiva === 'agrupamento' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('agrupamento')}
        >
          📈 Consultas de Agrupamento (0,5 pt)
        </button>

        <button
          type="button"
          className={`btn ${abaAtiva === 'pivot' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setAbaAtiva('pivot')}
        >
          🔄 Matriz Pivot de Dupla Entrada (0,5 pt)
        </button>
      </div>

      {/* ===================================================================
          ABA 1: MÚLTIPLAS TABELAS COM TOTALIZAÇÃO
          =================================================================== */}
      {abaAtiva === 'multi' && (
        <div>
          {/* CARDS DE TOTALIZAÇÃO DE DADOS */}
          {totaisMulti && (
            <div className="metric-cards-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card">
                <div className="metric-card-label">Faturamento Líquido Total</div>
                <div className="metric-card-value" style={{ color: 'var(--green-text)' }}>
                  R$ {Number(totaisMulti.total_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-card-sub">
                  Bruto: R$ {Number(totaisMulti.total_bruto || 0).toFixed(2)} | Desc: R$ {Number(totaisMulti.total_descontos || 0).toFixed(2)}
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Volume de Atendimentos</div>
                <div className="metric-card-value">{totaisMulti.total_vendas}</div>
                <div className="metric-card-sub">Vendas/Atendimentos concluídos</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Ticket Médio por Venda</div>
                <div className="metric-card-value">
                  R$ {Number(totaisMulti.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="metric-card-sub">Média líquida por cliente</div>
              </div>

              <div className="metric-card">
                <div className="metric-card-label">Itens &amp; Procedimentos</div>
                <div className="metric-card-value">{totaisMulti.total_itens_vendidos}</div>
                <div className="metric-card-sub">
                  {totaisMulti.total_servicos_executados} Serviços | {totaisMulti.total_produtos_vendidos} Produtos
                </div>
              </div>
            </div>
          )}

          {/* FORMULÁRIO DE FILTROS DA CONSULTA */}
          <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
            <form onSubmit={aplicarFiltrosMulti} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ minWidth: '150px' }}>
                <label style={{ fontSize: '12px' }}>Status da Venda</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="">Todos os status</option>
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
                  🔍 Filtrar Dados
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={limparFiltrosMulti}>
                  Limpar
                </button>
              </div>
            </form>
          </div>

          {/* TABELA DE MÚLTIPLAS TABELAS RELACIONADAS */}
          <div className="table-card">
            <div className="table-header-box">
              <h3>Vendas Detalhadas (Vendas + Clientes + Colaboradores + Itens + Pagamento + Pós-Venda)</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {dadosMulti.length} registros encontrados
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
                    <th>Procedimento / Itens</th>
                    <th>Forma Pagto</th>
                    <th>Avaliação</th>
                    <th>Bruto</th>
                    <th>Desc.</th>
                    <th>Líquido</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {carregandoMulti ? (
                    <tr>
                      <td colSpan="12" className="table-empty">Processando consulta em múltiplas tabelas...</td>
                    </tr>
                  ) : dadosMulti.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="table-empty">Nenhum registro encontrado para os filtros selecionados.</td>
                    </tr>
                  ) : (
                    dadosMulti.map((item) => (
                      <tr key={item.id_venda}>
                        <td>#{item.id_venda}</td>
                        <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                        <td><strong>{item.cliente_nome}</strong></td>
                        <td style={{ fontSize: '12px' }}>{item.cliente_cpf}</td>
                        <td>{item.colaborador_nome}</td>
                        <td>
                          <span>{item.procedimento_principal}</span>
                          {item.quantidade_itens > 1 && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                              +{item.quantidade_itens - 1} outro(s) item(ns)
                            </span>
                          )}
                        </td>
                        <td><span className="badge badge-confirmado">{item.formas_pagamento}</span></td>
                        <td><strong style={{ color: '#b27300' }}>{item.avaliacao_pos_venda}</strong></td>
                        <td>R$ {item.valor_bruto.toFixed(2)}</td>
                        <td style={{ color: item.valor_desconto > 0 ? 'var(--red-text)' : 'inherit' }}>
                          R$ {item.valor_desconto.toFixed(2)}
                        </td>
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

      {/* ===================================================================
          ABA 2: CONSULTAS DE AGRUPAMENTO (GROUP BY)
          =================================================================== */}
      {abaAtiva === 'agrupamento' && (
        <div>
          {carregandoAgrupamento ? (
            <div className="table-empty">Calculando consultas de agrupamento...</div>
          ) : !dadosAgrupamento ? (
            <div className="table-empty">Sem dados de agrupamento disponíveis.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
              {/* AGRUPAMENTO 1: POR COLABORADOR */}
              <div className="table-card">
                <div className="table-header-box">
                  <h3>Faturamento Agrupado por Colaborador</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Profissional</th>
                        <th>Especialidade</th>
                        <th>Atendimentos</th>
                        <th>Faturamento Total</th>
                        <th>Ticket Médio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.por_colaborador || []).map((c) => (
                        <tr key={c.id_colaborador}>
                          <td><strong>{c.nome}</strong></td>
                          <td>{c.especialidade}</td>
                          <td>{c.quantidade_vendas}</td>
                          <td><strong style={{ color: 'var(--green-text)' }}>R$ {c.total_faturado.toFixed(2)}</strong></td>
                          <td>R$ {c.ticket_medio.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AGRUPAMENTO 2: POR PROCEDIMENTO / SERVIÇO */}
              <div className="table-card">
                <div className="table-header-box">
                  <h3>Vendas Agrupadas por Procedimento / Produto</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Tipo</th>
                        <th>Qtd Total</th>
                        <th>Total Arrecadado</th>
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
                          <td>{p.quantidade_total} un.</td>
                          <td><strong>R$ {p.total_arrecadado.toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AGRUPAMENTO 3: AGENDAMENTOS POR STATUS */}
              <div className="table-card">
                <div className="table-header-box">
                  <h3>Agendamentos Agrupados por Situação</h3>
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
                          <td><strong>{st.quantidade} horário(s)</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AGRUPAMENTO 4: POR FORMA DE PAGAMENTO */}
              <div className="table-card">
                <div className="table-header-box">
                  <h3>Recebimentos Agrupados por Forma de Pagamento</h3>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Forma de Pagamento</th>
                        <th>Transações</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dadosAgrupamento.por_forma_pagamento || []).map((pg, idx) => (
                        <tr key={idx}>
                          <td><strong>{pg.forma}</strong></td>
                          <td>{pg.quantidade}</td>
                          <td><strong style={{ color: 'var(--green-text)' }}>R$ {pg.valor_total.toFixed(2)}</strong></td>
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

      {/* ===================================================================
          ABA 3: MATRIZ PIVOT DE DUPLA ENTRADA (CROSSTAB)
          =================================================================== */}
      {abaAtiva === 'pivot' && (
        <div>
          <div className="table-card">
            <div className="table-header-box">
              <div>
                <h3>Matriz Pivot: Faturamento por Colaborador x Mês do Ano</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Cruzamento bidimensional de faturamento (R$) e volume de atendimentos
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600' }}>Ano de Referência:</label>
                <select
                  value={anoPivot}
                  onChange={(e) => {
                    setAnoPivot(parseInt(e.target.value));
                    setTimeout(carregarPivot, 10);
                  }}
                  style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
                <button className="btn btn-secondary btn-sm" onClick={carregarPivot}>
                  Recarregar
                </button>
              </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
              {carregandoPivot ? (
                <div className="table-empty">Processando cruzamento da matriz Pivot...</div>
              ) : !dadosPivot || !dadosPivot.linhas ? (
                <div className="table-empty">Sem dados pivot disponíveis para o ano selecionado.</div>
              ) : (
                <table style={{ minWidth: '950px', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <th style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 2 }}>Profissional / Mês</th>
                      {(dadosPivot.meses || []).map((m) => (
                        <th key={m} style={{ textAlign: 'center' }}>{m}</th>
                      ))}
                      <th style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textAlign: 'center' }}>
                        Total Geral (Ano)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosPivot.linhas.map((linha) => (
                      <tr key={linha.id_colaborador}>
                        <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                          <strong>{linha.nome}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {linha.especialidade}
                          </span>
                        </td>
                        {Object.values(linha.meses || {}).map((col) => (
                          <td key={col.mes_index} style={{ textAlign: 'center' }}>
                            {col.faturamento > 0 ? (
                              <div>
                                <strong style={{ color: 'var(--green-text)', display: 'block' }}>
                                  R$ {col.faturamento.toFixed(0)}
                                </strong>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  {col.quantidade} atend.
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#ccc' }}>-</span>
                            )}
                          </td>
                        ))}
                        <td style={{ backgroundColor: 'var(--primary-light)', textAlign: 'center' }}>
                          <strong style={{ color: 'var(--primary)' }}>
                            R$ {linha.total_ano.toFixed(2)}
                          </strong>
                          <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {linha.qtd_total} atend.
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* LINHA DE TOTAIS POR COLUNA (MÊS) */}
                    <tr style={{ backgroundColor: 'var(--primary-light)', fontWeight: 'bold' }}>
                      <td style={{ position: 'sticky', left: 0, background: 'var(--primary-light)', zIndex: 1 }}>
                        TOTAL MENSAL
                      </td>
                      {(dadosPivot.totais_por_mes || []).map((tm) => (
                        <td key={tm.mes_index} style={{ textAlign: 'center' }}>
                          <div>
                            <span style={{ color: 'var(--primary)', display: 'block' }}>
                              R$ {tm.total_faturamento.toFixed(0)}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {tm.total_quantidade} atend.
                            </span>
                          </div>
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', backgroundColor: 'var(--primary)', color: '#fff' }}>
                        <div>R$ {dadosPivot.total_geral?.faturamento.toFixed(2)}</div>
                        <span style={{ fontSize: '11px', opacity: 0.9 }}>
                          {dadosPivot.total_geral?.quantidade_atendimentos} atend.
                        </span>
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
