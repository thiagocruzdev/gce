import React, { useEffect, useState } from 'react';
import {
  getRelatorioMultiTabelas,
  getRelatorioAgrupamentos,
  getRelatorioPivot
} from '../services/api';

export default function Relatorios() {
  const [dadosVendas, setDadosVendas] = useState([]);
  const [totaisVendas, setTotaisVendas] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregandoVendas, setCarregandoVendas] = useState(false);

  const [dadosDesempenho, setDadosDesempenho] = useState(null);
  const [carregandoDesempenho, setCarregandoDesempenho] = useState(false);

  const [dadosMatriz, setDadosMatriz] = useState(null);
  const [anoMatriz, setAnoMatriz] = useState(new Date().getFullYear());
  const [carregandoMatriz, setCarregandoMatriz] = useState(false);

  useEffect(() => {
    carregarVendas();
    carregarDesempenho();
    carregarMatriz(anoMatriz);
  }, []);

  async function carregarVendas() {
    try {
      setCarregandoVendas(true);
      const res = await getRelatorioMultiTabelas({
        status: filtroStatus,
        data_inicio: dataInicio,
        data_fim: dataFim
      });
      setDadosVendas(res.dados || []);
      setTotaisVendas(res.totalizacao || null);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoVendas(false);
    }
  }

  async function carregarDesempenho() {
    try {
      setCarregandoDesempenho(true);
      const res = await getRelatorioAgrupamentos();
      setDadosDesempenho(res);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoDesempenho(false);
    }
  }

  async function carregarMatriz(ano) {
    try {
      setCarregandoMatriz(true);
      const res = await getRelatorioPivot(ano || anoMatriz);
      setDadosMatriz(res);
    } catch (err) {
      console.log(err);
    } finally {
      setCarregandoMatriz(false);
    }
  }

  function aplicarFiltros(e) {
    e.preventDefault();
    carregarVendas();
  }

  function limparFiltros() {
    setFiltroStatus('');
    setDataInicio('');
    setDataFim('');
    setTimeout(carregarVendas, 10);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Relatórios e Desempenho</h2>
          <p>Visão completa de faturamento, equipe, procedimentos e histórico financeiro</p>
        </div>
      </div>

      {totaisVendas && (
        <div className="metric-cards-grid" style={{ marginBottom: '24px' }}>
          <div className="metric-card">
            <div className="metric-card-label">Faturamento Líquido</div>
            <div className="metric-card-value" style={{ color: 'var(--green-text)' }}>
              R$ {Number(totaisVendas.total_liquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="metric-card-sub">
              Bruto: R$ {Number(totaisVendas.total_bruto || 0).toFixed(2)} | Descontos: R$ {Number(totaisVendas.total_descontos || 0).toFixed(2)}
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Total de Vendas</div>
            <div className="metric-card-value">{totaisVendas.total_vendas}</div>
            <div className="metric-card-sub">Registros encontrados</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Ticket Médio</div>
            <div className="metric-card-value">
              R$ {Number(totaisVendas.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="metric-card-sub">Média por atendimento</div>
          </div>

          <div className="metric-card">
            <div className="metric-card-label">Itens Vendidos</div>
            <div className="metric-card-value">{totaisVendas.total_itens_vendidos}</div>
            <div className="metric-card-sub">Produtos e procedimentos</div>
          </div>
        </div>
      )}

      <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={aplicarFiltros} style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
              Filtrar
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={limparFiltros}>
              Limpar
            </button>
          </div>
        </form>
      </div>

      <div className="table-card" style={{ marginBottom: '32px' }}>
        <div className="table-header-box">
          <div>
            <h3>Detalhamento Completo de Vendas</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Cruzamento com dados de clientes, profissionais, pagamentos e pós-venda
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {dadosVendas.length} registros
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
              {carregandoVendas ? (
                <tr>
                  <td colSpan="12" className="table-empty">Carregando relatório...</td>
                </tr>
              ) : dadosVendas.length === 0 ? (
                <tr>
                  <td colSpan="12" className="table-empty">Nenhum registro encontrado para os filtros selecionados.</td>
                </tr>
              ) : (
                dadosVendas.map((item) => (
                  <tr key={item.id_venda}>
                    <td>#{item.id_venda}</td>
                    <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><strong>{item.cliente_nome}</strong></td>
                    <td style={{ fontSize: '12px' }}>{item.cliente_cpf}</td>
                    <td>{item.colaborador_nome}</td>
                    <td>{item.procedimento_principal}</td>
                    <td>{item.formas_pagamento || '-'}</td>
                    <td>{item.avaliacao_pos_venda}</td>
                    <td>R$ {item.valor_bruto.toFixed(2)}</td>
                    <td>R$ {item.valor_desconto.toFixed(2)}</td>
                    <td><strong>R$ {item.valor_final.toFixed(2)}</strong></td>
                    <td>{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: '32px' }}>
        <div className="table-header-box">
          <div>
            <h3>Faturamento Mensal por Profissional</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Comparativo de arrecadação mês a mês por membro da equipe
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '13px' }}>Ano:</label>
            <select
              value={anoMatriz}
              onChange={(e) => {
                const novoAno = parseInt(e.target.value);
                setAnoMatriz(novoAno);
                carregarMatriz(novoAno);
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
          {carregandoMatriz ? (
            <div className="table-empty">Carregando comparativo mensal...</div>
          ) : !dadosMatriz || !dadosMatriz.linhas ? (
            <div className="table-empty">Sem dados disponíveis para o ano selecionado.</div>
          ) : (
            <table style={{ minWidth: '900px', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  {(dadosMatriz.meses || []).map((m) => (
                    <th key={m} style={{ textAlign: 'center' }}>{m}</th>
                  ))}
                  <th style={{ textAlign: 'center' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {dadosMatriz.linhas.map((linha) => (
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
                  {(dadosMatriz.totais_por_mes || []).map((tm) => (
                    <td key={tm.mes_index} style={{ textAlign: 'center' }}>
                      R$ {tm.total_faturamento.toFixed(0)}
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    R$ {Number(dadosMatriz.total_geral || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>Indicadores por Categoria</h3>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Distribuição e consolidação de atendimentos, procedimentos e pagamentos
          </span>
        </div>

        {carregandoDesempenho ? (
          <div className="table-empty">Carregando indicadores...</div>
        ) : !dadosDesempenho ? (
          <div className="table-empty">Sem dados para exibir.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            <div className="table-card">
              <div className="table-header-box">
                <h3>Total por Profissional</h3>
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
                    {(dadosDesempenho.por_colaborador || []).map((c) => (
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
                    {(dadosDesempenho.por_procedimento || []).map((p, idx) => (
                      <tr key={idx}>
                        <td><strong>{p.nome}</strong></td>
                        <td>{p.tipo}</td>
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
                    {(dadosDesempenho.agendamentos_por_status || []).map((st, idx) => (
                      <tr key={idx}>
                        <td>{st.status}</td>
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
                    {(dadosDesempenho.por_forma_pagamento || []).map((pg, idx) => (
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
    </div>
  );
}
