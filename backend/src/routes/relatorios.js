const express = require('express');
const prisma = require('../prisma');
const { optionalAuthMiddleware } = require('../utils/auth');

const router = express.Router();

/**
 * 1. CONSULTA COM DADOS EM MÚLTIPLAS TABELAS COM TOTALIZAÇÃO DE DADOS (1,0 PONTO)
 * Unindo Vendas + Clientes (Pessoa) + Colaboradores (Pessoa) + Agendamentos + Itens (Serviços/Produtos) + Pagamentos
 * Com cálculo de totalizadores gerais (Total Bruto, Descontos, Total Líquido, Qtd Atendimentos, Ticket Médio)
 */
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

    // Consulta unindo MÚLTIPLAS tabelas relacionais
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
      },
      orderBy: { data: 'desc' }
    });

    // Totalização de dados no backend
    let totalBruto = 0;
    let totalDescontos = 0;
    let totalLiquido = 0;
    let totalItensVendidos = 0;
    let totalServicosQtd = 0;
    let totalProdutosQtd = 0;

    const registrosFormatados = vendas.map((v) => {
      totalBruto += Number(v.valor_total || 0);
      totalDescontos += Number(v.valor_desconto || 0);
      totalLiquido += Number(v.valor_final || 0);

      let itensServico = 0;
      let itensProduto = 0;

      (v.itens || []).forEach((item) => {
        totalItensVendidos += Number(item.quantidade || 1);
        if (item.tipo === 'SERVICO' || item.id_servico) {
          itensServico += Number(item.quantidade || 1);
          totalServicosQtd += Number(item.quantidade || 1);
        } else {
          itensProduto += Number(item.quantidade || 1);
          totalProdutosQtd += Number(item.quantidade || 1);
        }
      });

      return {
        id_venda: v.id,
        data: v.data,
        status: v.status,
        cliente_id: v.id_cliente,
        cliente_nome: v.cliente?.pessoa?.nome || 'Cliente não identificado',
        cliente_cpf: v.cliente?.pessoa?.cpf || '-',
        cliente_telefone: v.cliente?.pessoa?.telefone || '-',
        colaborador_id: v.id_colaborador,
        colaborador_nome: v.colaborador?.pessoa?.nome || 'Profissional não identificado',
        colaborador_especialidade: v.colaborador?.especializacao || 'Especialista',
        procedimento_principal: v.agendamento?.servico?.nome || (v.itens[0]?.servico?.nome) || (v.itens[0]?.produto?.nome) || 'Procedimento Estético',
        quantidade_itens: v.itens?.length || 0,
        itens_servico: itensServico,
        itens_produto: itensProduto,
        formas_pagamento: (v.pagamentos || []).map((p) => p.forma_pagamento).join(', ') || 'Não especificado',
        avaliacao_pos_venda: v.pos_venda?.avaliacao ? `${v.pos_venda.avaliacao} ★` : 'Sem avaliação',
        valor_bruto: Number(v.valor_total || 0),
        valor_desconto: Number(v.valor_desconto || 0),
        valor_final: Number(v.valor_final || 0)
      };
    });

    const totalVendasCount = registrosFormatados.length;
    const ticketMedio = totalVendasCount > 0 ? totalLiquido / totalVendasCount : 0;

    res.json({
      totalizacao: {
        total_vendas: totalVendasCount,
        total_bruto: Number(totalBruto.toFixed(2)),
        total_descontos: Number(totalDescontos.toFixed(2)),
        total_liquido: Number(totalLiquido.toFixed(2)),
        ticket_medio: Number(ticketMedio.toFixed(2)),
        total_itens_vendidos: totalItensVendidos,
        total_servicos_executados: totalServicosQtd,
        total_produtos_vendidos: totalProdutosQtd
      },
      dados: registrosFormatados
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório com múltiplas tabelas: ' + error.message });
  }
});

/**
 * 2. CONSULTAS DE AGRUPAMENTO (GROUP BY) (0,5 PONTO)
 * Agrupamentos por:
 *  A) Colaborador (Faturamento acumulado e quantidade de atendimentos)
 *  B) Serviço / Procedimento (Mais realizados e faturamento por tipo)
 *  C) Status dos Agendamentos (Confirmados, Pendentes, Concluídos, Cancelados)
 *  D) Formas de Pagamento (PIX, Cartão, Dinheiro)
 */
