import React, { useEffect, useState } from 'react';
import { getColaboradores, criarColaborador, atualizarColaborador, excluirColaborador } from '../services/api';

export default function Colaboradores({ setMensagem }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [salario, setSalario] = useState('');

  useEffect(() => {
    carregarColaboradores();
  }, []);

  async function carregarColaboradores() {
    try {
      const dados = await getColaboradores();
      setColaboradores(dados || []);
    } catch (erro) {
      console.log('Erro ao carregar colaboradores:', erro);
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEspecializacao('');
    setSalario('');
    setMostrarForm(true);
  }

  function iniciarEdicao(colab) {
    setEditandoId(colab.id_pessoa);
    setNome(colab.pessoa?.nome || '');
    setCpf(colab.pessoa?.cpf || '');
    setTelefone(colab.pessoa?.telefone || '');
    setEspecializacao(colab.especializacao || '');
    setSalario(colab.salario != null ? String(colab.salario) : '');
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEspecializacao('');
    setSalario('');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      alert('O nome do profissional é obrigatório!');
      return;
    }

    try {
      if (editandoId) {
        await atualizarColaborador(editandoId, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          especializacao: especializacao.trim(),
          salario: salario ? parseFloat(salario) : null
        });
        if (setMensagem) setMensagem('Colaborador atualizado com sucesso!');
      } else {
        if (!cpf.trim()) {
          alert('O CPF é obrigatório para cadastrar um novo colaborador!');
          return;
        }
        await criarColaborador({
          nome: nome.trim(),
          cpf: cpf.trim(),
          telefone: telefone.trim(),
          especializacao: especializacao.trim(),
          salario: salario ? parseFloat(salario) : null
        });
        if (setMensagem) setMensagem('Colaborador cadastrado com sucesso!');
      }

      cancelarForm();
      carregarColaboradores();
    } catch (erro) {
      alert('Erro ao salvar colaborador: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir este colaborador?')) return;
    try {
      await excluirColaborador(id);
      if (setMensagem) setMensagem('Colaborador excluído com sucesso!');
      carregarColaboradores();
    } catch (erro) {
      alert('Erro ao excluir colaborador: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Equipe &amp; Colaboradores</h2>
          <p>Cadastro de profissionais e corpo clínico</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            if (mostrarForm) cancelarForm();
            else abrirNovo();
          }}
        >
          {mostrarForm ? 'Fechar Formulário' : '+ Novo Colaborador'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editandoId ? `Editar Colaborador #${editandoId}` : 'Cadastrar Novo Profissional'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome do Profissional *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Juliana Costa"
                  required
                />
              </div>

              <div className="form-group">
                <label>CPF {editandoId ? '(não editável)' : '*'}</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  disabled={!!editandoId}
                  required={!editandoId}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label>Especialização</label>
                <input
                  type="text"
                  value={especializacao}
                  onChange={(e) => setEspecializacao(e.target.value)}
                  placeholder="Ex: Esteticista, Dermatologia"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Salário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="Ex: 3000.00"
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
                {editandoId ? 'Atualizar Profissional' : 'Salvar Profissional'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Profissionais Cadastrados ({colaboradores.length})</h3>
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
                <th>Especialização</th>
                <th>Telefone</th>
                <th>Salário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {colaboradores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhum colaborador encontrado.</td>
                </tr>
              ) : (
                colaboradores.map((colab) => (
                  <tr key={colab.id_pessoa}>
                    <td>{colab.id_pessoa}</td>
                    <td><strong>{colab.pessoa?.nome}</strong></td>
                    <td>{colab.especializacao || '-'}</td>
                    <td>{colab.pessoa?.telefone || '-'}</td>
                    <td>{colab.salario ? 'R$ ' + Number(colab.salario).toFixed(2) : '-'}</td>
                    <td>
                      <span className="badge badge-ativo">
                        {colab.status || 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => iniciarEdicao(colab)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(colab.id_pessoa)}
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
