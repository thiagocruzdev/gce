import React, { useEffect, useState } from 'react';
import { getAgendamentos, getClientes, getColaboradores, getServicos, criarAgendamento, atualizarAgendamento, excluirAgendamento } from '../services/api';

export default function Agendamentos({ setMensagem }) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [idCliente, setIdCliente] = useState('');
  const [idColaborador, setIdColaborador] = useState('');
  const [idServico, setIdServico] = useState('');
  const [dataMarcada, setDataMarcada] = useState('');
  const [horaInicio, setHoraInicio] = useState('14:00');
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    try {
      const listaAgendamentos = await getAgendamentos();
      const listaClientes = await getClientes();
      const listaColab = await getColaboradores();
      const listaServicos = await getServicos();

      setAgendamentos(listaAgendamentos);
      setClientes(listaClientes);
      setColaboradores(listaColab);
      setServicos(listaServicos);
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
        status: 'Pendente'
      });

      setIdCliente('');
      setIdColaborador('');
      setIdServico('');
      setDataMarcada('');
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
    const confirmou = window.confirm('Deseja excluir este agendamento?');
    if (!confirmou) return;

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
      <div className="topo-pagina">
        <h2>Agenda de Atendimentos</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Agendamento'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Marcar novo horário</h3>
          <form onSubmit={cadastrar}>
            <div className="campo">
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

            <div className="linha-campos">
              <div className="campo">
                <label>Serviço / Procedimento *</label>
                <select
                  value={idServico}
                  onChange={(e) => setIdServico(e.target.value)}
                  required
                >
                  <option value="">Selecione o serviço...</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome} (R$ {s.valor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
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

            <div className="linha-campos">
              <div className="campo">
                <label>Data *</label>
                <input
                  type="date"
                  value={dataMarcada}
                  onChange={(e) => setDataMarcada(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Horário</label>
                <input
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
            </div>

            <div className="campo">
              <label>Observações</label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Primeira consulta, pele sensível..."
              />
            </div>

            <button type="submit" className="btn btn-principal">
              Confirmar Agendamento
            </button>
          </form>
        </div>
      )}

      <div className="tabela-container">
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
                <td colSpan="7">Nenhum agendamento marcado.</td>
              </tr>
            ) : (
              agendamentos.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.data_marcada).toLocaleDateString('pt-BR')}</td>
                  <td>{a.hora_inicio || '-'}</td>
                  <td>{a.cliente?.pessoa?.nome || 'Cliente'}</td>
                  <td>{a.servico?.nome || 'Serviço'}</td>
                  <td>{a.colaborador?.pessoa?.nome || 'Profissional'}</td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => mudarStatus(a.id, e.target.value)}
                      style={{ padding: '4px', borderRadius: '4px' }}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Concluído">Concluído</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-excluir"
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
  );
}
