import React, { useEffect, useState } from 'react';
import {
  getVendas,
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

export default function Vendas({ setMensagem }) {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [tipoItem, setTipoItem] = useState('SERVICO');
  const [itemId, setItemId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [valorCustomizado, setValorCustomizado] = useState('');
  const [statusVenda, setStatusVenda] = useState('Pago');

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

  function abrirNovo() {
    setEditandoId(null);
    setIdCliente('');
    setIdColaborador('');
    setTipoItem('SERVICO');
    setItemId('');
    setQuantidade('1');
    setFormaPagamento('PIX');
    setValorCustomizado('');
    setStatusVenda('Pago');
    setMostrarForm(true);
  }

  function iniciarEdicao(v) {
    setEditandoId(v.id);
    setIdCliente(v.id_cliente != null ? String(v.id_cliente) : '');
    setIdColaborador(v.id_colaborador != null ? String(v.id_colaborador) : '');
    setValorCustomizado(v.valor_final != null ? String(v.valor_final) : '');
    setStatusVenda(v.status || 'Pago');
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarForm() {
    setMostrarForm(false);
    setEditandoId(null);
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
      if (editandoId) {
        await atualizarVenda(editandoId, {
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          valor_final: valorCustomizado ? parseFloat(valorCustomizado) : undefined,
          status: statusVenda
        });
        if (setMensagem) setMensagem('Venda atualizada com sucesso!');
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
      }

      cancelarForm();
      carregarTudo();
    } catch (erro) {
      alert('Erro ao salvar venda: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir esta venda?')) return;
    try {
      await excluirVenda(id);
      if (setMensagem) setMensagem('Venda excluída com sucesso!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao excluir venda: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Faturamento &amp; Vendas</h2>
          <p>Registro de atendimentos prestados e venda de cosméticos</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (mostrarForm) cancelarForm();
            else abrirNovo();
          }}
        >
          {mostrarForm ? 'Fechar Formulário' : '+ Nova Venda'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editandoId ? `Editar Venda #${editandoId}` : 'Registrar Nova Venda'}
          </h3>
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

            {!editandoId && (
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
                <label>Valor Total (R$) {editandoId ? '*' : '(Opcional se selecionado item)'}</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCustomizado}
                  onChange={(e) => setValorCustomizado(e.target.value)}
                  placeholder="Ex: 150.00"
                  required={!!editandoId}
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
                onClick={cancelarForm}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editandoId ? 'Atualizar Venda' : 'Salvar Venda'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Histórico de Vendas ({vendas.length})</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={abrirNovo}
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
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => iniciarEdicao(v)}
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
