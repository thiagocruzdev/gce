const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const servicos = await prisma.servico.findMany({
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      }
    });
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const servico = await prisma.servico.findUnique({
      where: { id },
      include: {
        produtos: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!servico) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json(servico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, descricao, valor, duracao_minutos, status } = req.body;
    const novoServico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        valor: parseFloat(valor),
        duracao_minutos: duracao_minutos ? parseInt(duracao_minutos) : null,
        status: status !== undefined ? Boolean(status) : true
      }
    });
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, descricao, valor, duracao_minutos, status } = req.body;
    const servicoAtualizado = await prisma.servico.update({
      where: { id },
      data: {
        nome,
        descricao,
        valor: valor !== undefined ? parseFloat(valor) : undefined,
        duracao_minutos: duracao_minutos !== undefined ? (duracao_minutos ? parseInt(duracao_minutos) : null) : undefined,
        status: status !== undefined ? Boolean(status) : undefined
      }
    });
    res.json(servicoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.servico.delete({
      where: { id }
    });
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/produtos', async (req, res) => {
  try {
    const idServico = parseInt(req.params.id);
    const { id_produto, quantidade } = req.body;
    const servicoProduto = await prisma.servicoProduto.create({
      data: {
        id_servico: idServico,
        id_produto: parseInt(id_produto),
        quantidade: parseFloat(quantidade)
      },
      include: {
        produto: true
      }
    });
    res.status(201).json(servicoProduto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/produtos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.servicoProduto.delete({
      where: { id }
    });
    res.json({ message: 'Produto do serviço removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
