import React, { useEffect, useState } from 'react';
import { getClientes, criarCliente, excluirCliente } from '../services/api';

export default function Clientes({ setMensagem }) {
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [prefHorario, setPrefHorario] = useState('');

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const dados = await getClientes();
      setClientes(dados);
    } catch (erro) {
      console.log('Erro ao buscar clientes:', erro);
    }
  }

  async function cadastrar(e) {
    e.preventDefault();

    if (!nome.trim() || !cpf.trim()) {
      alert('Preencha pelo menos nome e CPF!');
      return;
    }

    try {
      await criarCliente({
        nome: nome.trim(),
        cpf: cpf.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        pref_horario: prefHorario
      });

      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
      setPrefHorario('');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Cliente cadastrado com sucesso!');
      carregarClientes();
    } catch (erro) {
      alert('Erro ao salvar cliente: ' + erro.message);
    }
  }

  async function remover(id) {
    const confirmou = window.confirm('Deseja realmente excluir este cliente?');
    if (!confirmou) return;

    try {
      await excluirCliente(id);
      if (setMensagem) setMensagem('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (erro) {
      alert('Erro ao excluir cliente: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Cadastro de Clientes</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Preencha os dados do cliente</h3>
          <form onSubmit={cadastrar}>
            <div className="linha-campos">
              <div className="campo">
                <label>Nome completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do cliente"
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
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="campo">
              <label>Preferência de horário</label>
              <select
                value={prefHorario}
                onChange={(e) => setPrefHorario(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>

            <button type="submit" className="btn btn-principal">
              Salvar Cliente
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
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Horário Preferido</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhum cliente cadastrado ainda.</td>
              </tr>
            ) : (
              clientes.map((c) => (
                <tr key={c.id_pessoa}>
                  <td>{c.id_pessoa}</td>
                  <td>{c.pessoa?.nome}</td>
                  <td>{c.pessoa?.cpf}</td>
                  <td>{c.pessoa?.telefone || '-'}</td>
                  <td>{c.pessoa?.email || '-'}</td>
                  <td>{c.pref_horario || '-'}</td>
                  <td>
                    <button
                      className="btn btn-excluir"
                      onClick={() => remover(c.id_pessoa)}
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
