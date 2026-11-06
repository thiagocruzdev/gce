const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pessoas = await prisma.pessoa.findMany({
      include: {
        cliente: true,
        colaborador: true
      }
    });
    res.json(pessoas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pessoa = await prisma.pessoa.findUnique({
      where: { id },
      include: {
        cliente: true,
        colaborador: true
      }
    });

    if (!pessoa) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(pessoa);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, cpf, telefone, email, dt_nascimento } = req.body;
    const novaPessoa = await prisma.pessoa.create({
      data: {
        nome,
        cpf,
        telefone,
        email,
        dt_nascimento: dt_nascimento ? new Date(dt_nascimento) : null
      }
    });
    res.status(201).json(novaPessoa);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, cpf, telefone, email, dt_nascimento } = req.body;
    const pessoaAtualizada = await prisma.pessoa.update({
      where: { id },
      data: {
        nome,
        cpf,
        telefone,
        email,
        dt_nascimento: dt_nascimento ? new Date(dt_nascimento) : undefined
      }
    });
    res.json(pessoaAtualizada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.pessoa.delete({
      where: { id }
    });
    res.json({ message: 'Pessoa removida com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
