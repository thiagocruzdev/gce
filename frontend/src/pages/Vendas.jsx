import React, { useEffect, useState } from 'react';
import {
  getVendas,
  getClientes,
  getColaboradores,
  getServicos,
  getProdutos,
  criarVenda,
  adicionarItemVenda,
  adicionarPagamentoVenda,
  excluirVenda
} from '../services/api';

export default function Vendas({ setMensagem }) {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [tipoItem, setTipoItem] = useState('SERVICO');
  const [itemId, setItemId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [formaPagamento, setFormaPagamento] = useState('PIX');

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    try {
      const [listaVendas, listaClientes, listaColab, listaServicos, listaProdutos] = await Promise.all([
        getVendas().catch(() => []),
        getClientes().catch(() => []),
        getColaboradores().catch(() => []),
        getServicos().catch(() => []),
        getProdutos().catch(() => [])
      ]);

      setVendas(listaVendas || []);
      setClientes(listaClientes || []);
      setColaboradores(listaColab || []);
      setServicos(listaServicos || []);
      setProdutos(listaProdutos || []);
    } catch (erro) {
      console.log('Erro ao carregar vendas:', erro);
    }
  }

  async function cadastrarVenda(e) {
    e.preventDefault();

    if (!idCliente || !idColaborador || !itemId) {
      alert('Selecione cliente, profissional e o item vendido!');
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
    const total = qtd * valorUnitario;

    try {
      const novaVenda = await criarVenda({
        id_cliente: parseInt(idCliente),
        id_colaborador: parseInt(idColaborador),
        valor_total: total,
        valor_desconto: 0,
        valor_final: total,
        status: 'Pago'
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

      setIdCliente('');
      setIdColaborador('');
      setItemId('');
      setQuantidade('1');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Venda registrada com sucesso!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao registrar venda: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir esta venda?')) return;
    try {
      await excluirVenda(id);
      if (setMensagem) setMensagem('Venda excluída!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao excluir venda: ' + erro.message);
    }
  }

  const totalFaturamento = vendas.reduce((acc, v) => acc + (v.valor_final || 0), 0);
  const ticketMedio = vendas.length > 0 ? totalFaturamento / vendas.length : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Vendas &amp; Faturamento</h2>
          <p>Lançamentos financeiros de procedimentos e produtos vendidos</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Nova Venda'}
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-card-label">Total Faturado</div>
          <div className="metric-card-value">
            R$ {Number(totalFaturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-card-sub">Receita bruta de vendas</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Total de Vendas</div>
          <div className="metric-card-value">{vendas.length}</div>
          <div className="metric-card-sub">Lançamentos efetuados</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Ticket Médio</div>
          <div className="metric-card-value">
            R$ {Number(ticketMedio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-card-sub">Média por atendimento</div>
        </div>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">Registrar Nova Venda</h3>
          <form onSubmit={cadastrarVenda}>
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
                <label>Profissional / Atendente *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  required
                >
                  <option value="">Selecione o profissional...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  <option value="PRODUTO">Produto Cosmético</option>
                </select>
              </div>

              <div className="form-group">
                <label>Item Vendido *</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {tipoItem === 'SERVICO'
                    ? servicos.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome} (R$ {Number(s.valor || 0).toFixed(2)})
                        </option>
                      ))
                    : produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} (R$ {Number(p.valor_venda || 0).toFixed(2)})
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Forma de Pagamento</label>
                <select
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMostrarForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Venda
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Histórico de Vendas ({vendas.length})</h3>
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
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhuma venda registrada ainda.</td>
                </tr>
              ) : (
                vendas.map((v) => (
                  <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>{v.data ? new Date(v.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><strong>{v.cliente?.pessoa?.nome || 'Cliente'}</strong></td>
                    <td>{v.colaborador?.pessoa?.nome || 'Profissional'}</td>
                    <td><strong>R$ {Number(v.valor_final || 0).toFixed(2)}</strong></td>
                    <td>
                      <span className="badge badge-pago">
                        {v.status || 'Pago'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remover(v.id)}
                      >
                        Excluir
                      </button>
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
