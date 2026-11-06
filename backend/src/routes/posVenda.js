const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const avaliacoes = await prisma.posVenda.findMany({
      include: {
        venda: {
          include: {
            cliente: {
              include: {
                pessoa: true
              }
            }
          }
        }
      }
    });
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const avaliacao = await prisma.posVenda.findUnique({
      where: { id },
      include: {
        venda: true
      }
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    res.json(avaliacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/venda/:id_venda', async (req, res) => {
  try {
    const idVenda = parseInt(req.params.id_venda);
    const avaliacao = await prisma.posVenda.findUnique({
      where: { id_venda: idVenda },
      include: {
        venda: true
      }
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada para esta venda' });
    }

    res.json(avaliacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_venda, avaliacao, comentario, data } = req.body;
    const novaAvaliacao = await prisma.posVenda.create({
      data: {
        id_venda: parseInt(id_venda),
        avaliacao: parseInt(avaliacao),
        comentario,
        data: data ? new Date(data) : new Date()
      }
    });
    res.status(201).json(novaAvaliacao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { avaliacao, comentario } = req.body;
    const avaliacaoAtualizada = await prisma.posVenda.update({
      where: { id },
      data: {
        avaliacao: avaliacao !== undefined ? parseInt(avaliacao) : undefined,
        comentario
      }
    });
    res.json(avaliacaoAtualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.posVenda.delete({
      where: { id }
    });
    res.json({ message: 'Avaliação removida com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
