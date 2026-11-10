import React, { useEffect, useState } from 'react';
import { getColaboradores, criarColaborador, excluirColaborador } from '../services/api';

export default function Colaboradores({ setMensagem }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

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

  async function cadastrar(e) {
    e.preventDefault();

    if (!nome.trim() || !cpf.trim()) {
      alert('Nome e CPF são obrigatórios!');
      return;
    }

    try {
      await criarColaborador({
        nome: nome.trim(),
        cpf: cpf.trim(),
        telefone: telefone.trim(),
        especializacao: especializacao.trim(),
        salario: salario ? parseFloat(salario) : null
      });

      setNome('');
      setCpf('');
      setTelefone('');
      setEspecializacao('');
      setSalario('');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Colaborador cadastrado com sucesso!');
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
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Colaborador'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">Cadastrar Novo Profissional</h3>
          <form onSubmit={cadastrar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome do Profissional *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Juliana"
                  required
                />
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
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
                onClick={() => setMostrarForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Profissional
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Profissionais Cadastrados ({colaboradores.length})</h3>
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
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remover(colab.id_pessoa)}
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
