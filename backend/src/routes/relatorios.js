const express = require('express');
const prisma = require('../prisma');
const { optionalAuthMiddleware } = require('../utils/auth');

const router = express.Router();

router.get('/multi-tabelas', optionalAuthMiddleware, async (req, res) => {
  try {
    const { data_inicio, data_fim, status, id_colaborador } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (id_colaborador) {
      where.id_colaborador = parseInt(id_colaborador);
    }

    if (data_inicio || data_fim) {
      where.data = {};
      if (data_inicio) {
        where.data.gte = new Date(data_inicio);
      }
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.data.lte = fim;
      }
    }

    const vendas = await prisma.venda.findMany({
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
        agendamento: {
          include: {
            servico: true
          }
        },
        itens: {
          include: {
            produto: true,
            servico: true
          }
        },
        pagamentos: true,
        pos_venda: true
      },
      orderBy: { data: 'desc' }
    });

    let totalBruto = 0;
    let totalDescontos = 0;
    let totalLiquido = 0;
    let totalItens = 0;

    const dados = vendas.map((v) => {
      totalBruto += Number(v.valor_total || 0);
      totalDescontos += Number(v.valor_desconto || 0);
      totalLiquido += Number(v.valor_final || 0);

      (v.itens || []).forEach((item) => {
        totalItens += Number(item.quantidade || 1);
      });

      const nomeItem = v.agendamento?.servico?.nome || (v.itens[0]?.servico?.nome) || (v.itens[0]?.produto?.nome) || 'Procedimento';

      return {
        id_venda: v.id,
        data: v.data,
        status: v.status,
        cliente_nome: v.cliente?.pessoa?.nome || 'Cliente',
        cliente_cpf: v.cliente?.pessoa?.cpf || '-',
        colaborador_nome: v.colaborador?.pessoa?.nome || 'Colaborador',
        procedimento_principal: nomeItem,
        quantidade_itens: v.itens?.length || 0,
        formas_pagamento: (v.pagamentos || []).map((p) => p.forma_pagamento).join(', ') || 'Outro',
        avaliacao_pos_venda: v.pos_venda?.avaliacao ? `${v.pos_venda.avaliacao} ★` : '-',
        valor_bruto: Number(v.valor_total || 0),
        valor_desconto: Number(v.valor_desconto || 0),
        valor_final: Number(v.valor_final || 0)
      };
    });

    const totalVendas = dados.length;
    const ticketMedio = totalVendas > 0 ? totalLiquido / totalVendas : 0;

    res.json({
      totalizacao: {
        total_vendas: totalVendas,
        total_bruto: Number(totalBruto.toFixed(2)),
        total_descontos: Number(totalDescontos.toFixed(2)),
        total_liquido: Number(totalLiquido.toFixed(2)),
        ticket_medio: Number(ticketMedio.toFixed(2)),
        total_itens_vendidos: totalItens
      },
      dados
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agrupamentos', optionalAuthMiddleware, async (req, res) => {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        colaborador: {
          include: { pessoa: true }
        }
      }
    });

    const colabMap = {};
    vendas.forEach((v) => {
      const id = v.id_colaborador;
      const nome = v.colaborador?.pessoa?.nome || `Colaborador #${id}`;
      if (!colabMap[id]) {
        colabMap[id] = { id_colaborador: id, nome, quantidade_vendas: 0, total_faturado: 0 };
      }
      colabMap[id].quantidade_vendas += 1;
      colabMap[id].total_faturado += Number(v.valor_final || 0);
    });

    const porColaborador = Object.values(colabMap).map((c) => ({
      ...c,
      total_faturado: Number(c.total_faturado.toFixed(2))
    }));

    const itens = await prisma.vendaItem.findMany({
      include: { servico: true, produto: true }
    });

    const itemMap = {};
    itens.forEach((it) => {
      const nome = it.tipo === 'SERVICO' ? (it.servico?.nome || 'Serviço') : (it.produto?.nome || 'Produto');
      if (!itemMap[nome]) {
        itemMap[nome] = { nome, tipo: it.tipo, quantidade_total: 0, total_arrecadado: 0 };
      }
      itemMap[nome].quantidade_total += Number(it.quantidade || 1);
      itemMap[nome].total_arrecadado += Number(it.valor_total || 0);
    });

    const porProcedimento = Object.values(itemMap).map((it) => ({
      ...it,
      total_arrecadado: Number(it.total_arrecadado.toFixed(2))
    }));

    const agendamentos = await prisma.agendamento.findMany();
    const statusMap = {};
    agendamentos.forEach((a) => {
      const st = a.status || 'Pendente';
      statusMap[st] = (statusMap[st] || 0) + 1;
    });

    const agendamentosStatus = Object.keys(statusMap).map((status) => ({
      status,
      quantidade: statusMap[status]
    }));

    const pagamentos = await prisma.vendaPagamento.findMany();
    const pagtoMap = {};
    pagamentos.forEach((p) => {
      const forma = p.forma_pagamento || 'Outro';
      if (!pagtoMap[forma]) {
        pagtoMap[forma] = { forma, quantidade: 0, valor_total: 0 };
      }
      pagtoMap[forma].quantidade += 1;
      pagtoMap[forma].valor_total += Number(p.valor || 0);
    });

    const porFormaPagamento = Object.values(pagtoMap).map((pg) => ({
      ...pg,
      valor_total: Number(pg.valor_total.toFixed(2))
    }));

    res.json({
      por_colaborador: porColaborador,
      por_procedimento: porProcedimento,
      agendamentos_por_status: agendamentosStatus,
      por_forma_pagamento: porFormaPagamento
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pivot', optionalAuthMiddleware, async (req, res) => {
  try {
    const ano = parseInt(req.query.ano) || new Date().getFullYear();

    const colaboradores = await prisma.colaborador.findMany({
      include: { pessoa: true }
    });

    const vendas = await prisma.venda.findMany({
      where: {
        data: {
          gte: new Date(`${ano}-01-01T00:00:00.000Z`),
          lte: new Date(`${ano}-12-31T23:59:59.999Z`)
        }
      },
      include: {
        colaborador: {
          include: { pessoa: true }
        }
      }
    });

    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const matriz = {};
    colaboradores.forEach((c) => {
      matriz[c.id_pessoa] = {
        id_colaborador: c.id_pessoa,
        nome: c.pessoa?.nome || `Colaborador #${c.id_pessoa}`,
        meses: {},
        total_ano: 0
      };
      for (let m = 0; m < 12; m++) {
        matriz[c.id_pessoa].meses[m] = {
          mes_index: m,
          mes_nome: meses[m],
          faturamento: 0,
          quantidade: 0
        };
      }
    });

    vendas.forEach((v) => {
      const id = v.id_colaborador;
      const mes = new Date(v.data).getMonth();
      const val = Number(v.valor_final || 0);

      if (!matriz[id]) {
        matriz[id] = {
          id_colaborador: id,
          nome: v.colaborador?.pessoa?.nome || `Colaborador #${id}`,
          meses: {},
          total_ano: 0
        };
        for (let m = 0; m < 12; m++) {
          matriz[id].meses[m] = {
            mes_index: m,
            mes_nome: meses[m],
            faturamento: 0,
            quantidade: 0
          };
        }
      }

      matriz[id].meses[mes].faturamento += val;
      matriz[id].meses[mes].quantidade += 1;
      matriz[id].total_ano += val;
    });

    const totaisPorMes = Array.from({ length: 12 }, (_, m) => ({
      mes_index: m,
      mes_nome: meses[m],
      total_faturamento: 0,
      total_quantidade: 0
    }));

    let faturamentoGeral = 0;

    const linhas = Object.values(matriz).map((linha) => {
      linha.total_ano = Number(linha.total_ano.toFixed(2));
      faturamentoGeral += linha.total_ano;

      for (let m = 0; m < 12; m++) {
        linha.meses[m].faturamento = Number(linha.meses[m].faturamento.toFixed(2));
        totaisPorMes[m].total_faturamento += linha.meses[m].faturamento;
        totaisPorMes[m].total_quantidade += linha.meses[m].quantidade;
      }
      return linha;
    });

    totaisPorMes.forEach((tm) => {
      tm.total_faturamento = Number(tm.total_faturamento.toFixed(2));
    });

    res.json({
      ano,
      meses,
      linhas,
      totais_por_mes: totaisPorMes,
      total_geral: Number(faturamentoGeral.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
