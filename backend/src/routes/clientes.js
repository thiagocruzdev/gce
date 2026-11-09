const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        pessoa: true,
        servico_preferido: true,
        colaborador_preferido: {
          include: {
            pessoa: true
          }
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id_pessoa: idPessoa },
      include: {
        pessoa: true,
        servico_preferido: true,
        colaborador_preferido: {
          include: {
            pessoa: true
          }
        },
        agendamentos: true,
        vendas: true
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_pessoa, nome, cpf, telefone, email, pref_horario, pref_servico, pref_colaborador } = req.body;

    let idPessoaFinal = id_pessoa ? parseInt(id_pessoa) : null;

    if (idPessoaFinal && isNaN(idPessoaFinal)) {
      return res.status(400).json({ error: 'ID da pessoa inválido' });
    }

    if (!idPessoaFinal) {
      if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios para cadastrar o cliente.' });
      }

      const cpfOriginal = String(cpf).trim();
      const cpfLimpo = cpfOriginal.replace(/\D/g, '');

      let pessoaExistente = await prisma.pessoa.findFirst({
        where: {
          OR: [
            { cpf: cpfOriginal },
            ...(cpfLimpo ? [{ cpf: cpfLimpo }] : [])
          ]
        }
      });

      if (pessoaExistente) {
        const clienteExistente = await prisma.cliente.findUnique({
          where: { id_pessoa: pessoaExistente.id }
        });

        if (clienteExistente) {
          return res.status(400).json({ error: 'Já existe um cliente cadastrado com este CPF.' });
        }

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
      const pessoaExistente = await prisma.pessoa.findUnique({
        where: { id: idPessoaFinal }
      });
      if (!pessoaExistente) {
        return res.status(404).json({ error: 'Pessoa não encontrada.' });
      }

      const clienteExistente = await prisma.cliente.findUnique({
        where: { id: idPessoaFinal }
      });
      if (clienteExistente) {
        return res.status(400).json({ error: 'Esta pessoa já está cadastrada como cliente.' });
      }
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        id_pessoa: idPessoaFinal,
        pref_horario: pref_horario || null,
        pref_servico: pref_servico ? parseInt(pref_servico) : null,
        pref_colaborador: pref_colaborador ? parseInt(pref_colaborador) : null
      },
      include: {
        pessoa: true
      }
    });

    res.status(201).json(novoCliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const { pref_horario, pref_servico, pref_colaborador, nome, telefone, email } = req.body;

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

    const clienteAtualizado = await prisma.cliente.update({
      where: { id: idPessoa },
      data: {
        pref_horario,
        pref_servico: pref_servico !== undefined ? (pref_servico ? parseInt(pref_servico) : null) : undefined,
        pref_colaborador: pref_colaborador !== undefined ? (pref_colaborador ? parseInt(pref_colaborador) : null) : undefined
      },
      include: {
        pessoa: true
      }
    });
    res.json(clienteAtualizado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id_pessoa', async (req, res) => {
  try {
    const idPessoa = parseInt(req.params.id_pessoa);
    if (isNaN(idPessoa)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    await prisma.cliente.delete({
      where: { id_pessoa: idPessoa }
    });
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
