import React, { useEffect, useState } from 'react';
import {
  getAgendamentos,
  getClientes,
  getColaboradores,
  getServicos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento
} from '../services/api';

export default function Agendamentos({ setMensagem }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [idServico, setIdServico] = useState('');
  const [dataMarcada, setDataMarcada] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    try {
      const [listaAgendamentos, listaClientes, listaColab, listaServicos] = await Promise.all([
        getAgendamentos().catch(() => []),
        getClientes().catch(() => []),
        getColaboradores().catch(() => []),
        getServicos().catch(() => [])
      ]);

      setAgendamentos(listaAgendamentos || []);
      setClientes(listaClientes || []);
      setColaboradores(listaColab || []);
      setServicos(listaServicos || []);
    } catch (erro) {
      console.log('Erro ao carregar agendamentos:', erro);
    }
  }

  async function cadastrar(e) {
    e.preventDefault();

    if (!idCliente || !idColaborador || !idServico || !dataMarcada) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    try {
      await criarAgendamento({
        id_cliente: parseInt(idCliente),
        id_colaborador: parseInt(idColaborador),
        id_servico: parseInt(idServico),
        data_marcada: dataMarcada,
        hora_inicio: horaInicio,
        observacao: observacao,
        status: 'Confirmado'
      });

      setIdCliente('');
      setIdColaborador('');
      setIdServico('');
      setObservacao('');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Agendamento cadastrado com sucesso!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao agendar: ' + erro.message);
    }
  }

  async function mudarStatus(id, novoStatus) {
    try {
      await atualizarAgendamento(id, { status: novoStatus });
      if (setMensagem) setMensagem('Status atualizado!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao mudar status: ' + erro.message);
    }
  }

  async function remover(id) {
    if (!window.confirm('Deseja excluir este agendamento?')) return;
    try {
      await excluirAgendamento(id);
      if (setMensagem) setMensagem('Agendamento excluído!');
      carregarTudo();
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Agendamentos</h2>
          <p>Gerenciamento da agenda de atendimentos da clínica</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Agendamento'}
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h3 className="form-title">Marcar Horário</h3>
          <form onSubmit={cadastrar}>
            <div className="form-group">
              <label>Cliente *</label>
              <select
                value={idCliente}
                onChange={(e) => setIdCliente(e.target.value)}
                required
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id_pessoa} value={c.id_pessoa}>
                    {c.pessoa?.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Serviço / Procedimento *</label>
                <select
                  value={idServico}
                  onChange={(e) => setIdServico(e.target.value)}
                  required
                >
                  <option value="">Selecione o serviço...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} (R$ {Number(s.valor || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Profissional *</label>
                <select
                  value={idColaborador}
                  onChange={(e) => setIdColaborador(e.target.value)}
                  required
                >
                  <option value="">Selecione o profissional...</option>
                  {colaboradores.map((colab) => (
                    <option key={colab.id_pessoa} value={colab.id_pessoa}>
                      {colab.pessoa?.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  value={dataMarcada}
                  onChange={(e) => setDataMarcada(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Horário *</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Observações</label>
              <textarea
                rows="2"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Primeira consulta, cuidados específicos..."
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
                Confirmar Agendamento
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header-box">
          <h3>Horários Agendados ({agendamentos.length})</h3>
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
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                agendamentos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.data_marcada ? new Date(a.data_marcada).toLocaleDateString('pt-BR') : '-'}</td>
                    <td><strong>{a.hora_inicio || '-'}</strong></td>
                    <td>{a.cliente?.pessoa?.nome || 'Cliente'}</td>
                    <td>{a.servico?.nome || 'Serviço'}</td>
                    <td>{a.colaborador?.pessoa?.nome || 'Profissional'}</td>
                    <td>
                      <select
                        value={a.status || 'Confirmado'}
                        onChange={(e) => mudarStatus(a.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          fontSize: '12.5px',
                          fontWeight: '600',
                          backgroundColor: a.status === 'Confirmado' || a.status === 'Concluído' ? '#e6f4ea' : '#fef3d6',
                          color: a.status === 'Confirmado' || a.status === 'Concluído' ? '#1e7e34' : '#b27300'
                        }}
                      >
                        <option value="Confirmado">Confirmado</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Concluído">Concluído</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remover(a.id)}
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
