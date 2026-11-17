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

  // Estados dos filtros da listagem
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
      console.log('Erro ao carregar opções:', e);
    }
  }

  async function carregarVendas() {
    try {
      setCarregando(true);
      const dados = await getVendas();
      setVendas(dados || []);
    } catch (erro) {
      console.log('Erro ao carregar vendas:', erro);
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
      alert('Selecione cliente e profissional!');
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
        if (!itemId) {
          alert('Selecione o item vendido!');
          return;
        }

        let valorUnitario = 0;
        if (tipoItem === 'SERVICO') {
          const s = servicos.find(item => String(item.id) === String(itemId));
          if (s) valorUnitario = s.valor;
        } else {
          const p = produtos.find(item => String(item.id) === String(itemId));
          if (p) valorUnitario = p.valor_venda;
        }

        const qtd = parseFloat(quantidade) || 1;
        const total = valorCustomizado ? parseFloat(valorCustomizado) : (qtd * valorUnitario);

        const novaVenda = await criarVenda({
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          valor_total: total,
          valor_desconto: 0,
          valor_final: total,
          status: statusVenda || 'Pago'
        });

        await adicionarItemVenda(novaVenda.id, {
          tipo: tipoItem,
          id_servico: tipoItem === 'SERVICO' ? parseInt(itemId) : null,
          id_produto: tipoItem === 'PRODUTO' ? parseInt(itemId) : null,
          id_colaborador: parseInt(idColaborador),
          quantidade: qtd,
          valor_unitario: valorUnitario
        });

        await adicionarPagamentoVenda(novaVenda.id, {
          forma_pagamento: formaPagamento,
          valor: total,
          status: 'Pago'
        });

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

  if (mode === 'view') {
    if (carregando && !vendaAtual) {
      return <div className="table-empty">Carregando detalhes da venda...</div>;
    }

    const dataFormatada = vendaAtual?.data
      ? new Date(vendaAtual.data).toLocaleDateString('pt-BR')
      : '-';

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes da Venda</h2>
            <p>Registro fiscal e faturamento de procedimentos e cosméticos</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
              &larr; Voltar para Lista
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/vendas/${id}/editar`)}>
              Editar Venda
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">
                Venda #{vendaAtual?.id} &bull; {vendaAtual?.cliente?.pessoa?.nome || 'Cliente'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Realizada em {dataFormatada}</div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir Venda
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Valor Final / Total</span>
              <span className="view-value" style={{ color: 'var(--primary)', fontSize: '20px' }}>
                R$ {Number(vendaAtual?.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Status da Transação</span>
              <span className="view-value">
                <span className="badge badge-pago">{vendaAtual?.status || 'Pago'}</span>
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Cliente Atendido</span>
              <span className="view-value">{vendaAtual?.cliente?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Profissional Responsável</span>
              <span className="view-value">{vendaAtual?.colaborador?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Desconto Concedido</span>
              <span className="view-value">
                {vendaAtual?.valor_desconto ? `R$ ${Number(vendaAtual.valor_desconto).toFixed(2)}` : 'R$ 0,00'}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Data da Operação</span>
              <span className="view-value">{dataFormatada}</span>
            </div>
          </div>

          {vendaAtual?.itens && vendaAtual.itens.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '14px' }}>Itens Inclusos nesta Venda</h4>
              <table style={{ width: '100%', marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Tipo</th>
                    <th>Qtd</th>
                    <th>Unitário</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendaAtual.itens.map((it) => (
                    <tr key={it.id}>
                      <td><strong>{it.servico?.nome || it.produto?.nome || 'Item'}</strong></td>
                      <td>{it.tipo}</td>
                      <td>{it.quantidade}</td>
                      <td>R$ {Number(it.valor_unitario || 0).toFixed(2)}</td>
                      <td><strong>R$ {Number((it.quantidade || 1) * (it.valor_unitario || 0)).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/vendas/${id}/editar`)}>
              Editar Dados
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
            <h2>{id ? `Editar Venda #${id}` : 'Registrar Venda'}</h2>
            <p>{id ? 'Altere as informações da venda' : 'Registre o pagamento e itens do atendimento'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/vendas')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Dados da Venda' : 'Registrar Nova Venda'}</h3>
          <form onSubmit={salvarVenda}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cliente *</label>
                <select
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  required
                >
                  <option value="">Selecione o cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id_pessoa} value={c.id_pessoa}>
                      {c.pessoa?.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Profissional Responsável *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome} ({colab.especializacao || 'Profissional'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!id && (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Tipo de Item</label>
                    <select
                      value={tipoItem}
                      onChange={(e) => {
                        setTipoItem(e.target.value);
                        setItemId('');
                      }}
                    >
                      <option value="SERVICO">Serviço / Procedimento</option>
                      <option value="PRODUTO">Produto / Cosmético</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Selecione o {tipoItem === 'SERVICO' ? 'Serviço' : 'Produto'} *</label>
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
                              {p.nome} — R$ {Number(p.valor_venda || 0).toFixed(2)} (disp: {p.qntd})
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
                      <option value="DINHEIRO">Dinheiro em Espécie</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-grid-2">
              <div className="form-group">
                <label>Valor Total (R$) {id ? '*' : '(Opcional se selecionado item)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCustomizado}
                  onChange={(e) => setValorCustomizado(e.target.value)}
                  placeholder="Ex: 150.00"
                  required={!!id}
                />
              </div>

              <div className="form-group">
                <label>Status da Venda</label>
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
                {id ? 'Salvar Alterações' : 'Salvar Venda'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filtragem dos dados de vendas
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

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Faturamento &amp; Vendas</h2>
          <p>Registro de atendimentos prestados e venda de cosméticos</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/vendas/novo')}
        >
          + Nova Venda
        </button>
      </div>

      {/* FORMULÁRIO DE FILTRO DE VENDAS */}
      <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '12px' }}>Buscar por Cliente ou Profissional</label>
            <input
              type="text"
              className="search-input"
              placeholder="Digite o nome ou ID da venda..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

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
            <label style={{ fontSize: '12px' }}>De (Data Início)</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Até (Data Fim)</label>
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
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <h3>Histórico de Vendas ({vendasFiltradas.length})</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/vendas/novo')}
          >
            + Adicionar
          </button>
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
                    {carregando ? 'Carregando vendas...' : 'Nenhuma venda encontrada para os filtros aplicados.'}
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
                    <td>
                      <span className="badge badge-pago">
                        {v.status || 'Pago'}
                      </span>
                    </td>
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
