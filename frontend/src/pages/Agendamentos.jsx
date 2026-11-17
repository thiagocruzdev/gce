import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAgendamentos,
  getAgendamento,
  getClientes,
  getColaboradores,
  getServicos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento
} from '../services/api';

export default function Agendamentos({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { usuario, ehCliente, ehColaborador, ehProprietario } = useAuth();

  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [agendamentoAtual, setAgendamentoAtual] = useState(null);

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [idServico, setIdServico] = useState('');
  const [dataMarcada, setDataMarcada] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [observacao, setObservacao] = useState('');
  const [status, setStatus] = useState('Confirmado');
  const [errosForm, setErrosForm] = useState({});

  useEffect(() => {
    carregarOpcoes();
    if (mode === 'list') {
      carregarAgendamentos();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
      if (ehCliente && usuario?.id_pessoa) {
        setIdCliente(String(usuario.id_pessoa));
      }
    }
  }, [mode, id, usuario]);

  async function carregarOpcoes() {
    try {
      const [c, colab, s] = await Promise.all([
        getClientes().catch(() => []),
        getColaboradores().catch(() => []),
        getServicos().catch(() => [])
      ]);
      setClientes(c || []);
      setColaboradores(colab || []);
      setServicos(s || []);
    } catch (e) {
      console.log(e);
    }
  }

  async function carregarAgendamentos() {
    try {
      setCarregando(true);
      const filtros = {};
      if (ehCliente && usuario?.id_pessoa) {
        filtros.id_cliente = usuario.id_pessoa;
      } else if (ehColaborador && usuario?.id_pessoa) {
        filtros.id_colaborador = usuario.id_pessoa;
      }
      const dados = await getAgendamentos(filtros);
      setAgendamentos(dados || []);
    } catch (erro) {
      console.log(erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idAgendamento) {
    try {
      setCarregando(true);
      const a = await getAgendamento(idAgendamento);
      setAgendamentoAtual(a);
      setIdCliente(a.id_cliente != null ? String(a.id_cliente) : '');
      setIdColaborador(a.id_colaborador != null ? String(a.id_colaborador) : '');
      setIdServico(a.id_servico != null ? String(a.id_servico) : '');
      setDataMarcada(a.data_marcada ? new Date(a.data_marcada).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setHoraInicio(a.hora_inicio || '09:00');
      setObservacao(a.observacao || '');
      setStatus(a.status || 'Confirmado');
    } catch (erro) {
      alert('Erro ao carregar agendamento: ' + erro.message);
      navigate('/agendamentos');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setAgendamentoAtual(null);
    setIdCliente(ehCliente && usuario?.id_pessoa ? String(usuario.id_pessoa) : '');
    setIdColaborador('');
    setIdServico('');
    setDataMarcada(new Date().toISOString().split('T')[0]);
    setHoraInicio('09:00');
    setObservacao('');
    setStatus('Confirmado');
    setErrosForm({});
  }

  function validarFormulario() {
    const novosErros = {};
    if (!idCliente) novosErros.idCliente = 'Selecione o cliente';
    if (!idColaborador) novosErros.idColaborador = 'Selecione o colaborador';
    if (!idServico) novosErros.idServico = 'Selecione o serviço';
    if (!dataMarcada) {
      novosErros.dataMarcada = 'Informe a data';
    } else {
      const hojeStr = new Date().toISOString().split('T')[0];
      if (dataMarcada < hojeStr) {
        novosErros.dataMarcada = 'A data não pode ser anterior a hoje';
      }
    }
    if (!horaInicio) novosErros.horaInicio = 'Informe o horário';

    setErrosForm(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function salvar(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      const servicoEscolhido = servicos.find((s) => s.id === parseInt(idServico));
      const valorPrevisto = servicoEscolhido ? servicoEscolhido.valor : null;

      if (id) {
        await atualizarAgendamento(id, {
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          id_servico: parseInt(idServico),
          data_marcada: dataMarcada,
          hora_inicio: horaInicio,
          valor_previsto: valorPrevisto,
          observacao: observacao,
          status: status
        });
        if (setMensagem) setMensagem('Agendamento atualizado com sucesso!');
        navigate(`/agendamentos/${id}`);
      } else {
        await criarAgendamento({
          id_cliente: parseInt(idCliente),
          id_colaborador: parseInt(idColaborador),
          id_servico: parseInt(idServico),
          data_marcada: dataMarcada,
          hora_inicio: horaInicio,
          valor_previsto: valorPrevisto,
          observacao: observacao,
          status: status
        });
        if (setMensagem) setMensagem('Agendamento cadastrado com sucesso!');
        navigate('/agendamentos');
      }
    } catch (erro) {
      alert('Erro ao salvar agendamento: ' + erro.message);
    }
  }

  async function mudarStatus(idAgendamento, novoStatus) {
    try {
      await atualizarAgendamento(idAgendamento, { status: novoStatus });
      if (setMensagem) setMensagem('Status alterado!');
      carregarAgendamentos();
    } catch (erro) {
      alert('Erro: ' + erro.message);
    }
  }

  async function remover(idAgendamento) {
    if (ehCliente) {
      alert('Clientes não podem excluir agendamentos, apenas cancelar.');
      return;
    }
    if (!window.confirm('Deseja excluir este agendamento?')) return;
    try {
      await excluirAgendamento(idAgendamento);
      if (setMensagem) setMensagem('Agendamento excluído com sucesso!');
      if (mode === 'list') {
        carregarAgendamentos();
      } else {
        navigate('/agendamentos');
      }
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message);
    }
  }

  async function cancelar(idAgendamento) {
    if (!window.confirm('Deseja cancelar este agendamento?')) return;
    try {
      await atualizarAgendamento(idAgendamento, { status: 'Cancelado' });
      if (setMensagem) setMensagem('Agendamento cancelado com sucesso!');
      if (mode === 'list') {
        carregarAgendamentos();
      } else {
        carregarDetalhe(idAgendamento);
      }
    } catch (erro) {
      alert('Erro ao cancelar: ' + erro.message);
    }
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const agendamentosFiltrados = agendamentos.filter((a) => {
    const termo = busca.toLowerCase();
    const nomeCliente = a.cliente?.pessoa?.nome?.toLowerCase() || '';
    const nomeColab = a.colaborador?.pessoa?.nome?.toLowerCase() || '';
    const nomeServico = a.servico?.nome?.toLowerCase() || '';

    const combinaBusca = nomeCliente.includes(termo) || nomeColab.includes(termo) || nomeServico.includes(termo);

    let combinaStatus = true;
    if (filtroStatus) {
      combinaStatus = a.status === filtroStatus;
    }

    let combinaData = true;
    if (filtroData) {
      const dataItem = a.data_marcada ? new Date(a.data_marcada).toISOString().split('T')[0] : '';
      combinaData = dataItem === filtroData;
    }

    let combinaTipo = true;
    const dataItem = a.data_marcada ? new Date(a.data_marcada) : new Date();
    if (filtroTipo === 'feitos') {
      combinaTipo = a.status === 'Concluído' || dataItem < hoje;
    } else if (filtroTipo === 'falta_fazer') {
      combinaTipo = (a.status === 'Confirmado' || a.status === 'Pendente') && dataItem >= hoje;
    }

    return combinaBusca && combinaStatus && combinaData && combinaTipo;
  });

  if (mode === 'view') {
    if (carregando && !agendamentoAtual) {
      return <div className="table-empty">Carregando...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Agendamento</h2>
            <p>Horário #{agendamentoAtual?.id}</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
              &larr; Voltar
            </button>
            {!ehCliente && (
              <button className="btn btn-primary" onClick={() => navigate(`/agendamentos/${id}/editar`)}>
                Editar
              </button>
            )}
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{agendamentoAtual?.servico?.nome}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {agendamentoAtual?.data_marcada ? new Date(agendamentoAtual.data_marcada).toLocaleDateString('pt-BR') : '-'} às {agendamentoAtual?.hora_inicio || '09:00'}
              </div>
            </div>
            {!ehCliente ? (
              <button className="btn btn-danger" onClick={() => remover(id)}>
                Excluir
              </button>
            ) : (
              agendamentoAtual?.status !== 'Cancelado' && agendamentoAtual?.status !== 'Concluído' && (
                <button className="btn btn-danger" onClick={() => cancelar(id)}>
                  Cancelar Agendamento
                </button>
              )
            )}
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Cliente</span>
              <span className="view-value">{agendamentoAtual?.cliente?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Telefone</span>
              <span className="view-value">{agendamentoAtual?.cliente?.pessoa?.telefone || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Profissional</span>
              <span className="view-value">{agendamentoAtual?.colaborador?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Especialidade</span>
              <span className="view-value">{agendamentoAtual?.colaborador?.especializacao || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Valor Previsto</span>
              <span className="view-value">
                R$ {Number(agendamentoAtual?.valor_previsto || agendamentoAtual?.servico?.valor || 0).toFixed(2)}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Status</span>
              <span className="view-value">
                {agendamentoAtual?.status || 'Confirmado'}
              </span>
            </div>
          </div>

          {agendamentoAtual?.observacao && (
            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Observações:
              </span>
              <p style={{ margin: 0, fontSize: '14px' }}>{agendamentoAtual.observacao}</p>
            </div>
          )}

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
              Voltar
            </button>
            {!ehCliente && (
              <button className="btn btn-primary" onClick={() => navigate(`/agendamentos/${id}/editar`)}>
                Editar
              </button>
            )}
            {ehCliente && agendamentoAtual?.status !== 'Cancelado' && agendamentoAtual?.status !== 'Concluído' && (
              <button className="btn btn-danger" onClick={() => cancelar(id)}>
                Cancelar Agendamento
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
            <h2>{id ? `Editar Agendamento #${id}` : 'Novo Agendamento'}</h2>
            <p>{id ? 'Alterar dados' : 'Preencha o formulário'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
            &larr; Voltar
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cliente *</label>
                {ehCliente ? (
                  <input
                    type="text"
                    value={usuario?.nome || 'Você'}
                    disabled
                  />
                ) : (
                  <select
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    style={{ borderColor: errosForm.idCliente ? 'var(--red-text)' : undefined }}
                  >
                    <option value="">Selecione...</option>
                    {clientes.map((c) => (
                      <option key={c.id_pessoa} value={c.id_pessoa}>
                        {c.pessoa?.nome}
                      </option>
                    ))}
                  </select>
                )}
                {errosForm.idCliente && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idCliente}</span>}
              </div>

              <div className="form-group">
                <label>Profissional *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  style={{ borderColor: errosForm.idColaborador ? 'var(--red-text)' : undefined }}
                >
                  <option value="">Selecione...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome}
                    </option>
                  ))}
                </select>
                {errosForm.idColaborador && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idColaborador}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Serviço *</label>
                <select
                  value={idServico}
                  onChange={(e) => setIdServico(e.target.value)}
                  style={{ borderColor: errosForm.idServico ? 'var(--red-text)' : undefined }}
                >
                  <option value="">Selecione...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R$ {Number(s.valor || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
                {errosForm.idServico && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idServico}</span>}
              </div>

              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={dataMarcada}
                  onChange={(e) => setDataMarcada(e.target.value)}
                  style={{ borderColor: errosForm.dataMarcada ? 'var(--red-text)' : undefined }}
                />
                {errosForm.dataMarcada && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.dataMarcada}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Horário *</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  style={{ borderColor: errosForm.horaInicio ? 'var(--red-text)' : undefined }}
                />
                {errosForm.horaInicio && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.horaInicio}</span>}
              </div>

              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                rows="3"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observações do atendimento..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/agendamentos/${id}` : '/agendamentos')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
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
          <h2>{ehCliente ? 'Meus Agendamentos' : ehColaborador ? 'Minha Agenda' : 'Agendamentos'}</h2>
          <p>
            {ehCliente
              ? 'Consulte seus horários ou agende procedimentos'
              : ehColaborador
              ? 'Consulte os agendamentos feitos e que falta fazer'
              : 'Gerenciamento da agenda da clínica'}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/agendamentos/novo')}
        >
          + Novo Agendamento
        </button>
      </div>

      {(ehColaborador || ehProprietario) && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn btn-sm ${filtroTipo === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroTipo('todos')}
          >
            Todos ({agendamentos.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filtroTipo === 'falta_fazer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroTipo('falta_fazer')}
          >
            Falta Fazer
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filtroTipo === 'feitos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroTipo('feitos')}
          >
            Feitos
          </button>
        </div>
      )}

      <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '12px' }}>Buscar</label>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por cliente, serviço ou profissional..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Data</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>

          {(busca || filtroStatus || filtroData || filtroTipo !== 'todos') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setBusca('');
                setFiltroStatus('');
                setFiltroData('');
                setFiltroTipo('todos');
              }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <h3>
            {ehCliente ? 'Meus Atendimentos' : 'Horários Agendados'} ({agendamentosFiltrados.length})
          </h3>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Profissional</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    {carregando ? 'Carregando...' : 'Nenhum agendamento encontrado.'}
                  </td>
                </tr>
              ) : (
                agendamentosFiltrados.map((a) => (
                  <tr key={a.id}>
                    <td>{a.data_marcada ? new Date(a.data_marcada).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><strong>{a.hora_inicio || '-'}</strong></td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/agendamentos/${a.id}`)}
                      >
                        {a.cliente?.pessoa?.nome || 'Cliente'}
                      </strong>
                    </td>
                    <td>{a.servico?.nome || 'Serviço'}</td>
                    <td>{a.colaborador?.pessoa?.nome || 'Profissional'}</td>
                    <td>R$ {Number(a.valor_previsto || a.servico?.valor || 0).toFixed(2)}</td>
                    <td>
                      {!ehCliente ? (
                        <select
                          value={a.status || 'Confirmado'}
                          onChange={(e) => mudarStatus(a.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          <option value="Confirmado">Confirmado</option>
                          <option value="Pendente">Pendente</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      ) : (
                        a.status || 'Confirmado'
                      )}
                    </td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/agendamentos/${a.id}`)}
                        >
                          Ver
                        </button>
                        {!ehCliente && (
                          <button
                            type="button"
                            className="btn-editar"
                            onClick={() => navigate(`/agendamentos/${a.id}/editar`)}
                          >
                            Editar
                          </button>
                        )}
                        {!ehCliente ? (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => remover(a.id)}
                          >
                            Excluir
                          </button>
                        ) : (
                          a.status !== 'Cancelado' && a.status !== 'Concluído' && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => cancelar(a.id)}
                            >
                              Cancelar
                            </button>
                          )
                        )}
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
