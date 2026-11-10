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
      setProdutos(dados || []);
    } catch (erro) {
      console.log('Erro ao carregar produtos:', erro);
    }
  }

  async function cadastrarProduto(e) {
    e.preventDefault();

    if (!nome.trim() || !valorVenda) {
      alert('Nome e valor de venda são obrigatórios!');
      return;
    }

    try {
      await criarProduto({
        nome: nome.trim(),
        descricao: descricao.trim(),
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
      setMostrarForm(false);

      if (setMensagem) setMensagem('Produto cadastrado com sucesso!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro ao cadastrar produto: ' + erro.message);
    }
  }

  async function movimentar(e) {
    e.preventDefault();

    if (!idProdutoEstoque) {
      alert('Selecione um produto!');
      return;
    }

    try {
      await movimentarEstoque({
        id_produto: parseInt(idProdutoEstoque),
        tipo: tipoMovimento,
        quantidade: parseFloat(qtdMovimento)
      });

      setMostrarEstoque(false);
      setQtdMovimento('1');

      if (setMensagem) setMensagem('Estoque movimentado com sucesso!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro na movimentação: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir este produto?')) return;
    try {
      await excluirProduto(id);
      if (setMensagem) setMensagem('Produto excluído!');
      carregarProdutos();
    } catch (erro) {
      alert('Erro ao excluir produto: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Produtos &amp; Estoque</h2>
          <p>Controle de cosméticos, produtos home care e insumos</p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMostrarEstoque(!mostrarEstoque);
              setMostrarForm(false);
            }}
          >
            {mostrarEstoque ? 'Fechar Estoque' : 'Movimentar Estoque'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setMostrarForm(!mostrarForm);
              setMostrarEstoque(false);
            }}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo Produto'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">Cadastrar Novo Produto</h3>
          <form onSubmit={cadastrarProduto}>
            <div className="form-group">
              <label>Nome do Produto *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Sérum Ácido Hialurônico"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Valor de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  placeholder="150.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Custo Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCusto}
                  onChange={(e) => setValorCusto(e.target.value)}
                  placeholder="80.00"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Quantidade Inicial</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Estoque Mínimo (Alerta)</label>
                <input
                  type="number"
                  value={quantidadeMinima}
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                />
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
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

      {mostrarEstoque && (
        <div className="form-card">
          <h3 className="form-title">Movimentar Estoque (Entrada / Saída)</h3>
          <form onSubmit={movimentar}>
            <div className="form-group">
              <label>Produto *</label>
              <select
                value={idProdutoEstoque}
                onChange={(e) => setIdProdutoEstoque(e.target.value)}
                required
              >
                <option value="">Selecione o produto...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Atual: {p.qntd} unid.)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Tipo de Movimento</label>
                <select
                  value={tipoMovimento}
                  onChange={(e) => setTipoMovimento(e.target.value)}
                >
                  <option value="ENTRADA">Entrada (+ Compra / Reposição)</option>
                  <option value="SAIDA">Saída (- Venda manual / Uso em cabine)</option>
                  <option value="AJUSTE">Ajuste de Inventário</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  min="1"
                  value={qtdMovimento}
                  onChange={(e) => setQtdMovimento(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMostrarEstoque(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Confirmar Movimentação
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Produtos Cadastrados ({produtos.length})</h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Estoque</th>
                <th>Estoque Mínimo</th>
                <th>Custo</th>
                <th>Preço Venda</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhum produto cadastrado ainda.</td>
                </tr>
              ) : (
                produtos.map((p) => {
                  const estoqueBaixo = p.qntd <= p.qntd_min;
                  return (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><strong>{p.nome}</strong></td>
                      <td>
                        <strong style={{ color: estoqueBaixo ? '#c81e1e' : 'inherit' }}>
                          {p.qntd} unid.
                        </strong>
                      </td>
                      <td>{p.qntd_min} unid.</td>
                      <td>{p.valor_custo ? `R$ ${Number(p.valor_custo).toFixed(2)}` : '-'}</td>
                      <td><strong>R$ {Number(p.valor_venda || 0).toFixed(2)}</strong></td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(p.id)}
                        >
                          Excluir
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
    </div>
  );
}
