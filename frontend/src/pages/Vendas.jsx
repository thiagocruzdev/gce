import React, { useEffect, useState } from 'react';
import { getVendas, getClientes, getColaboradores, getServicos, getProdutos, criarVenda, adicionarItemVenda, adicionarPagamentoVenda, excluirVenda } from '../services/api';

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
      const listaVendas = await getVendas();
      const listaClientes = await getClientes();
      const listaColab = await getColaboradores();
      const listaServicos = await getServicos();
      const listaProdutos = await getProdutos();

      setVendas(listaVendas);
      setClientes(listaClientes);
      setColaboradores(listaColab);
      setServicos(listaServicos);
      setProdutos(listaProdutos);
    } catch (erro) {
      console.log('Erro ao carregar vendas:', erro);
    }
  }

  async function cadastrarVenda(e) {
    e.preventDefault();

    if (!idCliente || !idColaborador || !itemId) {
      alert('Selecione o cliente, colaborador e o item vendido!');
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
    const totalVenda = qtd * valorUnitario;

    try {
      const novaVenda = await criarVenda({
        id_cliente: parseInt(idCliente),
        id_colaborador: parseInt(idColaborador),
        valor_total: totalVenda,
        valor_desconto: 0,
        valor_final: totalVenda,
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
        valor: totalVenda,
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
    const confirmou = window.confirm('Deseja excluir esta venda?');
    if (!confirmou) return;

    try {
      await excluirVenda(id);
      if (setMensagem) setMensagem('Venda excluída!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao excluir venda: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Registro de Vendas e Caixa</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Nova Venda'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Preencha os dados da venda</h3>
          <form onSubmit={cadastrarVenda}>
            <div className="linha-campos">
              <div className="campo">
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

              <div className="campo">
                <label>Profissional que Atendeu *</label>
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

            <div className="linha-campos">
              <div className="campo">
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

              <div className="campo">
                <label>Item *</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  required
                >
                  <option value="">Selecione o item...</option>
                  {tipoItem === 'SERVICO' ? (
                    servicos.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nome} - R$ {s.valor}
                      </option>
                    ))
                  ) : (
                    produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - R$ {p.valor_venda} (Estoque: {p.qntd})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="campo">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="campo">
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

            <button type="submit" className="btn btn-principal">
              Finalizar Venda
            </button>
          </form>
        </div>
      )}

      <div className="tabela-container">
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
                <td colSpan="7">Nenhuma venda registrada ainda.</td>
              </tr>
            ) : (
              vendas.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td>{new Date(v.data).toLocaleDateString('pt-BR')}</td>
                  <td>{v.cliente?.pessoa?.nome || 'Cliente'}</td>
                  <td>{v.colaborador?.pessoa?.nome || 'Colaborador'}</td>
                  <td><strong>R$ {v.valor_final ? Number(v.valor_final).toFixed(2) : '0.00'}</strong></td>
                  <td>
                    <span className="badge badge-concluido">{v.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-excluir"
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
  );
}
