const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const movimentacoes = await prisma.estoqueMovimentacao.findMany({
      include: {
        produto: true,
        venda_item: true
      }
    });
    res.json(movimentacoes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const movimentacao = await prisma.estoqueMovimentacao.findUnique({
      where: { id },
      include: {
        produto: true,
        venda_item: true
      }
    });

    if (!movimentacao) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json(movimentacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_produto, id_venda_item, tipo, quantidade, motivo, data } = req.body;
    const qtd = parseFloat(quantidade);
    const prodId = parseInt(id_produto);

    const produto = await prisma.produto.findUnique({
      where: { id: prodId }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    let novaQntd = produto.qntd;
    if (tipo === 'ENTRADA') {
      novaQntd += qtd;
    } else if (tipo === 'SAIDA') {
      novaQntd -= qtd;
    } else if (tipo === 'AJUSTE') {
      novaQntd = qtd;
    }

    const movimentacao = await prisma.estoqueMovimentacao.create({
      data: {
        id_produto: prodId,
        id_venda_item: id_venda_item ? parseInt(id_venda_item) : null,
        tipo,
        quantidade: qtd,
        motivo,
        data: data ? new Date(data) : new Date()
      }
    });

    await prisma.produto.update({
      where: { id: prodId },
      data: { qntd: novaQntd }
    });

    res.status(201).json(movimentacao);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
