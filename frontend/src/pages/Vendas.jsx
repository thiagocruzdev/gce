import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getVendas,
  getVenda,
  getClientes,
  getColaboradores,
  getServicos,
  getProdutos,
  criarVenda,
  atualizarVenda,
  adicionarItemVenda,
  adicionarPagamentoVenda,
  excluirVenda
} from '../services/api';

export default function Vendas({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [vendaAtual, setVendaAtual] = useState(null);

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [tipoItem, setTipoItem] = useState('SERVICO');
  const [itemId, setItemId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valorCustomizado, setValorCustomizado] = useState('');
  const [statusVenda, setStatusVenda] = useState('Pago');

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  useEffect(() => {
    carregarOpcoes();
    if (mode === 'list') {
      carregarVendas();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarOpcoes() {
    try {
      const [c, colab, s, p] = await Promise.all([
        getClientes().catch(() => []),
        getColaboradores().catch(() => []),
        getServicos().catch(() => []),
        getProdutos().catch(() => [])
      ]);
      setClientes(c || []);
      setColaboradores(colab || []);
      setServicos(s || []);
      setProdutos(p || []);
    } catch (e) {
      console.log(e);
    }
  }

  async function carregarVendas() {
    try {
      setCarregando(true);
      const dados = await getVendas();
      setVendas(dados || []);
    } catch (erro) {
      console.log(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idVenda) {
    try {
      setCarregando(true);
      const v = await getVenda(idVenda);
      setVendaAtual(v);
      setIdCliente(v.id_cliente != null ? String(v.id_cliente) : '');
      setIdColaborador(v.id_colaborador != null ? String(v.id_colaborador) : '');
      setValorCustomizado(v.valor_final != null ? String(v.valor_final) : '');
      setStatusVenda(v.status || 'Pago');
    } catch (erro) {
      alert('Erro ao carregar venda: ' + erro.message);
      navigate('/vendas');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setVendaAtual(null);
    setIdCliente('');
    setIdColaborador('');
    setItemId('');
    setQuantidade('1');
    setValorCustomizado('');
    setStatusVenda('Pago');
  }

  async function salvarVenda(e) {
    e.preventDefault();

    if (!idCliente || !idColaborador) {
      alert('Cliente e colaborador são obrigatórios');
      return;
    }

    try {
      if (id) {
        await atualizarVenda(id, {
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          valor_final: valorCustomizado ? parseFloat(valorCustomizado) : undefined,
          status: statusVenda
        });
        if (setMensagem) setMensagem('Venda atualizada com sucesso!');
        navigate(`/vendas/${id}`);
      } else {
        let valorItem = 0;
        if (tipoItem === 'SERVICO' && itemId) {
          const s = servicos.find((srv) => srv.id === parseInt(itemId));
          if (s) valorItem = s.valor;
        } else if (tipoItem === 'PRODUTO' && itemId) {
          const p = produtos.find((prd) => prd.id === parseInt(itemId));
          if (p) valorItem = p.valor_venda;
        }

        const qtd = parseFloat(quantidade) || 1;
        const totalCalculado = valorCustomizado ? parseFloat(valorCustomizado) : valorItem * qtd;

        const nova = await criarVenda({
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          valor_total: totalCalculado,
          valor_final: totalCalculado,
          status: statusVenda
        });

        if (itemId) {
          await adicionarItemVenda(nova.id, {
            tipo: tipoItem,
            id_produto: tipoItem === 'PRODUTO' ? parseInt(itemId) : null,
            id_servico: tipoItem === 'SERVICO' ? parseInt(itemId) : null,
            quantidade: qtd,
            valor_unitario: valorItem,
            valor_desconto: 0
          });
        }

        if (totalCalculado > 0) {
          await adicionarPagamentoVenda(nova.id, {
            forma_pagamento: formaPagamento,
            valor: totalCalculado,
            status: statusVenda === 'Pago' ? 'Pago' : 'Pendente'
          });
        }

        if (setMensagem) setMensagem('Venda registrada com sucesso!');
        navigate('/vendas');
      }
    } catch (erro) {
      alert('Erro ao salvar venda: ' + erro.message);
    }
  }

  async function remover(idVenda) {
    if (!window.confirm('Deseja excluir esta venda?')) return;
    try {
      await excluirVenda(idVenda);
      if (setMensagem) setMensagem('Venda excluída com sucesso!');
      if (mode === 'list') {
        carregarVendas();
      } else {
        navigate('/vendas');
      }
    } catch (erro) {
      alert('Erro ao excluir venda: ' + erro.message);
    }
  }

  const vendasFiltradas = vendas.filter((v) => {
    const termo = busca.toLowerCase();
    const nomeCliente = v.cliente?.pessoa?.nome?.toLowerCase() || '';
    const nomeColab = v.colaborador?.pessoa?.nome?.toLowerCase() || '';
    const combinaBusca = nomeCliente.includes(termo) || nomeColab.includes(termo) || String(v.id).includes(termo);

    let combinaStatus = true;
    if (filtroStatus) {
      combinaStatus = v.status === filtroStatus;
    }

    let combinaData = true;
    if (v.data) {
      const dataVendaStr = new Date(v.data).toISOString().split('T')[0];
      if (filtroDataInicio && dataVendaStr < filtroDataInicio) combinaData = false;
      if (filtroDataFim && dataVendaStr > filtroDataFim) combinaData = false;
    }

    return combinaBusca && combinaStatus && combinaData;
  });

  if (mode === 'view') {
    if (carregando && !vendaAtual) {
      return <div className="table-empty">Carregando...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes da Venda #{vendaAtual?.id}</h2>
            <p>Data: {vendaAtual?.data ? new Date(vendaAtual.data).toLocaleDateString('pt-BR') : '-'}</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
              &larr; Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/vendas/${id}/editar`)}>
              Editar
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">Venda #{vendaAtual?.id}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Status: {vendaAtual?.status}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Cliente</span>
              <span className="view-value">{vendaAtual?.cliente?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Colaborador</span>
              <span className="view-value">{vendaAtual?.colaborador?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Valor Final</span>
              <span className="view-value">
                R$ {Number(vendaAtual?.valor_final || 0).toFixed(2)}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Status</span>
              <span className="view-value">
                {vendaAtual?.status || 'Pago'}
              </span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/vendas/${id}/editar`)}>
              Editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>{id ? `Editar Venda #${id}` : 'Nova Venda'}</h2>
            <p>{id ? 'Alterar dados' : 'Registrar venda'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
            &larr; Voltar
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Venda' : 'Registrar Venda'}</h3>
          <form onSubmit={salvarVenda}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {clientes.map((c) => (
                    <option key={c.id_pessoa} value={c.id_pessoa}>
                      {c.pessoa?.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Colaborador *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!id && (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      value={tipoItem}
                      onChange={(e) => {
                        setTipoItem(e.target.value);
                        setItemId('');
                      }}
                    >
                      <option value="SERVICO">Serviço</option>
                      <option value="PRODUTO">Produto</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{tipoItem === 'SERVICO' ? 'Serviço' : 'Produto'} *</label>
                    <select
                      value={itemId}
                      onChange={(e) => setItemId(e.target.value)}
                      required
                    >
                      <option value="">Selecione...</option>
                      {tipoItem === 'SERVICO'
                        ? servicos.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nome} — R$ {Number(s.valor || 0).toFixed(2)}
                            </option>
                          ))
                        : produtos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome} — R$ {Number(p.valor_venda || 0).toFixed(2)}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Quantidade</label>
                    <input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select
                      value={formaPagamento}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                      <option value="PIX">PIX</option>
                      <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                      <option value="CARTAO_DEBITO">Cartão de Débito</option>
                      <option value="DINHEIRO">Dinheiro</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label>Valor Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCustomizado}
                  onChange={(e) => setValorCustomizado(e.target.value)}
                  placeholder="Ex: 150.00"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={statusVenda}
                  onChange={(e) => setStatusVenda(e.target.value)}
                >
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/vendas/${id}` : '/vendas')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Vendas</h2>
          <p>Registro de vendas e faturamento</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/vendas/novo')}
        >
          + Nova Venda
        </button>
      </div>

      <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '12px' }}>Buscar</label>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por cliente ou colaborador..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

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
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Data Final</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>

          {(busca || filtroStatus || filtroDataInicio || filtroDataFim) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setBusca('');
                setFiltroStatus('');
                setFiltroDataInicio('');
                setFiltroDataFim('');
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <h3>Histórico de Vendas ({vendasFiltradas.length})</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Profissional</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    {carregando ? 'Carregando...' : 'Nenhuma venda encontrada.'}
                  </td>
                </tr>
              ) : (
                vendasFiltradas.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>{v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/vendas/${v.id}`)}
                      >
                        {v.cliente?.pessoa?.nome || 'Cliente'}
                      </strong>
                    </td>
                    <td>{v.colaborador?.pessoa?.nome || 'Profissional'}</td>
                    <td><strong>R$ {Number(v.valor_final || 0).toFixed(2)}</strong></td>
                    <td>{v.status || 'Pago'}</td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/vendas/${v.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => navigate(`/vendas/${v.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(v.id)}
                        >
                          Excluir
                        </button>
                      </div>
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
