import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosVendas, getPosVenda, getVendas, criarPosVenda, atualizarPosVenda, excluirPosVenda } from '../services/api';

export default function PosVenda({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [avaliacoes, setAvaliacoes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [avaliacaoAtual, setAvaliacaoAtual] = useState(null);

  const [idVenda, setIdVenda] = useState('');
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    carregarVendasOpcoes();
    if (mode === 'list') {
      carregarAvaliacoes();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarVendasOpcoes() {
    try {
      const v = await getVendas();
      setVendas(v || []);
    } catch (e) {
      console.log('Erro ao carregar vendas:', e);
    }
  }

  async function carregarAvaliacoes() {
    try {
      setCarregando(true);
      const listaAval = await getPosVendas();
      setAvaliacoes(listaAval || []);
    } catch (erro) {
      console.log('Erro ao carregar pós-venda:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idAval) {
    try {
      setCarregando(true);
      const item = await getPosVenda(idAval);
      setAvaliacaoAtual(item);
      setIdVenda(item.id_venda != null ? String(item.id_venda) : '');
      setNota(item.avaliacao != null ? String(item.avaliacao) : '5');
      setComentario(item.comentario || '');
    } catch (erro) {
      alert('Erro ao carregar avaliação: ' + erro.message);
      navigate('/posvenda');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setAvaliacaoAtual(null);
    setIdVenda('');
    setNota('5');
    setComentario('');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!id && !idVenda) {
      alert('Selecione uma venda!');
      return;
    }

    try {
      if (id) {
        await atualizarPosVenda(id, {
          avaliacao: parseInt(nota),
          comentario: comentario.trim()
        });
        if (setMensagem) setMensagem('Avaliação atualizada com sucesso!');
        navigate(`/posvenda/${id}`);
      } else {
        await criarPosVenda({
          id_venda: parseInt(idVenda),
          avaliacao: parseInt(nota),
          comentario: comentario.trim()
        });
        if (setMensagem) setMensagem('Avaliação registrada com sucesso!');
        navigate('/posvenda');
      }
    } catch (erro) {
      alert('Erro ao salvar avaliação: ' + erro.message);
    }
  }

  async function remover(idAval) {
    if (!window.confirm('Deseja excluir esta avaliação?')) return;
    try {
      await excluirPosVenda(idAval);
      if (setMensagem) setMensagem('Avaliação excluída com sucesso!');
      if (mode === 'list') {
        carregarAvaliacoes();
      } else {
        navigate('/posvenda');
      }
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message);
    }
  }

  if (mode === 'view') {
    if (carregando && !avaliacaoAtual) {
      return <div className="table-empty">Carregando detalhes da avaliação...</div>;
    }

    const dataFormatada = avaliacaoAtual?.data
      ? new Date(avaliacaoAtual.data).toLocaleDateString('pt-BR')
      : '-';

    const estrelas = avaliacaoAtual?.avaliacao || 5;

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes da Avaliação</h2>
            <p>Controle de qualidade e satisfação da cliente</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/posvenda')}>
              &larr; Voltar para Lista
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/posvenda/${id}/editar`)}>
              Editar Avaliação
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">
                Feedback de {avaliacaoAtual?.venda?.cliente?.pessoa?.nome || 'Cliente'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Registro #{avaliacaoAtual?.id} &bull; {dataFormatada}</div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir Avaliação
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Nota de Satisfação</span>
              <span className="view-value" style={{ color: '#d97706', fontSize: '18px', letterSpacing: '2px' }}>
                {'★'.repeat(estrelas)}
                {'☆'.repeat(5 - estrelas)}
                <span style={{ fontSize: '13px', color: 'var(--text-main)', marginLeft: '8px' }}>
                  ({estrelas} / 5 estrelas)
                </span>
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Cliente</span>
              <span className="view-value">{avaliacaoAtual?.venda?.cliente?.pessoa?.nome || 'Cliente'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Data da Avaliação</span>
              <span className="view-value">{dataFormatada}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Venda / Atendimento Relacionado</span>
              <span className="view-value">
                Venda #{avaliacaoAtual?.id_venda}
                {avaliacaoAtual?.venda?.valor_final != null && ` (R$ ${Number(avaliacaoAtual.venda.valor_final).toFixed(2)})`}
              </span>
            </div>

            <div className="view-field view-full-width">
              <span className="view-label">Depoimento / Comentário da Cliente</span>
              <span className="view-value" style={{ fontWeight: 'normal', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{avaliacaoAtual?.comentario || 'Nenhum comentário por escrito registrado.'}"
              </span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/posvenda')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/posvenda/${id}/editar`)}>
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
            <h2>{id ? `Editar Avaliação #${id}` : 'Nova Avaliação'}</h2>
            <p>{id ? 'Altere a nota ou comentário da cliente' : 'Cadastre o feedback de um atendimento realizado'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/posvenda')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Avaliação' : 'Registrar Feedback de Atendimento'}</h3>
          <form onSubmit={salvar}>
            <div className="form-group">
              <label>Atendimento / Venda {id ? '(não editável)' : '*'}</label>
              <select
                value={idVenda}
                onChange={(e) => setIdVenda(e.target.value)}
                disabled={!!id}
                required={!id}
              >
                <option value="">Selecione o atendimento...</option>
                {vendas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.cliente?.pessoa?.nome} — {v.data ? new Date(v.data).toLocaleDateString('pt-BR') : ''} (R$ {Number(v.valor_final || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Nota de Satisfação</label>
              <select value={nota} onChange={(e) => setNota(e.target.value)}>
                <option value="5">★★★★★ — 5 Estrelas (Excelente)</option>
                <option value="4">★★★★☆ — 4 Estrelas (Muito Bom)</option>
                <option value="3">★★★☆☆ — 3 Estrelas (Bom)</option>
                <option value="2">★★☆☆☆ — 2 Estrelas (Regular)</option>
                <option value="1">★☆☆☆☆ — 1 Estrela (Ruim)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Comentário da Cliente</label>
              <textarea
                rows="3"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Feedback sobre o resultado, pontualidade e experiência..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/posvenda/${id}` : '/posvenda')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? 'Salvar Alterações' : 'Salvar Avaliação'}
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
          <h2>Pós-Venda &amp; Avaliações</h2>
          <p>Feedback das clientes, satisfação e controle de qualidade</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/posvenda/novo')}
        >
          + Nova Avaliação
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <h3>Avaliações Registradas ({avaliacoes.length})</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/posvenda/novo')}
          >
            + Adicionar
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Nota</th>
                <th>Comentário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty">
                    {carregando ? 'Carregando avaliações...' : 'Nenhuma avaliação registrada ainda.'}
                  </td>
                </tr>
              ) : (
                avaliacoes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/posvenda/${item.id}`)}
                      >
                        {item.venda?.cliente?.pessoa?.nome || 'Cliente'}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: '#d97706', fontSize: '14px', letterSpacing: '2px' }}>
                        {'★'.repeat(item.avaliacao || 5)}
                        {'☆'.repeat(5 - (item.avaliacao || 5))}
                      </span>
                    </td>
                    <td>{item.comentario || '-'}</td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/posvenda/${item.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => navigate(`/posvenda/${item.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(item.id)}
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
