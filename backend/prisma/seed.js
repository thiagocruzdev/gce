const prisma = require('../src/prisma');
const { hashPassword } = require('../src/utils/auth');

async function main() {
  console.log('--- Iniciando Povoamento do Banco de Dados (Seed) ---');

  // 1. Limpeza ou verificação das tabelas existentes
  console.log('1. Povoando Pessoas e Colaboradores...');

  // Criar Colaborador Principal / Proprietária (Renata Faveri)
  let pessoaRenata = await prisma.pessoa.findFirst({ where: { cpf: '111.111.111-11' } });
  if (!pessoaRenata) {
    pessoaRenata = await prisma.pessoa.create({
      data: {
        nome: 'Renata Faveri',
        cpf: '111.111.111-11',
        telefone: '(11) 98765-4321',
        email: 'admin@renatafaveri.com',
        dt_nascimento: new Date('1988-04-15')
      }
    });
  }

  let colabRenata = await prisma.colaborador.findUnique({ where: { id_pessoa: pessoaRenata.id } });
  if (!colabRenata) {
    colabRenata = await prisma.colaborador.create({
      data: {
        id_pessoa: pessoaRenata.id,
        especializacao: 'Estética Avançada e Harmonização',
        salario: 12000.0,
        data_admissao: new Date('2020-01-10'),
        status: 'Ativo'
      }
    });
  }

  // Colaborador 2 (Amanda Souza)
  let pessoaAmanda = await prisma.pessoa.findFirst({ where: { cpf: '222.222.222-22' } });
  if (!pessoaAmanda) {
    pessoaAmanda = await prisma.pessoa.create({
      data: {
        nome: 'Amanda Souza',
        cpf: '222.222.222-22',
        telefone: '(11) 97777-1234',
        email: 'colaborador@renatafaveri.com',
        dt_nascimento: new Date('1994-08-20')
      }
    });
  }

  let colabAmanda = await prisma.colaborador.findUnique({ where: { id_pessoa: pessoaAmanda.id } });
  if (!colabAmanda) {
    colabAmanda = await prisma.colaborador.create({
      data: {
        id_pessoa: pessoaAmanda.id,
        especializacao: 'Micropigmentação e Sobrancelhas',
        salario: 4500.0,
        data_admissao: new Date('2022-03-01'),
        status: 'Ativo'
      }
    });
  }

  // Colaborador 3 (Juliana Mendes)
  let pessoaJuliana = await prisma.pessoa.findFirst({ where: { cpf: '333.333.333-33' } });
  if (!pessoaJuliana) {
    pessoaJuliana = await prisma.pessoa.create({
      data: {
        nome: 'Juliana Mendes',
        cpf: '333.333.333-33',
        telefone: '(11) 96666-5678',
        email: 'juliana@renatafaveri.com',
        dt_nascimento: new Date('1996-11-12')
      }
    });
  }

  let colabJuliana = await prisma.colaborador.findUnique({ where: { id_pessoa: pessoaJuliana.id } });
  if (!colabJuliana) {
    colabJuliana = await prisma.colaborador.create({
      data: {
        id_pessoa: pessoaJuliana.id,
        especializacao: 'Limpeza de Pele e Drenagem',
        salario: 3800.0,
        data_admissao: new Date('2023-05-15'),
        status: 'Ativo'
      }
    });
  }

  // 2. Pessoas e Clientes
  console.log('2. Povoando Clientes...');

  // Cliente 1 (Carla Oliveira)
  let pessoaCarla = await prisma.pessoa.findFirst({ where: { cpf: '444.444.444-44' } });
  if (!pessoaCarla) {
    pessoaCarla = await prisma.pessoa.create({
      data: {
        nome: 'Carla Oliveira',
        cpf: '444.444.444-44',
        telefone: '(11) 95555-8888',
        email: 'cliente@gmail.com',
        dt_nascimento: new Date('1992-06-18')
      }
    });
  }
  let clienteCarla = await prisma.cliente.findUnique({ where: { id_pessoa: pessoaCarla.id } });
  if (!clienteCarla) {
    clienteCarla = await prisma.cliente.create({
      data: {
        id_pessoa: pessoaCarla.id,
        pref_horario: 'Manhã',
        pref_colaborador: colabAmanda.id_pessoa
      }
    });
  }

  // Cliente 2 (Mariana Santos)
  let pessoaMariana = await prisma.pessoa.findFirst({ where: { cpf: '555.555.555-55' } });
  if (!pessoaMariana) {
    pessoaMariana = await prisma.pessoa.create({
      data: {
        nome: 'Mariana Santos',
        cpf: '555.555.555-55',
        telefone: '(11) 94444-2222',
        email: 'mariana@gmail.com',
        dt_nascimento: new Date('1998-02-25')
      }
    });
  }
  let clienteMariana = await prisma.cliente.findUnique({ where: { id_pessoa: pessoaMariana.id } });
  if (!clienteMariana) {
    clienteMariana = await prisma.cliente.create({
      data: {
        id_pessoa: pessoaMariana.id,
        pref_horario: 'Tarde',
        pref_colaborador: colabJuliana.id_pessoa
      }
    });
  }

  // Cliente 3 (Fernanda Lima)
  let pessoaFernanda = await prisma.pessoa.findFirst({ where: { cpf: '666.666.666-66' } });
  if (!pessoaFernanda) {
    pessoaFernanda = await prisma.pessoa.create({
      data: {
        nome: 'Fernanda Lima',
        cpf: '666.666.666-66',
        telefone: '(11) 93333-1111',
        email: 'fernanda@gmail.com',
        dt_nascimento: new Date('1985-09-30')
      }
    });
  }
  let clienteFernanda = await prisma.cliente.findUnique({ where: { id_pessoa: pessoaFernanda.id } });
  if (!clienteFernanda) {
    clienteFernanda = await prisma.cliente.create({
      data: {
        id_pessoa: pessoaFernanda.id,
        pref_horario: 'Sábado'
      }
    });
  }

  // 3. Usuários do Sistema para Autenticação
  console.log('3. Criando Usuários para Autenticação nos 3 Perfis...');

  const usuariosParaCriar = [
    {
      nome: 'Renata Faveri',
      email: 'admin@renatafaveri.com',
      senha: 'admin123',
      role: 'PROPRIETARIO',
      id_pessoa: pessoaRenata.id
    },
    {
      nome: 'Amanda Souza',
      email: 'colaborador@renatafaveri.com',
      senha: 'colab123',
      role: 'COLABORADOR',
      id_pessoa: pessoaAmanda.id
    },
    {
      nome: 'Juliana Mendes',
      email: 'juliana@renatafaveri.com',
      senha: 'colab123',
      role: 'COLABORADOR',
      id_pessoa: pessoaJuliana.id
    },
    {
      nome: 'Carla Oliveira',
      email: 'cliente@gmail.com',
      senha: 'cliente123',
      role: 'CLIENTE',
      id_pessoa: pessoaCarla.id
    },
    {
      nome: 'Mariana Santos',
      email: 'mariana@gmail.com',
      senha: 'cliente123',
      role: 'CLIENTE',
      id_pessoa: pessoaMariana.id
    }
  ];

  for (const u of usuariosParaCriar) {
    const existe = await prisma.usuario.findUnique({ where: { email: u.email } });
    if (!existe) {
      await prisma.usuario.create({
        data: {
          nome: u.nome,
          email: u.email,
          senha: hashPassword(u.senha),
          role: u.role,
          id_pessoa: u.id_pessoa
        }
      });
      console.log(` -> Usuário [${u.role}] criado: ${u.email} / senha: ${u.senha}`);
    }
  }

  // 4. Catálogo de Serviços
  console.log('4. Povoando Serviços...');
  const servicosLista = [
    { nome: 'Limpeza de Pele Profunda', descricao: 'Remoção de cravos, esfoliação e hidratação facial com máscara de ouro.', valor: 150.0, duracao_minutos: 60 },
    { nome: 'Peeling de Diamante', descricao: 'Microdermoabrasão para rejuvenescimento e renovação celular.', valor: 180.0, duracao_minutos: 45 },
    { nome: 'Micropigmentação Labial', descricao: 'Técnica Aquarelle Lips para lábios naturais e revitalizados.', valor: 450.0, duracao_minutos: 120 },
    { nome: 'Design de Sobrancelhas com Henna', descricao: 'Mapeamento facial completo com aplicação de henna personalizada.', valor: 80.0, duracao_minutos: 40 },
    { nome: 'Drenagem Linfática Facial e Corporal', descricao: 'Massagem terapêutica para redução de retenção hídrica.', valor: 160.0, duracao_minutos: 60 },
    { nome: 'Harmonização / Botox Preventivo', descricao: 'Aplicação preventiva em terço superior com toxina botulínica.', valor: 850.0, duracao_minutos: 45 }
  ];

  const servicosCriados = [];
  for (const s of servicosLista) {
    let serv = await prisma.servico.findFirst({ where: { nome: s.nome } });
    if (!serv) {
      serv = await prisma.servico.create({ data: s });
    }
    servicosCriados.push(serv);
  }

  // 5. Produtos Cosméticos
  console.log('5. Povoando Produtos de Estoque...');
  const produtosLista = [
    { nome: 'Sérum Facial Vitamina C 20%', descricao: 'Poderoso antioxidante com ácido hialurônico para clareamento e viço.', valor_custo: 45.0, valor_venda: 110.0, qntd: 25, qntd_min: 5 },
    { nome: 'Protetor Solar Toque Seco FPS 60', descricao: 'Alta proteção UVA/UVB com acabamento matte e controle de oleosidade.', valor_custo: 38.0, valor_venda: 89.0, qntd: 30, qntd_min: 8 },
    { nome: 'Ácido Hialurônico Concentrado 30ml', descricao: 'Hidratação profunda preenchedora para linhas de expressão.', valor_custo: 60.0, valor_venda: 145.0, qntd: 15, qntd_min: 5 },
    { nome: 'Máscara Hidratante Calmante 100g', descricao: 'Fórmula com camomila e aloe vera para pós-procedimentos.', valor_custo: 28.0, valor_venda: 75.0, qntd: 18, qntd_min: 4 },
    { nome: 'Esfoliante Facial de Cristais de Quartzo', descricao: 'Esfoliação suave e eficaz sem agredir a barreira cutânea.', valor_custo: 22.0, valor_venda: 58.0, qntd: 20, qntd_min: 5 }
  ];

  const produtosCriados = [];
  for (const p of produtosLista) {
    let prod = await prisma.produto.findFirst({ where: { nome: p.nome } });
    if (!prod) {
      prod = await prisma.produto.create({ data: p });
    }
    produtosCriados.push(prod);
  }

  // 6. Agendamentos (Feitos e a Fazer)
  console.log('6. Povoando Agendamentos...');
  const agora = new Date();

  const dataOntem = new Date(agora);
  dataOntem.setDate(agora.getDate() - 1);

  const dataSemanaPassada = new Date(agora);
  dataSemanaPassada.setDate(agora.getDate() - 7);

  const dataAmanha = new Date(agora);
  dataAmanha.setDate(agora.getDate() + 1);

  const dataProximaSemana = new Date(agora);
  dataProximaSemana.setDate(agora.getDate() + 5);

  const agendamentosExemplo = [
    // Feitos (passados)
    {
      id_cliente: clienteCarla.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_servico: servicosCriados[0].id, // Limpeza de Pele
      data_marcada: dataSemanaPassada,
      hora_inicio: '10:00',
      hora_fim: '11:00',
      valor_previsto: 150.0,
      status: 'Concluído',
      observacao: 'Cliente adorou a finalização com sérum.'
    },
    {
      id_cliente: clienteMariana.id_pessoa,
      id_colaborador: colabJuliana.id_pessoa,
      id_servico: servicosCriados[1].id, // Peeling
      data_marcada: dataOntem,
      hora_inicio: '14:30',
      hora_fim: '15:15',
      valor_previsto: 180.0,
      status: 'Concluído',
      observacao: 'Recomendado filtro solar fator alto.'
    },
    // Falta Fazer (futuros)
    {
      id_cliente: clienteCarla.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_servico: servicosCriados[2].id, // Micropigmentação
      data_marcada: dataAmanha,
      hora_inicio: '09:00',
      hora_fim: '11:00',
      valor_previsto: 450.0,
      status: 'Confirmado',
      observacao: 'Sessão de retoque incluída.'
    },
    {
      id_cliente: clienteFernanda.id_pessoa,
      id_colaborador: colabRenata.id_pessoa,
      id_servico: servicosCriados[5].id, // Botox
      data_marcada: dataProximaSemana,
      hora_inicio: '16:00',
      hora_fim: '16:45',
      valor_previsto: 850.0,
      status: 'Confirmado',
      observacao: 'Primeira aplicação.'
    },
    {
      id_cliente: clienteMariana.id_pessoa,
      id_colaborador: colabJuliana.id_pessoa,
      id_servico: servicosCriados[3].id, // Design Sobrancelhas
      data_marcada: dataProximaSemana,
      hora_inicio: '11:00',
      hora_fim: '11:40',
      valor_previsto: 80.0,
      status: 'Pendente',
      observacao: 'Aguardando confirmação via WhatsApp.'
    }
  ];

  const agendamentosCriados = [];
  for (const ag of agendamentosExemplo) {
    const criado = await prisma.agendamento.create({ data: ag });
    agendamentosCriados.push(criado);
  }

  // 7. Vendas com múltiplos itens e pagamentos
  console.log('7. Povoando Vendas com Múltiplos Itens e Totalizações...');

  // Venda 1: Limpeza de Pele + Sérum Vitamina C (Carla com Amanda)
  const venda1 = await prisma.venda.create({
    data: {
      id_cliente: clienteCarla.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_agendamento: agendamentosCriados[0].id,
      valor_total: 260.0,
      valor_desconto: 10.0,
      valor_final: 250.0,
      status: 'Pago',
      data: dataSemanaPassada
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda1.id,
      tipo: 'SERVICO',
      id_servico: servicosCriados[0].id,
      id_colaborador: colabAmanda.id_pessoa,
      quantidade: 1,
      valor_unitario: 150.0,
      valor_desconto: 0,
      valor_total: 150.0
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda1.id,
      tipo: 'PRODUTO',
      id_produto: produtosCriados[0].id,
      quantidade: 1,
      valor_unitario: 110.0,
      valor_desconto: 10.0,
      valor_total: 100.0
    }
  });

  await prisma.vendaPagamento.create({
    data: {
      id_venda: venda1.id,
      forma_pagamento: 'PIX',
      valor: 250.0,
      status: 'Pago',
      data_pagamento: dataSemanaPassada
    }
  });

  await prisma.posVenda.create({
    data: {
      id_venda: venda1.id,
      avaliacao: 5,
      comentario: 'Atendimento impecável! O sérum deixou minha pele radiante.',
      data: dataSemanaPassada
    }
  });

  // Venda 2: Peeling + Protetor Solar (Mariana com Juliana)
  const venda2 = await prisma.venda.create({
    data: {
      id_cliente: clienteMariana.id_pessoa,
      id_colaborador: colabJuliana.id_pessoa,
      id_agendamento: agendamentosCriados[1].id,
      valor_total: 269.0,
      valor_desconto: 19.0,
      valor_final: 250.0,
      status: 'Pago',
      data: dataOntem
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda2.id,
      tipo: 'SERVICO',
      id_servico: servicosCriados[1].id,
      id_colaborador: colabJuliana.id_pessoa,
      quantidade: 1,
      valor_unitario: 180.0,
      valor_desconto: 0,
      valor_total: 180.0
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda2.id,
      tipo: 'PRODUTO',
      id_produto: produtosCriados[1].id,
      quantidade: 1,
      valor_unitario: 89.0,
      valor_desconto: 19.0,
      valor_total: 70.0
    }
  });

  await prisma.vendaPagamento.create({
    data: {
      id_venda: venda2.id,
      forma_pagamento: 'CARTAO_CREDITO',
      valor: 250.0,
      status: 'Pago',
      data_pagamento: dataOntem
    }
  });

  await prisma.posVenda.create({
    data: {
      id_venda: venda2.id,
      avaliacao: 5,
      comentario: 'Excelente profissional, super cuidadosa.',
      data: dataOntem
    }
  });

  // Venda 3: Botox Preventivo (Fernanda com Renata Faveri)
  const dataMesPassado = new Date(agora);
  dataMesPassado.setDate(agora.getDate() - 30);

  const venda3 = await prisma.venda.create({
    data: {
      id_cliente: clienteFernanda.id_pessoa,
      id_colaborador: colabRenata.id_pessoa,
      valor_total: 850.0,
      valor_desconto: 50.0,
      valor_final: 800.0,
      status: 'Pago',
      data: dataMesPassado
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda3.id,
      tipo: 'SERVICO',
      id_servico: servicosCriados[5].id,
      id_colaborador: colabRenata.id_pessoa,
      quantidade: 1,
      valor_unitario: 850.0,
      valor_desconto: 50.0,
      valor_total: 800.0
    }
  });

  await prisma.vendaPagamento.create({
    data: {
      id_venda: venda3.id,
      forma_pagamento: 'CARTAO_CREDITO',
      valor: 800.0,
      status: 'Pago',
      data_pagamento: dataMesPassado
    }
  });

  // 8. Movimentações de Estoque
  console.log('8. Registrando Movimentações de Estoque...');
  await prisma.estoqueMovimentacao.create({
    data: {
      id_produto: produtosCriados[0].id,
      tipo: 'ENTRADA',
      quantidade: 30,
      motivo: 'Compra com fornecedor oficial Dermac Cosméticos',
      data: dataMesPassado
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      id_produto: produtosCriados[0].id,
      tipo: 'SAIDA',
      quantidade: 1,
      motivo: 'Venda presencial para cliente Carla Oliveira',
      data: dataSemanaPassada
    }
  });

  console.log('--- Seed Concluído com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
