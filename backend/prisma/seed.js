const prisma = require('../src/prisma');
const { hashPassword } = require('../src/utils/auth');

async function main() {
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
        especializacao: 'Estética Avançada',
        salario: 12000.0,
        data_admissao: new Date('2020-01-10'),
        status: 'Ativo'
      }
    });
  }

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
        especializacao: 'Micropigmentação',
        salario: 4500.0,
        data_admissao: new Date('2022-03-01'),
        status: 'Ativo'
      }
    });
  }

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
        especializacao: 'Limpeza de Pele',
        salario: 3800.0,
        data_admissao: new Date('2023-05-15'),
        status: 'Ativo'
      }
    });
  }

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

  const usuarios = [
    { nome: 'Renata Faveri', email: 'admin@renatafaveri.com', senha: 'admin123', role: 'PROPRIETARIO', id_pessoa: pessoaRenata.id },
    { nome: 'Amanda Souza', email: 'colaborador@renatafaveri.com', senha: 'colab123', role: 'COLABORADOR', id_pessoa: pessoaAmanda.id },
    { nome: 'Juliana Mendes', email: 'juliana@renatafaveri.com', senha: 'colab123', role: 'COLABORADOR', id_pessoa: pessoaJuliana.id },
    { nome: 'Carla Oliveira', email: 'cliente@gmail.com', senha: 'cliente123', role: 'CLIENTE', id_pessoa: pessoaCarla.id },
    { nome: 'Mariana Santos', email: 'mariana@gmail.com', senha: 'cliente123', role: 'CLIENTE', id_pessoa: pessoaMariana.id }
  ];

  for (const u of usuarios) {
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
    }
  }

  const servicosLista = [
    { nome: 'Limpeza de Pele', descricao: 'Limpeza facial profunda', valor: 150.0, duracao_minutos: 60 },
    { nome: 'Peeling de Diamante', descricao: 'Esfoliação e renovação', valor: 180.0, duracao_minutos: 45 },
    { nome: 'Micropigmentação', descricao: 'Sobrancelhas e lábios', valor: 450.0, duracao_minutos: 120 },
    { nome: 'Drenagem Linfática', descricao: 'Massagem corporal', valor: 160.0, duracao_minutos: 60 }
  ];

  const servicosCriados = [];
  for (const s of servicosLista) {
    let serv = await prisma.servico.findFirst({ where: { nome: s.nome } });
    if (!serv) {
      serv = await prisma.servico.create({ data: s });
    }
    servicosCriados.push(serv);
  }

  const produtosLista = [
    { nome: 'Sérum Vitamina C', descricao: 'Antioxidante facial', valor_custo: 45.0, valor_venda: 110.0, qntd: 25, qntd_min: 5 },
    { nome: 'Protetor Solar FPS 60', descricao: 'Toque seco matte', valor_custo: 38.0, valor_venda: 89.0, qntd: 30, qntd_min: 8 },
    { nome: 'Ácido Hialurônico', descricao: 'Hidratação profunda', valor_custo: 60.0, valor_venda: 145.0, qntd: 15, qntd_min: 5 }
  ];

  const produtosCriados = [];
  for (const p of produtosLista) {
    let prod = await prisma.produto.findFirst({ where: { nome: p.nome } });
    if (!prod) {
      prod = await prisma.produto.create({ data: p });
    }
    produtosCriados.push(prod);
  }

  const agora = new Date();
  const dataPassada = new Date(agora);
  dataPassada.setDate(agora.getDate() - 3);

  const dataFutura = new Date(agora);
  dataFutura.setDate(agora.getDate() + 2);

  const ag1 = await prisma.agendamento.create({
    data: {
      id_cliente: clienteCarla.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_servico: servicosCriados[0].id,
      data_marcada: dataPassada,
      hora_inicio: '10:00',
      valor_previsto: 150.0,
      status: 'Concluído'
    }
  });

  const ag2 = await prisma.agendamento.create({
    data: {
      id_cliente: clienteMariana.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_servico: servicosCriados[1].id,
      data_marcada: dataFutura,
      hora_inicio: '14:00',
      valor_previsto: 180.0,
      status: 'Confirmado'
    }
  });

  const venda1 = await prisma.venda.create({
    data: {
      id_cliente: clienteCarla.id_pessoa,
      id_colaborador: colabAmanda.id_pessoa,
      id_agendamento: ag1.id,
      valor_total: 260.0,
      valor_desconto: 10.0,
      valor_final: 250.0,
      status: 'Pago',
      data: dataPassada
    }
  });

  await prisma.vendaItem.create({
    data: {
      id_venda: venda1.id,
      tipo: 'SERVICO',
      id_servico: servicosCriados[0].id,
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
      data_pagamento: dataPassada
    }
  });

  await prisma.posVenda.create({
    data: {
      id_venda: venda1.id,
      avaliacao: 5,
      comentario: 'Gostei muito do atendimento',
      data: dataPassada
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      id_produto: produtosCriados[0].id,
      tipo: 'ENTRADA',
      quantidade: 30,
      motivo: 'Compra inicial',
      data: dataPassada
    }
  });

  console.log('Seed executado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
