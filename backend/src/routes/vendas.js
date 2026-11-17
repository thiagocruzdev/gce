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
    const itens = await prisma.vendaItem.findMany({
      where: { id_venda: id }
    });

    for (const item of itens) {
      if (item.tipo === 'PRODUTO' && item.id_produto) {
        const produto = await prisma.produto.findUnique({
          where: { id: item.id_produto }
        });
        if (produto) {
          await prisma.produto.update({
            where: { id: item.id_produto },
            data: { qntd: produto.qntd + item.quantidade }
          });
        }
      }
    }

    const idsItens = itens.map(i => i.id);
    if (idsItens.length > 0) {
      await prisma.estoqueMovimentacao.deleteMany({
        where: { id_venda_item: { in: idsItens } }
      });
    }

    await prisma.vendaItem.deleteMany({
      where: { id_venda: id }
    });

    await prisma.vendaPagamento.deleteMany({
      where: { id_venda: id }
    });

    await prisma.posVenda.deleteMany({
      where: { id_venda: id }
    });

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
    if (isNaN(qtd) || qtd <= 0) {
      return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
    }

    const unitario = parseFloat(valor_unitario);
    if (isNaN(unitario) || unitario < 0) {
      return res.status(400).json({ error: 'Valor unitário inválido' });
    }

    const desconto = valor_desconto ? parseFloat(valor_desconto) : 0;
    const totalItem = (qtd * unitario) - desconto;

    if (tipo === 'PRODUTO') {
      if (!id_produto) {
        return res.status(400).json({ error: 'Produto não informado' });
      }
      const produto = await prisma.produto.findUnique({
        where: { id: parseInt(id_produto) }
      });
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      if (produto.qntd < qtd) {
        return res.status(400).json({ error: 'Quantidade insuficiente em estoque' });
      }

      await prisma.produto.update({
        where: { id: parseInt(id_produto) },
        data: { qntd: produto.qntd - qtd }
      });
    }

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

    if (tipo === 'PRODUTO') {
      await prisma.estoqueMovimentacao.create({
        data: {
          id_produto: parseInt(id_produto),
          id_venda_item: novoItem.id,
          tipo: 'SAIDA',
          quantidade: qtd,
          motivo: `Venda #${idVenda}`,
          data: new Date()
        }
      });
    }

    const itensVenda = await prisma.vendaItem.findMany({
      where: { id_venda: idVenda }
    });

    const somaItens = itensVenda.reduce((acc, item) => acc + item.valor_total, 0);

    const venda = await prisma.venda.findUnique({ where: { id: idVenda } });
    const valorDescontoVenda = venda ? (venda.valor_desconto || 0) : 0;

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

    if (item.tipo === 'PRODUTO' && item.id_produto) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.id_produto }
      });
      if (produto) {
        await prisma.produto.update({
          where: { id: item.id_produto },
          data: { qntd: produto.qntd + item.quantidade }
        });

        await prisma.estoqueMovimentacao.create({
          data: {
            id_produto: item.id_produto,
            id_venda_item: null,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            motivo: `Cancelamento de item na Venda #${idVenda}`,
            data: new Date()
          }
        });
      }
    }

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
