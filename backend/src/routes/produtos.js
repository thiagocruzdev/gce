const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        servico_produtos: true,
        estoque_movimentacoes: true
      }
    });

    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, descricao, valor_custo, valor_venda, qntd, qntd_min, status } = req.body;
    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        valor_custo: valor_custo ? parseFloat(valor_custo) : null,
        valor_venda: parseFloat(valor_venda),
        qntd: qntd ? parseFloat(qntd) : 0,
        qntd_min: qntd_min ? parseFloat(qntd_min) : 0,
        status: status !== undefined ? Boolean(status) : true
      }
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, descricao, valor_custo, valor_venda, qntd, qntd_min, status } = req.body;
    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        descricao,
        valor_custo: valor_custo !== undefined ? (valor_custo ? parseFloat(valor_custo) : null) : undefined,
        valor_venda: valor_venda !== undefined ? parseFloat(valor_venda) : undefined,
        qntd: qntd !== undefined ? parseFloat(qntd) : undefined,
        qntd_min: qntd_min !== undefined ? parseFloat(qntd_min) : undefined,
        status: status !== undefined ? Boolean(status) : undefined
      }
    });
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.produto.delete({
      where: { id }
    });
    res.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
