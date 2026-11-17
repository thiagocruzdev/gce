import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProdutos, getProduto, criarProduto, atualizarProduto, excluirProduto, movimentarEstoque } from '../services/api';

export default function Produtos({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { ehProprietario } = useAuth();

  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState(null);
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
    if (mode === 'list') {
      carregarProdutos();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      const dados = await getProdutos();
      setProdutos(dados || []);
    } catch (erro) {
      console.log('Erro ao carregar produtos:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idProd) {
    try {
      setCarregando(true);
      const p = await getProduto(idProd);
      setProdutoAtual(p);
      setNome(p.nome || '');
      setDescricao(p.descricao || '');
      setValorCusto(p.valor_custo != null ? String(p.valor_custo) : '');
      setValorVenda(p.valor_venda != null ? String(p.valor_venda) : '');
      setQuantidade(p.qntd != null ? String(p.qntd) : '0');
      setQuantidadeMinima(p.qntd_min != null ? String(p.qntd_min) : '5');
    } catch (erro) {
      alert('Erro ao carregar produto: ' + erro.message);
      navigate('/produtos');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setProdutoAtual(null);
    setNome('');
    setDescricao('');
    setValorCusto('');
    setValorVenda('');
    setQuantidade('0');
    setQuantidadeMinima('5');
  }

  async function salvarProduto(e) {
    e.preventDefault();

    if (!nome.trim() || !valorVenda) {
      alert('Nome e valor de venda são obrigatórios!');
      return;
    }

    try {
      if (id) {
        await atualizarProduto(id, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor_custo: valorCusto ? parseFloat(valorCusto) : null,
          valor_venda: parseFloat(valorVenda),
          qntd: parseFloat(quantidade) || 0,
          qntd_min: parseFloat(quantidadeMinima) || 0
        });
        if (setMensagem) setMensagem('Produto atualizado com sucesso!');
        navigate(`/produtos/${id}`);
      } else {
        await criarProduto({
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor_custo: valorCusto ? parseFloat(valorCusto) : null,
          valor_venda: parseFloat(valorVenda),
          qntd: parseFloat(quantidade) || 0,
          qntd_min: parseFloat(quantidadeMinima) || 0
        });
        if (setMensagem) setMensagem('Produto cadastrado com sucesso!');
        navigate('/produtos');
      }
    } catch (erro) {
      alert('Erro ao salvar produto: ' + erro.message);
    }
  }

  async function movimentar(e) {
    e.preventDefault();
    const prodId = idProdutoEstoque || id;
    if (!prodId) {
      alert('Selecione um produto!');
      return;
    }

    try {
      await movimentarEstoque({
        id_produto: parseInt(prodId),
        tipo: tipoMovimento,
        quantidade: parseFloat(qtdMovimento)
      });

      setMostrarEstoque(false);
      setQtdMovimento('1');

      if (setMensagem) setMensagem('Estoque movimentado com sucesso!');
      if (mode === 'list') {
        carregarProdutos();
      } else if (mode === 'view') {
        carregarDetalhe(id);
      }
    } catch (erro) {
      alert('Erro na movimentação: ' + erro.message);
    }
  }

  async function remover(idProd) {
    if (!window.confirm('Deseja excluir este produto?')) return;
    try {
      await excluirProduto(idProd);
      if (setMensagem) setMensagem('Produto excluído com sucesso!');
      if (mode === 'list') {
        carregarProdutos();
      } else {
        navigate('/produtos');
      }
    } catch (erro) {
      alert(erro.message);
    }
  }

  if (mode === 'view') {
    if (carregando && !produtoAtual) {
      return <div className="table-empty">Carregando detalhes do produto...</div>;
    }

    const estoqueBaixo = produtoAtual?.qntd <= produtoAtual?.qntd_min;

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Produto</h2>
            <p>Visualização e controle de estoque de cosméticos</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/produtos')}>
              &larr; Voltar para Lista
            </button>
            {ehProprietario && (
              <button className="btn btn-primary" onClick={() => navigate(`/produtos/${id}/editar`)}>
                Editar Produto
              </button>
            )}
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{produtoAtual?.nome}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Código do Produto #{produtoAtual?.id}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setIdProdutoEstoque(id);
                  setMostrarEstoque(!mostrarEstoque);
                }}
              >
                ± Ajustar Estoque
              </button>
              {ehProprietario && (
                <button className="btn btn-danger" onClick={() => remover(id)}>
                  Excluir Produto
                </button>
              )}
            </div>
          </div>

          {mostrarEstoque && (
            <div className="form-card" style={{ borderColor: 'var(--primary)', marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Movimentar Estoque para este item</h4>
              <form onSubmit={movimentar}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Tipo de Movimentação</label>
                    <select
                      value={tipoMovimento}
                      onChange={(e) => setTipoMovimento(e.target.value)}
                    >
                      <option value="ENTRADA">Entrada (Reposição / Compra)</option>
                      <option value="SAIDA">Saída (Consumo / Ajuste)</option>
                    </select>
                  </div>

                  <div className="form-group">
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

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Preço de Venda</span>
              <span className="view-value" style={{ color: 'var(--primary)', fontSize: '18px' }}>
                R$ {Number(produtoAtual?.valor_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Preço de Custo</span>
              <span className="view-value">
                {produtoAtual?.valor_custo ? `R$ ${Number(produtoAtual.valor_custo).toFixed(2)}` : 'Não informado'}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Estoque Atual</span>
              <span className="view-value" style={{ color: estoqueBaixo ? '#c81e1e' : 'inherit' }}>
                {produtoAtual?.qntd} unidades {estoqueBaixo && '(Abaixo do mínimo!)'}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Estoque Mínimo de Alerta</span>
              <span className="view-value">{produtoAtual?.qntd_min} unidades</span>
            </div>

            <div className="view-field">
              <span className="view-label">Status do Produto</span>
              <span className="view-value">
                <span className="badge badge-ativo">{produtoAtual?.status || 'Ativo'}</span>
              </span>
            </div>

            <div className="view-field view-full-width">
              <span className="view-label">Descrição / Instruções</span>
              <span className="view-value" style={{ fontWeight: 'normal', lineHeight: '1.6' }}>
                {produtoAtual?.descricao || 'Nenhuma descrição detalhada cadastrada.'}
              </span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/produtos')}>
              Voltar
            </button>
            {ehProprietario && (
              <button className="btn btn-primary" onClick={() => navigate(`/produtos/${id}/editar`)}>
                Editar Dados
              </button>
            )}
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
            <h2>{id ? `Editar Produto #${id}` : 'Novo Produto'}</h2>
            <p>{id ? 'Altere as informações de estoque e preços' : 'Cadastre um novo item de cosmético ou suprimento'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/produtos')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Dados do Produto' : 'Cadastrar Novo Produto'}</h3>
          <form onSubmit={salvarProduto}>
            <div className="form-group">
              <label>Nome do Produto *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Sérum Clareador Facial 30ml"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Preço de Venda (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorVenda}
                  onChange={(e) => setValorVenda(e.target.value)}
                  placeholder="89.90"
                  required
                />
              </div>

              <div className="form-group">
                <label>Preço de Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCusto}
                  onChange={(e) => setValorCusto(e.target.value)}
                  placeholder="35.00"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Quantidade Inicial em Estoque</label>
                <input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Estoque Mínimo (Alerta)</label>
                <input
                  type="number"
                  value={quantidadeMinima}
                  onChange={(e) => setQuantidadeMinima(e.target.value)}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                rows="3"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes, modo de uso ou indicação clínica..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/produtos/${id}` : '/produtos')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? 'Salvar Alterações' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const produtosFiltrados = produtos.filter((p) => {
    const termo = busca.toLowerCase();
    const nomeP = p.nome?.toLowerCase() || '';
    const descP = p.descricao?.toLowerCase() || '';
    return nomeP.includes(termo) || descP.includes(termo);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Estoque &amp; Produtos</h2>
          <p>Cosméticos, produtos de cuidados e controle de inventário</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setMostrarEstoque(!mostrarEstoque)}
          >
            {mostrarEstoque ? 'Fechar Estoque' : '± Movimentar Estoque'}
          </button>
          {ehProprietario && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/produtos/novo')}
            >
              + Novo Produto
            </button>
          )}
        </div>
      </div>

      {mostrarEstoque && (
        <div className="form-card" style={{ borderColor: 'var(--primary)', marginBottom: '20px' }}>
          <h3 className="form-title">Movimentação Rápida de Estoque</h3>
          <form onSubmit={movimentar}>
            <div className="form-group">
              <label>Selecione o Produto *</label>
              <select
                value={idProdutoEstoque}
                onChange={(e) => setIdProdutoEstoque(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (Atual: {p.qntd} unid.)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Tipo de Movimentação</label>
                <select
                  value={tipoMovimento}
                  onChange={(e) => setTipoMovimento(e.target.value)}
                >
                  <option value="ENTRADA">Entrada (Reposição / Compra)</option>
                  <option value="SAIDA">Saída (Consumo / Ajuste)</option>
                </select>
              </div>

              <div className="form-group">
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h3>Produtos Cadastrados ({produtosFiltrados.length})</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar produto por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
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
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    {carregando ? 'Carregando produtos...' : 'Nenhum produto cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((p) => {
                  const estoqueBaixo = p.qntd <= p.qntd_min;
                  return (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>
                        <strong
                          style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => navigate(`/produtos/${p.id}`)}
                        >
                          {p.nome}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: estoqueBaixo ? '#c81e1e' : 'inherit' }}>
                          {p.qntd} unid.
                        </strong>
                      </td>
                      <td>{p.qntd_min} unid.</td>
                      <td>{p.valor_custo ? `R$ ${Number(p.valor_custo).toFixed(2)}` : '-'}</td>
                      <td><strong>R$ {Number(p.valor_venda || 0).toFixed(2)}</strong></td>
                      <td>
                        <div className="acoes-coluna">
                          <button
                            type="button"
                            className="btn-ver"
                            onClick={() => navigate(`/produtos/${p.id}`)}
                          >
                            Ver
                          </button>
                          {ehProprietario && (
                            <button
                              type="button"
                              className="btn-editar"
                              onClick={() => navigate(`/produtos/${p.id}/editar`)}
                            >
                              Editar
                            </button>
                          )}
                          {ehProprietario && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => remover(p.id)}
                            >
                              Excluir
                            </button>
                          )}
                        </div>
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
