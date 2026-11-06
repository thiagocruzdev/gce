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
    const { id_pessoa, especializacao, salario, data_admissao, status } = req.body;
    const novoColaborador = await prisma.colaborador.create({
      data: {
        id_pessoa: parseInt(id_pessoa),
        especializacao,
        salario: salario ? parseFloat(salario) : null,
        data_admissao: data_admissao ? new Date(data_admissao) : null,
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
    const { especializacao, salario, data_admissao, status } = req.body;
    const colaboradorAtualizado = await prisma.colaborador.update({
      where: { id_pessoa: idPessoa },
      data: {
        especializacao,
        salario: salario !== undefined ? (salario ? parseFloat(salario) : null) : undefined,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        status
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
    await prisma.colaboradorDisponibilidade.delete({
      where: { id }
    });
    res.json({ message: 'Disponibilidade removida com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
