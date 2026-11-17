const express = require('express');
const prisma = require('../prisma');
const { optionalAuthMiddleware } = require('../utils/auth');

const router = express.Router();

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

    const novoAgendamento = await prisma.agendamento.create({
      data: {
        id_cliente: parseInt(id_cliente),
        id_colaborador: parseInt(id_colaborador),
        id_servico: parseInt(id_servico),
        data_marcada: new Date(data_marcada),
        hora_inicio: hora_inicio || '09:00',
        hora_fim: hora_fim || null,
        valor_previsto: valor_previsto ? parseFloat(valor_previsto) : null,
        status: status || 'Confirmado',
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
    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id },
      data: {
        id_cliente: id_cliente ? parseInt(id_cliente) : undefined,
        id_colaborador: id_colaborador ? parseInt(id_colaborador) : undefined,
        id_servico: id_servico ? parseInt(id_servico) : undefined,
        data_marcada: data_marcada ? new Date(data_marcada) : undefined,
        hora_inicio,
        hora_fim,
        valor_previsto: valor_previsto !== undefined ? (valor_previsto ? parseFloat(valor_previsto) : null) : undefined,
        status,
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

router.delete('/:id', async (req, res) => {
  try {
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
