import React, { useEffect, useState } from 'react';
import { getClientes, criarCliente, atualizarCliente, excluirCliente } from '../services/api';

export default function Clientes({ setMensagem }) {
  const [clientes, setClientes] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [busca, setBusca] = useState('');

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
      setClientes(dados || []);
    } catch (erro) {
      console.log('Erro ao buscar clientes:', erro);
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEmail('');
    setPrefHorario('');
    setMostrarForm(true);
  }

  function iniciarEdicao(c) {
    setEditandoId(c.id_pessoa);
    setNome(c.pessoa?.nome || '');
    setCpf(c.pessoa?.cpf || '');
    setTelefone(c.pessoa?.telefone || '');
    setEmail(c.pessoa?.email || '');
    setPrefHorario(c.pref_horario || '');
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarForm() {
    setMostrarForm(false);
    setEditandoId(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEmail('');
    setPrefHorario('');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      alert('O nome é obrigatório!');
      return;
    }

    try {
      if (editandoId) {
        await atualizarCliente(editandoId, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          pref_horario: prefHorario
        });
        if (setMensagem) setMensagem('Cliente atualizado com sucesso!');
      } else {
        if (!cpf.trim()) {
          alert('O CPF é obrigatório para novo cadastro!');
          return;
        }
        await criarCliente({
          nome: nome.trim(),
          cpf: cpf.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          pref_horario: prefHorario
        });
        if (setMensagem) setMensagem('Cliente cadastrado com sucesso!');
      }

      cancelarForm();
      carregarClientes();
    } catch (erro) {
      alert('Erro ao salvar cliente: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await excluirCliente(id);
      if (setMensagem) setMensagem('Cliente excluído com sucesso!');
      carregarClientes();
    } catch (erro) {
      alert('Erro ao excluir cliente: ' + erro.message);
    }
  }

  const clientesFiltrados = clientes.filter(c => {
    const termo = busca.toLowerCase();
    const nomeC = (c.pessoa?.nome || '').toLowerCase();
    const cpfC = (c.pessoa?.cpf || '').toLowerCase();
    const tel = (c.pessoa?.telefone || '').toLowerCase();
    return nomeC.includes(termo) || cpfC.includes(termo) || tel.includes(termo);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Clientes</h2>
          <p>Cadastro, consulta e edição de clientes da clínica</p>
        </div>

        <div className="page-header-actions">
          <input
            type="text"
            className="search-input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF..."
          />

          <button
            className="btn btn-primary"
            onClick={mostrarForm ? cancelarForm : abrirNovo}
          >
            {mostrarForm ? 'Cancelar' : '+ Novo Cliente'}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">
            {editandoId ? `Editar Cliente #${editandoId}` : 'Cadastrar Novo Cliente'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  required
                />
              </div>

              <div className="form-group">
                <label>CPF {editandoId ? '(Não editável)' : '*'}</label>
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
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Preferência de Horário</label>
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

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelarForm}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editandoId ? 'Atualizar Cliente' : 'Salvar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Clientes Cadastrados ({clientesFiltrados.length})</h3>
          <button className="btn btn-secondary btn-sm" onClick={abrirNovo}>
            + Adicionar
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Pref. Horário</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhum cliente cadastrado ainda.</td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id_pessoa}>
                    <td>{c.id_pessoa}</td>
                    <td><strong>{c.pessoa?.nome}</strong></td>
                    <td>{c.pessoa?.cpf}</td>
                    <td>{c.pessoa?.telefone || '-'}</td>
                    <td>{c.pessoa?.email || '-'}</td>
                    <td>{c.pref_horario || '-'}</td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          className="btn-editar"
                          onClick={() => iniciarEdicao(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => remover(c.id_pessoa)}
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
