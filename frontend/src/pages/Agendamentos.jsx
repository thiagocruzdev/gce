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

  // Estados dos filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'feitos' | 'falta_fazer'

  // Estados do formulário
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
      // Se for cliente logado, auto-seleciona ele mesmo
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
      console.log('Erro ao carregar opções:', e);
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
      console.log('Erro ao carregar agendamentos:', erro);
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
    if (!idCliente) novosErros.idCliente = 'Selecione a cliente para o agendamento';
    if (!idColaborador) novosErros.idColaborador = 'Selecione o profissional responsável';
    if (!idServico) novosErros.idServico = 'Selecione o serviço / procedimento';
    if (!dataMarcada) novosErros.dataMarcada = 'A data do agendamento é obrigatória';
    if (!horaInicio) novosErros.horaInicio = 'O horário é obrigatório';

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
        if (setMensagem) setMensagem('Agendamento realizado com sucesso!');
        navigate('/agendamentos');
      }
    } catch (erro) {
      alert('Erro ao salvar agendamento: ' + erro.message);
    }
  }

  async function mudarStatus(idAgendamento, novoStatus) {
    try {
      await atualizarAgendamento(idAgendamento, { status: novoStatus });
      if (setMensagem) setMensagem(`Status atualizado para "${novoStatus}"!`);
      carregarAgendamentos();
    } catch (erro) {
      alert('Erro ao alterar status: ' + erro.message);
    }
  }

  async function remover(idAgendamento) {
    if (!window.confirm('Deseja realmente cancelar e excluir este agendamento?')) return;
    try {
      await excluirAgendamento(idAgendamento);
      if (setMensagem) setMensagem('Agendamento cancelado com sucesso!');
      if (mode === 'list') {
        carregarAgendamentos();
      } else {
        navigate('/agendamentos');
      }
    } catch (erro) {
      alert('Erro ao excluir agendamento: ' + erro.message);
    }
  }

  // Filtragem dos agendamentos
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

  // Visão Detalhes
  if (mode === 'view') {
    if (carregando && !agendamentoAtual) {
      return <div className="table-empty">Carregando detalhes do agendamento...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Agendamento</h2>
            <p>Horário #{agendamentoAtual?.id} &bull; {agendamentoAtual?.servico?.nome || 'Procedimento'}</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
              &larr; Voltar para Agenda
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/agendamentos/${id}/editar`)}>
              Editar Agendamento
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{agendamentoAtual?.servico?.nome}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Data: {agendamentoAtual?.data_marcada ? new Date(agendamentoAtual.data_marcada).toLocaleDateString('pt-BR') : '-'} às {agendamentoAtual?.hora_inicio || '09:00'}
              </div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Cancelar Agendamento
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Cliente</span>
              <span className="view-value">{agendamentoAtual?.cliente?.pessoa?.nome || 'Não identificado'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Telefone da Cliente</span>
              <span className="view-value">{agendamentoAtual?.cliente?.pessoa?.telefone || 'Não informado'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Profissional Responsável</span>
              <span className="view-value">{agendamentoAtual?.colaborador?.pessoa?.nome || 'Profissional'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Especialidade</span>
              <span className="view-value">{agendamentoAtual?.colaborador?.especializacao || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Valor Estimado</span>
              <span className="view-value">
                R$ {Number(agendamentoAtual?.valor_previsto || agendamentoAtual?.servico?.valor || 0).toFixed(2)}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Situação</span>
              <span className="view-value">
                <span className={`badge badge-${(agendamentoAtual?.status || '').toLowerCase()}`}>
                  {agendamentoAtual?.status || 'Confirmado'}
                </span>
              </span>
            </div>
          </div>

          {agendamentoAtual?.observacao && (
            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Observações Clínicas:
              </strong>
              <p style={{ margin: 0, fontSize: '14px' }}>{agendamentoAtual.observacao}</p>
            </div>
          )}

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/agendamentos/${id}/editar`)}>
              Editar Agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Visão Cadastro / Edição
  if (mode === 'edit') {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>{id ? `Editar Agendamento #${id}` : 'Novo Agendamento'}</h2>
            <p>{id ? 'Altere as informações do horário marcado' : 'Preencha os dados do procedimento'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/agendamentos')}>
            &larr; Voltar para Agenda
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">{id ? 'Alterar Horário Marcado' : 'Agendar Novo Atendimento'}</h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cliente *</label>
                {ehCliente ? (
                  <input
                    type="text"
                    value={usuario?.nome || 'Você'}
                    disabled
                    style={{ backgroundColor: '#f0f0f0' }}
                  />
                ) : (
                  <select
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                    style={{ borderColor: errosForm.idCliente ? 'var(--red-text)' : undefined }}
                  >
                    <option value="">Selecione a cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id_pessoa} value={c.id_pessoa}>
                        {c.pessoa?.nome} ({c.pessoa?.cpf || 'Sem CPF'})
                      </option>
                    ))}
                  </select>
                )}
                {errosForm.idCliente && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idCliente}</span>}
              </div>

              <div className="form-group">
                <label>Profissional Responsável *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  style={{ borderColor: errosForm.idColaborador ? 'var(--red-text)' : undefined }}
                >
                  <option value="">Selecione o profissional...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome} — {colab.especializacao || 'Esteticista'}
                    </option>
                  ))}
                </select>
                {errosForm.idColaborador && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idColaborador}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Procedimento / Serviço *</label>
                <select
                  value={idServico}
                  onChange={(e) => setIdServico(e.target.value)}
                  style={{ borderColor: errosForm.idServico ? 'var(--red-text)' : undefined }}
                >
                  <option value="">Selecione o procedimento...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R$ {Number(s.valor || 0).toFixed(2)} ({s.duracao_minutos || 60} min)
                    </option>
                  ))}
                </select>
                {errosForm.idServico && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.idServico}</span>}
              </div>

              <div className="form-group">
                <label>Data Marcada *</label>
                <input
                  type="date"
                  value={dataMarcada}
                  onChange={(e) => setDataMarcada(e.target.value)}
                  style={{ borderColor: errosForm.dataMarcada ? 'var(--red-text)' : undefined }}
                />
                {errosForm.dataMarcada && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.dataMarcada}</span>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Horário de Início *</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  style={{ borderColor: errosForm.horaInicio ? 'var(--red-text)' : undefined }}
                />
                {errosForm.horaInicio && <span style={{ color: 'var(--red-text)', fontSize: '12px' }}>{errosForm.horaInicio}</span>}
              </div>

              <div className="form-group">
                <label>Status do Horário</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Observações Clínicas / Preferências</label>
              <textarea
                rows="3"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: pele sensível, recomendações pós-procedimento..."
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
                {id ? 'Salvar Alterações' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Visão Listagem Principal
  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>{ehCliente ? 'Meus Agendamentos' : ehColaborador ? 'Minha Agenda de Atendimentos' : 'Agendamentos da Clínica'}</h2>
          <p>
            {ehCliente
              ? 'Consulte seus horários marcados ou agende novos procedimentos'
              : ehColaborador
              ? 'Consulte os agendamentos que você já fez e os que ainda falta fazer'
              : 'Gerenciamento completo da agenda de atendimentos da clínica'}
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/agendamentos/novo')}
        >
          + Novo Agendamento
        </button>
      </div>

      {/* ABAS RÁPIDAS PARA O COLABORADOR / PROPRIETÁRIO: FEITOS vs FALTA FAZER */}
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
            ⏳ Falta Fazer (Próximos)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${filtroTipo === 'feitos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroTipo('feitos')}
          >
            ✅ Feitos (Concluídos / Histórico)
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE FILTRO DE DADOS */}
      <div className="view-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ fontSize: '12px' }}>Buscar por Cliente, Serviço ou Profissional</label>
            <input
              type="text"
              className="search-input"
              placeholder="Digite para filtrar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Situação / Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div className="form-group" style={{ minWidth: '150px' }}>
            <label style={{ fontSize: '12px' }}>Data Específica</label>
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
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* TABELA DE AGENDAMENTOS */}
      <div className="table-card">
        <div className="table-header-box">
          <h3>
            {ehCliente ? 'Meus Atendimentos' : 'Horários Agendados'} ({agendamentosFiltrados.length})
          </h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/agendamentos/novo')}
          >
            + Adicionar
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Cliente</th>
                <th>Procedimento</th>
                <th>Profissional</th>
                <th>Valor Est.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    {carregando ? 'Carregando agenda...' : 'Nenhum agendamento encontrado para os filtros selecionados.'}
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
                            fontWeight: '600',
                            backgroundColor:
                              a.status === 'Confirmado' || a.status === 'Concluído' ? '#e6f4ea' : '#fef3d6',
                            color:
                              a.status === 'Confirmado' || a.status === 'Concluído' ? '#1e7e34' : '#b27300'
                          }}
                        >
                          <option value="Confirmado">Confirmado</option>
                          <option value="Pendente">Pendente</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${(a.status || '').toLowerCase()}`}>
                          {a.status || 'Confirmado'}
                        </span>
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
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(a.id)}
                        >
                          Cancelar
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
