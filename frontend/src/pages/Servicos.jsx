import React, { useEffect, useState } from 'react';
import { getServicos, criarServico, atualizarServico, excluirServico } from '../services/api';

export default function Servicos({ setMensagem }) {
  const [servicos, setServicos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [duracao, setDuracao] = useState('60');

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const dados = await getServicos();
      setServicos(dados || []);
    } catch (erro) {
      console.log('Erro ao buscar serviços:', erro);
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setValor('');
    setDuracao('60');
    setMostrarForm(true);
  }

  function iniciarEdicao(s) {
    setEditandoId(s.id);
    setNome(s.nome || '');
    setDescricao(s.descricao || '');
    setValor(s.valor != null ? String(s.valor) : '');
    setDuracao(s.duracao_minutos != null ? String(s.duracao_minutos) : '60');
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setNome('');
    setDescricao('');
    setValor('');
    setDuracao('60');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim() || !valor) {
      alert('Informe o nome e o valor do serviço!');
      return;
    }

    try {
      if (editandoId) {
        await atualizarServico(editandoId, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor),
          duracao_minutos: parseInt(duracao) || 60
        });
        if (setMensagem) setMensagem('Serviço atualizado com sucesso!');
      } else {
        await criarServico({
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor),
          duracao_minutos: parseInt(duracao) || 60
        });
        if (setMensagem) setMensagem('Serviço cadastrado com sucesso!');
      }

      cancelarForm();
      carregarServicos();
    } catch (erro) {
      alert('Erro ao salvar serviço: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir este serviço?')) return;
    try {
      await excluirServico(id);
      if (setMensagem) setMensagem('Serviço excluído com sucesso!');
      carregarServicos();
    } catch (erro) {
      alert('Erro ao excluir serviço: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Catálogo de Serviços</h2>
          <p>Procedimentos e tratamentos disponíveis na clínica</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (mostrarForm) cancelarForm();
            else abrirNovo();
          }}
        >
          {mostrarForm ? 'Fechar Formulário' : '+ Novo Serviço'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editandoId ? `Editar Serviço #${editandoId}` : 'Cadastrar Novo Serviço'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-group">
              <label>Nome do Serviço *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Limpeza de Pele Profunda"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="120.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                rows="2"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição dos benefícios e etapas do procedimento..."
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
                {editandoId ? 'Atualizar Serviço' : 'Salvar Serviço'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Serviços Cadastrados ({servicos.length})</h3>
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
                <th>Nome</th>
                <th>Descrição</th>
                <th>Duração</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">Nenhum serviço cadastrado ainda.</td>
                </tr>
              ) : (
                servicos.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td><strong>{s.nome}</strong></td>
                    <td>{s.descricao || '-'}</td>
                    <td>{s.duracao_minutos ? `${s.duracao_minutos} min` : '-'}</td>
                    <td><strong>R$ {Number(s.valor || 0).toFixed(2)}</strong></td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => iniciarEdicao(s)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(s.id)}
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
