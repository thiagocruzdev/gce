const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const agendamentos = await prisma.agendamento.findMany({
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
    res.json(agendamentos);
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

router.post('/', async (req, res) => {
  try {
    const { id_cliente, id_colaborador, id_servico, data_marcada, hora_inicio, hora_fim, valor_previsto, status, observacao } = req.body;
    const novoAgendamento = await prisma.agendamento.create({
      data: {
        id_cliente: parseInt(id_cliente),
        id_colaborador: parseInt(id_colaborador),
        id_servico: parseInt(id_servico),
        data_marcada: new Date(data_marcada),
        hora_inicio,
        hora_fim,
        valor_previsto: valor_previsto ? parseFloat(valor_previsto) : null,
        status: status || 'Pendente',
        observacao
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
