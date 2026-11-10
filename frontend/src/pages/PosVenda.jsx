import React, { useEffect, useState } from 'react';
import { getPosVendas, getVendas, criarPosVenda, atualizarPosVenda, excluirPosVenda } from '../services/api';

export default function PosVenda({ setMensagem }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [idVenda, setIdVenda] = useState('');
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [listaAval, listaVendas] = await Promise.all([
        getPosVendas().catch(() => []),
        getVendas().catch(() => [])
      ]);
      setAvaliacoes(listaAval || []);
      setVendas(listaVendas || []);
    } catch (erro) {
      console.log('Erro ao carregar pós-venda:', erro);
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setIdVenda('');
    setNota('5');
    setComentario('');
    setMostrarForm(true);
  }

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setIdVenda(item.id_venda != null ? String(item.id_venda) : '');
    setNota(item.avaliacao != null ? String(item.avaliacao) : '5');
    setComentario(item.comentario || '');
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setIdVenda('');
    setNota('5');
    setComentario('');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!editandoId && !idVenda) {
      alert('Selecione uma venda!');
      return;
    }

    try {
      if (editandoId) {
        await atualizarPosVenda(editandoId, {
          avaliacao: parseInt(nota),
          comentario: comentario.trim()
        });
        if (setMensagem) setMensagem('Avaliação atualizada com sucesso!');
      } else {
        await criarPosVenda({
          id_venda: parseInt(idVenda),
          avaliacao: parseInt(nota),
          comentario: comentario.trim()
        });
        if (setMensagem) setMensagem('Avaliação registrada com sucesso!');
      }

      cancelarForm();
      carregarDados();
    } catch (erro) {
      alert('Erro ao salvar avaliação: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir esta avaliação?')) return;
    try {
      await excluirPosVenda(id);
      if (setMensagem) setMensagem('Avaliação excluída com sucesso!');
      carregarDados();
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message);
    }
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
          onClick={() => {
            if (mostrarForm) cancelarForm();
            else abrirNovo();
          }}
        >
          {mostrarForm ? 'Fechar Formulário' : '+ Nova Avaliação'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editandoId ? `Editar Avaliação #${editandoId}` : 'Registrar Feedback de Atendimento'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-group">
              <label>Atendimento / Venda {editandoId ? '(não editável)' : '*'}</label>
              <select
                value={idVenda}
                onChange={(e) => setIdVenda(e.target.value)}
                disabled={!!editandoId}
                required={!editandoId}
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
                rows="2"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Feedback sobre o resultado, pontualidade e experiência..."
              />
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
                {editandoId ? 'Atualizar Avaliação' : 'Salvar Avaliação'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Avaliações Registradas ({avaliacoes.length})</h3>
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
                  <td colSpan="5" className="table-empty">Nenhuma avaliação registrada ainda.</td>
                </tr>
              ) : (
                avaliacoes.map((item) => (
                  <tr key={item.id}>
                    <td>{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><strong>{item.venda?.cliente?.pessoa?.nome || 'Cliente'}</strong></td>
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
                          className="btn-editar"
                          onClick={() => iniciarEdicao(item)}
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
