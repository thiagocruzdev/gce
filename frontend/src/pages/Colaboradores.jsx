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
      setColaboradores(dados);
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
    const confirmou = window.confirm('Deseja excluir este colaborador?');
    if (!confirmou) return;

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
      <div className="topo-pagina">
        <h2>Equipe e Funcionários</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Colaborador'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Preencha os dados do profissional</h3>
          <form onSubmit={cadastrar}>
            <div className="linha-campos">
              <div className="campo">
                <label>Nome do profissional *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Juliana"
                  required
                />
              </div>
              <div className="campo">
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

            <div className="linha-campos">
              <div className="campo">
                <label>Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="campo">
                <label>Especialização</label>
                <input
                  type="text"
                  value={especializacao}
                  onChange={(e) => setEspecializacao(e.target.value)}
                  placeholder="Ex: Esteticista, Dermatologia"
                />
              </div>
            </div>

            <div className="campo">
              <label>Salário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="Ex: 3000.00"
              />
            </div>

            <button type="submit" className="btn btn-principal">
              Salvar Profissional
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
                <td colSpan="7">Nenhum colaborador encontrado.</td>
              </tr>
            ) : (
              colaboradores.map((colab) => (
                <tr key={colab.id_pessoa}>
                  <td>{colab.id_pessoa}</td>
                  <td>{colab.pessoa?.nome}</td>
                  <td>{colab.especializacao || '-'}</td>
                  <td>{colab.pessoa?.telefone || '-'}</td>
                  <td>{colab.salario ? 'R$ ' + Number(colab.salario).toFixed(2) : '-'}</td>
                  <td>{colab.status || 'Ativo'}</td>
                  <td>
                    <button
                      className="btn btn-excluir"
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
  );
}
