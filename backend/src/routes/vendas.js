const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vendas = await prisma.venda.findMany({
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
        agendamento: true,
        itens: {
          include: {
            produto: true,
            servico: true,
            colaborador: {
              include: {
                pessoa: true
              }
            }
          }
        },
        pagamentos: true,
        pos_venda: true
      }
    });
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const venda = await prisma.venda.findUnique({
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
        agendamento: true,
        itens: {
          include: {
            produto: true,
            servico: true,
            colaborador: {
              include: {
                pessoa: true
              }
            }
          }
        },
        pagamentos: true,
        pos_venda: true
      }
    });

    if (!venda) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    res.json(venda);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_cliente, id_agendamento, id_colaborador, valor_total, valor_desconto, valor_final, status, data } = req.body;
    const novaVenda = await prisma.venda.create({
      data: {
        id_cliente: parseInt(id_cliente),
        id_agendamento: id_agendamento ? parseInt(id_agendamento) : null,
        id_colaborador: parseInt(id_colaborador),
        valor_total: valor_total ? parseFloat(valor_total) : 0,
        valor_desconto: valor_desconto ? parseFloat(valor_desconto) : 0,
        valor_final: valor_final ? parseFloat(valor_final) : 0,
        status: status || 'Pendente',
        data: data ? new Date(data) : new Date()
      }
    });
    res.status(201).json(novaVenda);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { id_cliente, id_agendamento, id_colaborador, valor_total, valor_desconto, valor_final, status, data } = req.body;
    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: {
        id_cliente: id_cliente ? parseInt(id_cliente) : undefined,
        id_agendamento: id_agendamento !== undefined ? (id_agendamento ? parseInt(id_agendamento) : null) : undefined,
        id_colaborador: id_colaborador ? parseInt(id_colaborador) : undefined,
        valor_total: valor_total !== undefined ? parseFloat(valor_total) : undefined,
        valor_desconto: valor_desconto !== undefined ? parseFloat(valor_desconto) : undefined,
        valor_final: valor_final !== undefined ? parseFloat(valor_final) : undefined,
        status,
        data: data ? new Date(data) : undefined
      }
    });
    res.json(vendaAtualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.venda.delete({
      where: { id }
    });
    res.json({ message: 'Venda removida com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/itens', async (req, res) => {
  try {
    const idVenda = parseInt(req.params.id);
    const { tipo, id_produto, id_servico, id_colaborador, quantidade, valor_unitario, valor_desconto } = req.body;

    const qtd = quantidade ? parseFloat(quantidade) : 1;
    const unitario = parseFloat(valor_unitario);
    const desconto = valor_desconto ? parseFloat(valor_desconto) : 0;
    const totalItem = (qtd * unitario) - desconto;

    const novoItem = await prisma.vendaItem.create({
      data: {
        id_venda: idVenda,
        tipo,
        id_produto: id_produto ? parseInt(id_produto) : null,
        id_servico: id_servico ? parseInt(id_servico) : null,
        id_colaborador: id_colaborador ? parseInt(id_colaborador) : null,
        quantidade: qtd,
        valor_unitario: unitario,
        valor_desconto: desconto,
        valor_total: totalItem
      }
    });

    const itensVenda = await prisma.vendaItem.findMany({
      where: { id_venda: idVenda }
    });

    const somaItens = itensVenda.reduce((acc, item) => acc + item.valor_total, 0);

    const venda = await prisma.venda.findUnique({ where: { id: idVenda } });
    const valorDescontoVenda = venda.valor_desconto || 0;

    await prisma.venda.update({
      where: { id: idVenda },
      data: {
        valor_total: somaItens,
        valor_final: Math.max(0, somaItens - valorDescontoVenda)
      }
    });

    res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/itens/:id', async (req, res) => {
  try {
    const idItem = parseInt(req.params.id);
    const item = await prisma.vendaItem.findUnique({
      where: { id: idItem }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const idVenda = item.id_venda;

    await prisma.vendaItem.delete({
      where: { id: idItem }
    });

    const itensVenda = await prisma.vendaItem.findMany({
      where: { id_venda: idVenda }
    });

    const somaItens = itensVenda.reduce((acc, it) => acc + it.valor_total, 0);
    const venda = await prisma.venda.findUnique({ where: { id: idVenda } });
    const valorDescontoVenda = venda ? (venda.valor_desconto || 0) : 0;

    if (venda) {
      await prisma.venda.update({
        where: { id: idVenda },
        data: {
          valor_total: somaItens,
          valor_final: Math.max(0, somaItens - valorDescontoVenda)
        }
      });
    }

    res.json({ message: 'Item removido da venda com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id/pagamentos', async (req, res) => {
  try {
    const idVenda = parseInt(req.params.id);
    const { forma_pagamento, valor, status, data_pagamento } = req.body;

    const novoPagamento = await prisma.vendaPagamento.create({
      data: {
        id_venda: idVenda,
        forma_pagamento,
        valor: parseFloat(valor),
        status: status || 'Pago',
        data_pagamento: data_pagamento ? new Date(data_pagamento) : new Date()
      }
    });

    res.status(201).json(novoPagamento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/pagamentos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.vendaPagamento.delete({
      where: { id }
    });
    res.json({ message: 'Pagamento removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
