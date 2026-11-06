const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        pessoa: true,
        servico_preferido: true,
        colaborador_preferido: {
          include: {
            pessoa: true
          }
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    const cliente = await prisma.cliente.findUnique({
      where: { id_pessoa: idPessoa },
      include: {
        pessoa: true,
        servico_preferido: true,
        colaborador_preferido: {
          include: {
            pessoa: true
          }
        },
        agendamentos: true,
        vendas: true
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_pessoa, pref_horario, pref_servico, pref_colaborador } = req.body;
    const novoCliente = await prisma.cliente.create({
      data: {
        id_pessoa: parseInt(id_pessoa),
        pref_horario,
        pref_servico: pref_servico ? parseInt(pref_servico) : null,
        pref_colaborador: pref_colaborador ? parseInt(pref_colaborador) : null
      },
      include: {
        pessoa: true
      }
    });
    res.status(201).json(novoCliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    const { pref_horario, pref_servico, pref_colaborador } = req.body;
    const clienteAtualizado = await prisma.cliente.update({
      where: { id_pessoa: idPessoa },
      data: {
        pref_horario,
        pref_servico: pref_servico !== undefined ? (pref_servico ? parseInt(pref_servico) : null) : undefined,
        pref_colaborador: pref_colaborador !== undefined ? (pref_colaborador ? parseInt(pref_colaborador) : null) : undefined
      },
      include: {
        pessoa: true
      }
    });
    res.json(clienteAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    await prisma.cliente.delete({
      where: { id_pessoa: idPessoa }
    });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