router.get('/agrupamentos', optionalAuthMiddleware, async (req, res) => {
  try {
    // A) Agrupamento por Colaborador
    const vendasComColab = await prisma.venda.findMany({
      include: {
        colaborador: {
          include: { pessoa: true }
        }
      }
    });

    const agrupadoColaboradorMap = {};
    vendasComColab.forEach((v) => {
      const colabId = v.id_colaborador;
      const colabNome = v.colaborador?.pessoa?.nome || `Colaborador #${colabId}`;
      const especialidade = v.colaborador?.especializacao || 'Profissional';

      if (!agrupadoColaboradorMap[colabId]) {
        agrupadoColaboradorMap[colabId] = {
          id_colaborador: colabId,
          nome: colabNome,
          especialidade,
          quantidade_vendas: 0,
          total_faturado: 0
        };
      }
      agrupadoColaboradorMap[colabId].quantidade_vendas += 1;
      agrupadoColaboradorMap[colabId].total_faturado += Number(v.valor_final || 0);
    });

    const agrupadoColaborador = Object.values(agrupadoColaboradorMap)
      .map((item) => ({
        ...item,
        total_faturado: Number(item.total_faturado.toFixed(2)),
        ticket_medio: Number((item.total_faturado / (item.quantidade_vendas || 1)).toFixed(2))
      }))
      .sort((a, b) => b.total_faturado - a.total_faturado);

    // B) Agrupamento por Procedimento / Serviço
    const itensVenda = await prisma.vendaItem.findMany({
      include: {
        servico: true,
        produto: true
      }
    });

    const agrupadoItensMap = {};
    itensVenda.forEach((it) => {
      const chave = it.tipo === 'SERVICO'
        ? `S_${it.id_servico}_${it.servico?.nome || 'Serviço'}`
        : `P_${it.id_produto}_${it.produto?.nome || 'Produto'}`;

      const nomeItem = it.tipo === 'SERVICO'
        ? (it.servico?.nome || 'Serviço')
        : (it.produto?.nome || 'Produto');

      if (!agrupadoItensMap[chave]) {
        agrupadoItensMap[chave] = {
          tipo: it.tipo,
          nome: nomeItem,
          quantidade_total: 0,
          total_arrecadado: 0
        };
      }
      agrupadoItensMap[chave].quantidade_total += Number(it.quantidade || 1);
      agrupadoItensMap[chave].total_arrecadado += Number(it.valor_total || 0);
    });

    const agrupadoProcedimentos = Object.values(agrupadoItensMap)
      .map((it) => ({
        ...it,
        total_arrecadado: Number(it.total_arrecadado.toFixed(2))
      }))
      .sort((a, b) => b.total_arrecadado - a.total_arrecadado);

    // C) Agrupamento de Agendamentos por Status
    const todosAgendamentos = await prisma.agendamento.findMany();
    const agrupadoStatusMap = {};
    todosAgendamentos.forEach((ag) => {
      const st = ag.status || 'Pendente';
      agrupadoStatusMap[st] = (agrupadoStatusMap[st] || 0) + 1;
    });

    const agrupadoAgendamentosStatus = Object.keys(agrupadoStatusMap).map((status) => ({
      status,
      quantidade: agrupadoStatusMap[status]
    }));

    // D) Agrupamento por Forma de Pagamento
    const pagamentos = await prisma.vendaPagamento.findMany();
    const agrupadoPagamentoMap = {};
    pagamentos.forEach((p) => {
      const forma = p.forma_pagamento || 'Outro';
      if (!agrupadoPagamentoMap[forma]) {
        agrupadoPagamentoMap[forma] = { forma, quantidade: 0, valor_total: 0 };
      }
      agrupadoPagamentoMap[forma].quantidade += 1;
      agrupadoPagamentoMap[forma].valor_total += Number(p.valor || 0);
    });

    const agrupadoPagamentos = Object.values(agrupadoPagamentoMap).map((pg) => ({
      ...pg,
      valor_total: Number(pg.valor_total.toFixed(2))
    }));

    res.json({
      por_colaborador: agrupadoColaborador,
      por_procedimento: agrupadoProcedimentos,
      agendamentos_por_status: agrupadoAgendamentosStatus,
      por_forma_pagamento: agrupadoPagamentos
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar agrupamentos: ' + error.message });
  }
});

/**
 * 3. CONSULTA DE PIVOT / MATRIZ CRUZADA (0,5 PONTO)
 * Tabela dinâmica cruzando duas dimensões:
 *  - Eixo Vertical (Linhas): Colaboradores
 *  - Eixo Horizontal (Colunas): Meses do Ano (Jan a Dez)
 *  - Células: Faturamento Total R$ e Quantidade de Atendimentos
 *  - Totalizadores por Linha (Total do Profissional) e por Coluna (Total do Mês)
 */
router.get('/pivot', optionalAuthMiddleware, async (req, res) => {
  try {
    const anoAtual = parseInt(req.query.ano) || new Date().getFullYear();

    const colaboradores = await prisma.colaborador.findMany({
      include: { pessoa: true }
    });

    const vendas = await prisma.venda.findMany({
      where: {
        data: {
          gte: new Date(`${anoAtual}-01-01T00:00:00.000Z`),
          lte: new Date(`${anoAtual}-12-31T23:59:59.999Z`)
        }
      },
      include: {
        colaborador: {
          include: { pessoa: true }
        }
      }
    });

    const mesesNomes = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    // Inicializa a matriz para cada colaborador
    const matriz = {};
    colaboradores.forEach((colab) => {
      matriz[colab.id_pessoa] = {
        id_colaborador: colab.id_pessoa,
        nome: colab.pessoa?.nome || `Colaborador #${colab.id_pessoa}`,
        especialidade: colab.especializacao || 'Especialista',
        meses: {},
        total_ano: 0,
        qtd_total: 0
      };

      for (let m = 0; m < 12; m++) {
        matriz[colab.id_pessoa].meses[m] = {
          mes_index: m,
          mes_nome: mesesNomes[m],
          faturamento: 0,
          quantidade: 0
        };
      }
    });

    // Povoa a matriz pivot cruzando vendas
    vendas.forEach((v) => {
      const colabId = v.id_colaborador;
      const dataVenda = new Date(v.data);
      const mes = dataVenda.getMonth(); // 0 a 11
      const valor = Number(v.valor_final || 0);

      if (!matriz[colabId]) {
        matriz[colabId] = {
          id_colaborador: colabId,
          nome: v.colaborador?.pessoa?.nome || `Colaborador #${colabId}`,
          especialidade: v.colaborador?.especializacao || 'Especialista',
          meses: {},
          total_ano: 0,
          qtd_total: 0
        };
        for (let m = 0; m < 12; m++) {
          matriz[colabId].meses[m] = {
            mes_index: m,
            mes_nome: mesesNomes[m],
            faturamento: 0,
            quantidade: 0
          };
        }
      }

      matriz[colabId].meses[mes].faturamento += valor;
      matriz[colabId].meses[mes].quantidade += 1;
      matriz[colabId].total_ano += valor;
      matriz[colabId].qtd_total += 1;
    });

    // Totais por coluna (Meses)
    const totaisPorMes = Array.from({ length: 12 }, (_, m) => ({
      mes_index: m,
      mes_nome: mesesNomes[m],
      total_faturamento: 0,
      total_quantidade: 0
    }));

    let faturamentoGeral = 0;
    let atendimentosGeral = 0;

    const linhasPivot = Object.values(matriz).map((linha) => {
      linha.total_ano = Number(linha.total_ano.toFixed(2));
      faturamentoGeral += linha.total_ano;
      atendimentosGeral += linha.qtd_total;

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
      ano: anoAtual,
      meses: mesesNomes,
      linhas: linhasPivot,
      totais_por_mes: totaisPorMes,
      total_geral: {
        faturamento: Number(faturamentoGeral.toFixed(2)),
        quantidade_atendimentos: atendimentosGeral
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar consulta Pivot: ' + error.message });
  }
});

module.exports = router;
