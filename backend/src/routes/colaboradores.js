const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      include: {
        pessoa: true,
        disponibilidades: true
      }
    });
    res.json(colaboradores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de colaborador inválido' });
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: { id_pessoa: idPessoa },
      include: {
        pessoa: true,
        disponibilidades: true,
        agendamentos: true
      }
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json(colaborador);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_pessoa, nome, cpf, telefone, email, especializacao, salario, data_admissao, status } = req.body;

    let idPessoaFinal = id_pessoa ? parseInt(id_pessoa) : null;

    if (idPessoaFinal && isNaN(idPessoaFinal)) {
      return res.status(400).json({ error: 'ID da pessoa inválido' });
    }

    // Se não passou id_pessoa direto, precisamos de nome e CPF para identificar ou criar a Pessoa
    if (!idPessoaFinal) {
      if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios para cadastrar o colaborador.' });
      }

      const cpfOriginal = String(cpf).trim();
      const cpfLimpo = cpfOriginal.replace(/\D/g, '');

      // Procura pessoa existente com esse CPF (formatado ou apenas dígitos)
      let pessoaExistente = await prisma.pessoa.findFirst({
        where: {
          OR: [
            { cpf: cpfOriginal },
            ...(cpfLimpo ? [{ cpf: cpfLimpo }] : [])
          ]
        }
      });

      if (pessoaExistente) {
        // Verifica se essa pessoa já é colaborador
        const colabExistente = await prisma.colaborador.findUnique({
          where: { id_pessoa: pessoaExistente.id }
        });

        if (colabExistente) {
          return res.status(400).json({ error: 'Já existe um colaborador cadastrado com este CPF.' });
        }

        // Atualiza dados da pessoa se fornecidos
        pessoaExistente = await prisma.pessoa.update({
          where: { id: pessoaExistente.id },
          data: {
            nome: nome.trim(),
            telefone: telefone ? String(telefone).trim() : pessoaExistente.telefone,
            email: email ? String(email).trim() : pessoaExistente.email
          }
        });

        idPessoaFinal = pessoaExistente.id;
      } else {
        // Cria pessoa nova
        const novaPessoa = await prisma.pessoa.create({
          data: {
            nome: nome.trim(),
            cpf: cpfLimpo || cpfOriginal,
            telefone: telefone ? String(telefone).trim() : null,
            email: email ? String(email).trim() : null
          }
        });

        idPessoaFinal = novaPessoa.id;
      }
    } else {
      // Se passou id_pessoa, verifica se pessoa existe
      const pessoaExistente = await prisma.pessoa.findUnique({
        where: { id: idPessoaFinal }
      });
      if (!pessoaExistente) {
        return res.status(404).json({ error: 'Pessoa não encontrada.' });
      }

      // Verifica se já é colaborador
      const colabExistente = await prisma.colaborador.findUnique({
        where: { id_pessoa: idPessoaFinal }
      });
      if (colabExistente) {
        return res.status(400).json({ error: 'Esta pessoa já está cadastrada como colaborador.' });
      }
    }

    const novoColaborador = await prisma.colaborador.create({
      data: {
        id_pessoa: idPessoaFinal,
        especializacao: especializacao ? String(especializacao).trim() : null,
        salario: salario !== undefined && salario !== null && salario !== '' ? parseFloat(salario) : null,
        data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
        status: status || 'Ativo'
      },
      include: {
        pessoa: true
      }
    });

    res.status(201).json(novoColaborador);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de colaborador inválido' });
    }

    const { especializacao, salario, data_admissao, status, nome, telefone, email } = req.body;

    if (nome || telefone !== undefined || email !== undefined) {
      await prisma.pessoa.update({
        where: { id: idPessoa },
        data: {
          nome: nome ? String(nome).trim() : undefined,
          telefone: telefone !== undefined ? (telefone ? String(telefone).trim() : null) : undefined,
          email: email !== undefined ? (email ? String(email).trim() : null) : undefined
        }
      });
    }

    const colaboradorAtualizado = await prisma.colaborador.update({
      where: { id_pessoa: idPessoa },
      data: {
        especializacao: especializacao !== undefined ? (especializacao ? String(especializacao).trim() : null) : undefined,
        salario: salario !== undefined ? (salario !== null && salario !== '' ? parseFloat(salario) : null) : undefined,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        status: status || undefined
      },
      include: {
        pessoa: true
      }
    });

    res.json(colaboradorAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de colaborador inválido' });
    }

    await prisma.colaborador.delete({
      where: { id_pessoa: idPessoa }
    });
    res.json({ message: 'Colaborador removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:id_pessoa/disponibilidade', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de colaborador inválido' });
    }

    const { dia_semana, hora_inicio, hora_fim } = req.body;
    const novaDisp = await prisma.colaboradorDisponibilidade.create({
      data: {
        id_colaborador: idPessoa,
        dia_semana: parseInt(dia_semana),
        hora_inicio,
        hora_fim
      }
    });
    res.status(201).json(novaDisp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/disponibilidade/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de disponibilidade inválido' });
    }

    await prisma.colaboradorDisponibilidade.delete({
      where: { id }
    });
    res.json({ message: 'Disponibilidade removida com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
