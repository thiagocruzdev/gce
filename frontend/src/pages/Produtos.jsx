import React, { useEffect, useState } from 'react';
import { getProdutos, criarProduto, excluirProduto, movimentarEstoque } from '../services/api';

export default function Produtos({ setMensagem }) {
  const [produtos, setProdutos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEstoque, setMostrarEstoque] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorCusto, setValorCusto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [quantidade, setQuantidade] = useState('0');
  const [quantidadeMinima, setQuantidadeMinima] = useState('5');

  const [idProdutoEstoque, setIdProdutoEstoque] = useState('');
  const [tipoMovimento, setTipoMovimento] = useState('ENTRADA');
  const [qtdMovimento, setQtdMovimento] = useState('1');

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const dados = await getProdutos();
      setProdutos(dados);
    } catch (erro) {
      console.log('Erro ao carregar produtos:', erro);
    }
  }

  async function cadastrarProduto(e) {
    e.preventDefault();

    if (!nome || !valorVenda) {
      alert('Nome e valor de venda são obrigatórios!');
      return;
    }

    try {
      await criarProduto({
        nome: nome,
        descricao: descricao,
        valor_custo: valorCusto ? parseFloat(valorCusto) : null,
        valor_venda: parseFloat(valorVenda),
        qntd: parseFloat(quantidade) || 0,
        qntd_min: parseFloat(quantidadeMinima) || 0
      });

      setNome('');
      setDescricao('');
      setValorCusto('');
      setValorVenda('');
      setQuantidade('0');
      setQuantidadeMinima('5');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Produto cadastrado com sucesso!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro ao salvar produto: ' + erro.message);
    }
  }

  async function salvarEstoque(e) {
    e.preventDefault();

    if (!idProdutoEstoque) {
      alert('Selecione um produto!');
      return;
    }

    try {
      await movimentarEstoque({
        id_produto: parseInt(idProdutoEstoque),
        tipo: tipoMovimento,
        quantidade: parseFloat(qtdMovimento),
        motivo: 'Ajuste simples'
      });

      setMostrarEstoque(false);
      setQtdMovimento('1');

      if (setMensagem) setMensagem('Estoque atualizado!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro ao atualizar estoque: ' + erro.message);
    }
  }

  async function remover(id) {
    const confirmou = window.confirm('Deseja excluir este produto?');
    if (!confirmou) return;

    try {
      await excluirProduto(id);
      if (setMensagem) setMensagem('Produto excluído com sucesso!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro ao excluir produto: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Produtos e Cosméticos</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-cancelar"
            onClick={() => setMostrarEstoque(!mostrarEstoque)}
          >
            {mostrarEstoque ? 'Fechar Estoque' : 'Atualizar Estoque'}
          </button>
          <button
            className="btn btn-principal"
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo Produto'}
          </button>
        </div>
      </div>

      {mostrarEstoque && (
        <div className="formulario-card">
          <h3>Entrada ou Saída de Estoque</h3>
          <form onSubmit={salvarEstoque}>
            <div className="campo">
              <label>Produto</label>
              <select
                value={idProdutoEstoque}
                onChange={(e) => setIdProdutoEstoque(e.target.value)}
                required
              >
                <option value="">Selecione o produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Atual: {p.qntd})
                  </option>
                ))}
              </select>
            </div>

            <div className="linha-campos">
              <div className="campo">
                <label>Tipo</label>
                <select
                  value={tipoMovimento}
                  onChange={(e) => setTipoMovimento(e.target.value)}
                >
                  <option value="ENTRADA">Entrada (Mais itens)</option>
                  <option value="SAIDA">Saída (Consumo/Venda)</option>
                </select>
              </div>

              <div className="campo">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={qtdMovimento}
                  onChange={(e) => setQtdMovimento(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-principal">
              Confirmar Estoque
            </button>
          </form>
        </div>
      )}

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Preencha os dados do produto</h3>
          <form onSubmit={cadastrarProduto}>
            <div className="campo">
              <label>Nome do produto *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Creme Hidratante Facial"
                required
              />
            </div>

            <div className="campo">
              <label>Descrição</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes do cosmético"
              />
            </div>

            <div className="linha-campos">
              <div className="campo">
                <label>Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCusto}
                  onChange={(e) => setValorCusto(e.target.value)}
                  placeholder="30.00"
                />
              </div>

              <div className="campo">
                <label>Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  placeholder="65.00"
                  required
                />
              </div>
            </div>

            <div className="linha-campos">
              <div className="campo">
                <label>Quantidade em Estoque</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Estoque Mínimo de Alerta</label>
                <input
                  type="number"
                  value={quantidadeMinima}
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-principal">
              Salvar Produto
            </button>
          </form>
        </div>
      )}

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Preço Venda</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhum produto cadastrado.</td>
              </tr>
            ) : (
              produtos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nome}</td>
                  <td>R$ {p.valor_venda ? Number(p.valor_venda).toFixed(2) : '0.00'}</td>
                  <td><strong>{p.qntd}</strong></td>
                  <td>{p.qntd_min}</td>
                  <td>
                    {p.qntd <= p.qntd_min ? (
                      <span className="badge badge-cancelado">Estoque Baixo</span>
                    ) : (
                      <span className="badge badge-concluido">Normal</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-excluir"
                      onClick={() => remover(p.id)}
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
