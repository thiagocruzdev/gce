import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClientes, getCliente, criarCliente, atualizarCliente, excluirCliente } from '../services/api';
import { validarCPF, validarEmail, mascaraCPF, mascaraTelefone } from '../utils/validacoes';

export default function Clientes({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [clienteAtual, setClienteAtual] = useState(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [prefHorario, setPrefHorario] = useState('');
  const [errosForm, setErrosForm] = useState({});

  useEffect(() => {
    if (mode === 'list') {
      carregarClientes();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarClientes() {
    try {
      setCarregando(true);
      const dados = await getClientes();
      setClientes(dados || []);
    } catch (erro) {
      console.log('Erro ao buscar clientes:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idPessoa) {
    try {
      setCarregando(true);
      const c = await getCliente(idPessoa);
      setClienteAtual(c);
      setNome(c.pessoa?.nome || '');
      setCpf(c.pessoa?.cpf || '');
      setTelefone(c.pessoa?.telefone || '');
      setEmail(c.pessoa?.email || '');
      setPrefHorario(c.pref_horario || '');
    } catch (erro) {
      alert('Erro ao carregar dados do cliente: ' + erro.message);
      navigate('/clientes');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setClienteAtual(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEmail('');
    setPrefHorario('');
    setErrosForm({});
  }

  function validarCamposCliente() {
    const novosErros = {};
    if (!nome.trim()) {
      novosErros.nome = 'O nome completo é obrigatório';
    }

    if (!id) {
      if (!cpf.trim()) {
        novosErros.cpf = 'O CPF é obrigatório para novo cadastro';
      } else if (!validarCPF(cpf)) {
        novosErros.cpf = 'CPF inválido. Verifique os dígitos verificadores.';
      }
    }

    if (email.trim() && !validarEmail(email)) {
      novosErros.email = 'Formato de e-mail inválido (ex: nome@dominio.com)';
    }

    setErrosForm(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function salvar(e) {
    e.preventDefault();

    if (!validarCamposCliente()) {
      return;
    }

    try {
      if (id) {
        await atualizarCliente(id, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          pref_horario: prefHorario
        });
        if (setMensagem) setMensagem('Cliente atualizado com sucesso!');
        navigate(`/clientes/${id}`);
      } else {
        await criarCliente({
          nome: nome.trim(),
          cpf: cpf.trim(),
          telefone: telefone.trim(),
          email: email.trim(),
          pref_horario: prefHorario
        });
        if (setMensagem) setMensagem('Cliente cadastrado com sucesso!');
        navigate('/clientes');
      }
    } catch (erro) {
      alert('Erro ao salvar cliente: ' + erro.message);
    }
  }

  async function remover(idPessoa) {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await excluirCliente(idPessoa);
      if (setMensagem) setMensagem('Cliente excluído com sucesso!');
      if (mode === 'list') {
        carregarClientes();
      } else {
        navigate('/clientes');
      }
    } catch (erro) {
      alert('Erro ao excluir cliente: ' + erro.message);
    }
  }

  if (mode === 'view') {
    if (carregando && !clienteAtual) {
      return <div className="table-empty">Carregando dados do cliente...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Cliente</h2>
            <p>Visualização do cadastro e preferências</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/clientes')}>
              &larr; Voltar para Lista
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/clientes/${id}/editar`)}>
              Editar Cliente
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{clienteAtual?.pessoa?.nome || 'Cliente'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ID Registro #{clienteAtual?.id_pessoa}</div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir Registro
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Nome Completo</span>
              <span className="view-value">{clienteAtual?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">CPF</span>
              <span className="view-value">{clienteAtual?.pessoa?.cpf || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Telefone / WhatsApp</span>
              <span className="view-value">{clienteAtual?.pessoa?.telefone || 'Não informado'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">E-mail</span>
              <span className="view-value">{clienteAtual?.pessoa?.email || 'Não informado'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Preferência de Horário</span>
              <span className="view-value">
                {clienteAtual?.pref_horario ? (
                  <span className="badge badge-confirmado">{clienteAtual.pref_horario}</span>
                ) : (
                  'Sem preferência'
                )}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Procedimento Favorito</span>
              <span className="view-value">{clienteAtual?.servico_preferido?.nome || 'Nenhum definido'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Profissional de Preferência</span>
              <span className="view-value">{clienteAtual?.colaborador_preferido?.pessoa?.nome || 'Sem preferência'}</span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/clientes')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/clientes/${id}/editar`)}>
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
            <h2>{id ? `Editar Cliente #${id}` : 'Novo Cliente'}</h2>
            <p>{id ? 'Atualize as informações do cliente abaixo' : 'Preencha o formulário para cadastrar uma nova cliente'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/clientes')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Dados do Cliente' : 'Cadastrar Nova Cliente'}</h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Clara Silva"
                  style={{ borderColor: errosForm.nome ? 'var(--red-text)' : undefined }}
                />
                {errosForm.nome && (
                  <span style={{ color: 'var(--red-text)', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errosForm.nome}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>CPF {id ? '(não editável)' : '*'}</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(mascaraCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  disabled={!!id}
                  style={{ borderColor: errosForm.cpf ? 'var(--red-text)' : undefined }}
                />
                {errosForm.cpf && (
                  <span style={{ color: 'var(--red-text)', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errosForm.cpf}
                  </span>
                )}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  style={{ borderColor: errosForm.email ? 'var(--red-text)' : undefined }}
                />
                {errosForm.email && (
                  <span style={{ color: 'var(--red-text)', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                    {errosForm.email}
                  </span>
                )}
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
                onClick={() => navigate(id ? `/clientes/${id}` : '/clientes')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const clientesFiltrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    const nomePessoa = c.pessoa?.nome?.toLowerCase() || '';
    const cpfPessoa = c.pessoa?.cpf || '';
    const telPessoa = c.pessoa?.telefone || '';
    return (
      nomePessoa.includes(termo) ||
      cpfPessoa.includes(termo) ||
      telPessoa.includes(termo)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Clientes</h2>
          <p>Gerenciamento da carteira de clientes e histórico</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/clientes/novo')}
        >
          + Novo Cliente
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h3>Clientes Cadastrados ({clientesFiltrados.length})</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome, CPF ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/clientes/novo')}>
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
                  <td colSpan="7" className="table-empty">
                    {carregando ? 'Carregando clientes...' : 'Nenhum cliente cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id_pessoa}>
                    <td>#{c.id_pessoa}</td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/clientes/${c.id_pessoa}`)}
                      >
                        {c.pessoa?.nome}
                      </strong>
                    </td>
                    <td>{c.pessoa?.cpf}</td>
                    <td>{c.pessoa?.telefone || '-'}</td>
                    <td>{c.pessoa?.email || '-'}</td>
                    <td>
                      {c.pref_horario ? (
                        <span className="badge badge-confirmado">{c.pref_horario}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/clientes/${c.id_pessoa}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => navigate(`/clientes/${c.id_pessoa}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
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
