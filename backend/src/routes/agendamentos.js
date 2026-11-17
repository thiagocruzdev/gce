const express = require('express');
const prisma = require('../prisma');
const { optionalAuthMiddleware } = require('../utils/auth');

const router = express.Router();

function converterParaMinutos(horaStr) {
  if (!horaStr) return 0;
  const partes = horaStr.split(':');
  return parseInt(partes[0]) * 60 + (parseInt(partes[1]) || 0);
}

function somarMinutos(horaStr, minutos) {
  const total = converterParaMinutos(horaStr) + minutos;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const hStr = h < 10 ? '0' + h : '' + h;
  const mStr = m < 10 ? '0' + m : '' + m;
  return `${hStr}:${mStr}`;
}

router.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { id_cliente, id_colaborador, status, data, tipo } = req.query;

    const where = {};

    if (req.user && req.user.role === 'CLIENTE' && req.user.id_pessoa) {
      where.id_cliente = req.user.id_pessoa;
    } else if (id_cliente) {
      where.id_cliente = parseInt(id_cliente);
    }

    if (req.user && req.user.role === 'COLABORADOR' && req.user.id_pessoa && !id_colaborador) {
      where.id_colaborador = req.user.id_pessoa;
    } else if (id_colaborador) {
      where.id_colaborador = parseInt(id_colaborador);
    }

    if (status) {
      where.status = status;
    }

    if (data) {
      const dataInicio = new Date(data);
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);
      where.data_marcada = {
        gte: dataInicio,
        lte: dataFim
      };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (tipo === 'feitos') {
      where.OR = [
        { status: 'Concluído' },
        { data_marcada: { lt: hoje } }
      ];
    } else if (tipo === 'falta_fazer') {
      where.AND = [
        { status: { in: ['Confirmado', 'Pendente', 'Em andamento'] } },
        { data_marcada: { gte: hoje } }
      ];
    }

    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        cliente: {
          include: {
            pessoa: true
          }
        },
        colaborador: {
          include: {
            pessoa: true
          }
        },
        servico: true
      },
      orderBy: { data_marcada: 'asc' }
    });

    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/colaborador-painel/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const idColab = parseInt(req.params.id);
    if (isNaN(idColab)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const todos = await prisma.agendamento.findMany({
      where: { id_colaborador: idColab },
      include: {
        cliente: {
          include: { pessoa: true }
        },
        servico: true
      },
      orderBy: { data_marcada: 'asc' }
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const feitos = [];
    const faltaFazer = [];

    todos.forEach((item) => {
      const dataItem = new Date(item.data_marcada);
      if (item.status === 'Concluído' || dataItem < hoje) {
        feitos.push(item);
      } else {
        faltaFazer.push(item);
      }
    });

    res.json({
      colaborador_id: idColab,
      total_feitos: feitos.length,
      total_falta_fazer: faltaFazer.length,
      feitos,
      falta_fazer: faltaFazer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: {
        cliente: {
          include: {
            pessoa: true
          }
        },
        colaborador: {
          include: {
            pessoa: true
          }
        },
        servico: true,
        vendas: true
      }
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json(agendamento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', optionalAuthMiddleware, async (req, res) => {
  try {
    let { id_cliente, id_colaborador, id_servico, data_marcada, hora_inicio, hora_fim, valor_previsto, status, observacao } = req.body;

    if (req.user && req.user.role === 'CLIENTE' && req.user.id_pessoa) {
      id_cliente = req.user.id_pessoa;
    }

    if (!id_cliente || !id_colaborador || !id_servico || !data_marcada) {
      return res.status(400).json({ error: 'Preencha os campos obrigatórios' });
    }

    const dataObj = new Date(data_marcada);
    if (isNaN(dataObj.getTime())) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    const dataStr = String(data_marcada).substring(0, 10);
    const hojeStr = new Date().toLocaleDateString('en-CA');
    if (dataStr < hojeStr) {
      return res.status(400).json({ error: 'Não é possível agendar em datas passadas' });
    }

    const hora = hora_inicio || '09:00';
    const statusAgendamento = status || 'Confirmado';

    const cliente = await prisma.cliente.findUnique({
      where: { id_pessoa: parseInt(id_cliente) }
    });
    if (!cliente) {
      return res.status(400).json({ error: 'Cliente não encontrado' });
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: { id_pessoa: parseInt(id_colaborador) }
    });
    if (!colaborador) {
      return res.status(400).json({ error: 'Colaborador não encontrado' });
    }

    const servico = await prisma.servico.findUnique({
      where: { id: parseInt(id_servico) }
    });
    if (!servico) {
      return res.status(400).json({ error: 'Serviço não encontrado' });
    }

    const duracao = servico && servico.duracao_minutos ? servico.duracao_minutos : 60;
    const fimCalculado = hora_fim || somarMinutos(hora, duracao);

    if (statusAgendamento !== 'Cancelado') {
      const diaInicio = new Date(`${dataStr}T00:00:00.000Z`);
      const diaFim = new Date(`${dataStr}T23:59:59.999Z`);

      const agendamentosDia = await prisma.agendamento.findMany({
        where: {
          data_marcada: {
            gte: diaInicio,
            lte: diaFim
          },
          status: {
            not: 'Cancelado'
          }
        },
        include: {
          servico: true
        }
      });

      for (const item of agendamentosDia) {
        const itemDuracao = item.servico && item.servico.duracao_minutos ? item.servico.duracao_minutos : 60;
        const itemFim = item.hora_fim || somarMinutos(item.hora_inicio, itemDuracao);

        const temConflito = converterParaMinutos(hora) < converterParaMinutos(itemFim) &&
                            converterParaMinutos(item.hora_inicio) < converterParaMinutos(fimCalculado);

        if (temConflito) {
          if (item.id_colaborador === parseInt(id_colaborador)) {
            return res.status(400).json({ error: 'Este profissional já possui um agendamento marcado neste mesmo dia e horário' });
          }
          if (item.id_cliente === parseInt(id_cliente)) {
            return res.status(400).json({ error: 'Este cliente já possui um agendamento marcado neste mesmo dia e horário' });
          }
        }
      }
    }

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        id_cliente: parseInt(id_cliente),
        id_colaborador: parseInt(id_colaborador),
        id_servico: parseInt(id_servico),
        data_marcada: new Date(`${dataStr}T00:00:00.000Z`),
        hora_inicio: hora,
        hora_fim: fimCalculado,
        valor_previsto: valor_previsto ? parseFloat(valor_previsto) : (servico ? servico.valor : null),
        status: statusAgendamento,
        observacao: observacao || null
      },
      include: {
        cliente: {
          include: {
            pessoa: true
          }
        },
        colaborador: {
          include: {
            pessoa: true
          }
        },
        servico: true
      }
    });
    res.status(201).json(novoAgendamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_cliente, id_colaborador, id_servico, data_marcada, hora_inicio, hora_fim, valor_previsto, status, observacao } = req.body;

    const agendamentoAtual = await prisma.agendamento.findUnique({
      where: { id }
    });

    if (!agendamentoAtual) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const novoCliente = id_cliente ? parseInt(id_cliente) : agendamentoAtual.id_cliente;
    const novoColaborador = id_colaborador ? parseInt(id_colaborador) : agendamentoAtual.id_colaborador;
    const novoServico = id_servico ? parseInt(id_servico) : agendamentoAtual.id_servico;
    const novaDataStr = data_marcada ? String(data_marcada).substring(0, 10) : agendamentoAtual.data_marcada.toISOString().substring(0, 10);
    const novaHora = hora_inicio || agendamentoAtual.hora_inicio;
    const novoStatus = status !== undefined ? status : agendamentoAtual.status;

    const servico = await prisma.servico.findUnique({
      where: { id: novoServico }
    });
    const duracao = servico && servico.duracao_minutos ? servico.duracao_minutos : 60;
    const fimCalculado = hora_fim || somarMinutos(novaHora, duracao);

    if (novoStatus !== 'Cancelado') {
      const diaInicio = new Date(`${novaDataStr}T00:00:00.000Z`);
      const diaFim = new Date(`${novaDataStr}T23:59:59.999Z`);

      const agendamentosDia = await prisma.agendamento.findMany({
        where: {
          id: { not: id },
          data_marcada: {
            gte: diaInicio,
            lte: diaFim
          },
          status: {
            not: 'Cancelado'
          }
        },
        include: {
          servico: true
        }
      });

      for (const item of agendamentosDia) {
        const itemDuracao = item.servico && item.servico.duracao_minutos ? item.servico.duracao_minutos : 60;
        const itemFim = item.hora_fim || somarMinutos(item.hora_inicio, itemDuracao);

        const temConflito = converterParaMinutos(novaHora) < converterParaMinutos(itemFim) &&
                            converterParaMinutos(item.hora_inicio) < converterParaMinutos(fimCalculado);

        if (temConflito) {
          if (item.id_colaborador === novoColaborador) {
            return res.status(400).json({ error: 'Este profissional já possui um agendamento marcado neste mesmo dia e horário' });
          }
          if (item.id_cliente === novoCliente) {
            return res.status(400).json({ error: 'Este cliente já possui um agendamento marcado neste mesmo dia e horário' });
          }
        }
      }
    }

    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        id_cliente: id_cliente ? parseInt(id_cliente) : undefined,
        id_colaborador: id_colaborador ? parseInt(id_colaborador) : undefined,
        id_servico: id_servico ? parseInt(id_servico) : undefined,
        data_marcada: data_marcada ? new Date(`${novaDataStr}T00:00:00.000Z`) : undefined,
        hora_inicio: novaHora,
        hora_fim: fimCalculado,
        valor_previsto: valor_previsto !== undefined ? (valor_previsto ? parseFloat(valor_previsto) : null) : undefined,
        status: novoStatus,
        observacao
      },
      include: {
        cliente: {
          include: { pessoa: true }
        },
        colaborador: {
          include: { pessoa: true }
        },
        servico: true
      }
    });
    res.json(agendamentoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    if (req.user && req.user.role === 'CLIENTE') {
      return res.status(403).json({ error: 'Clientes não podem excluir agendamentos, apenas cancelar' });
    }
    const id = parseInt(req.params.id);
    await prisma.agendamento.delete({
      where: { id }
    });
    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
