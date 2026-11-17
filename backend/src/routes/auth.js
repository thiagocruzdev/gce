const express = require('express');
const prisma = require('../prisma');
const { hashPassword, verifyPassword, generateToken, authMiddleware } = require('../utils/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Autentica o usuário e retorna o token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    const emailLimpo = String(email).trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailLimpo },
      include: {
        pessoa: {
          include: {
            cliente: true,
            colaborador: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const senhaValida = verifyPassword(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      id_pessoa: usuario.id_pessoa
    };

    const token = generateToken(payload);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        id_pessoa: usuario.id_pessoa,
        pessoa: usuario.pessoa
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar login: ' + error.message });
  }
});

/**
 * POST /api/auth/register
 * Cadastro de novo usuário (especialmente clientes)
 */
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, role, cpf, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });
    }

    const emailLimpo = String(email).trim().toLowerCase();

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailLimpo }
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Já existe um usuário cadastrado com este e-mail' });
    }

    const roleFinal = role ? String(role).toUpperCase() : 'CLIENTE';

    let idPessoa = null;

    // Se fornecido CPF, vincula ou cria registro de Pessoa/Cliente
    if (cpf) {
      const cpfLimpo = String(cpf).replace(/\D/g, '');
      let pessoa = await prisma.pessoa.findFirst({
        where: {
          OR: [{ cpf: String(cpf).trim() }, ...(cpfLimpo ? [{ cpf: cpfLimpo }] : [])]
        }
      });

      if (!pessoa) {
        pessoa = await prisma.pessoa.create({
          data: {
            nome: nome.trim(),
            cpf: cpfLimpo || String(cpf).trim(),
            email: emailLimpo,
            telefone: telefone ? String(telefone).trim() : null
          }
        });
      }

      idPessoa = pessoa.id;

      if (roleFinal === 'CLIENTE') {
        const clienteExistente = await prisma.cliente.findUnique({
          where: { id_pessoa: pessoa.id }
        });
        if (!clienteExistente) {
          await prisma.cliente.create({
            data: { id_pessoa: pessoa.id }
          });
        }
      }
    }

    const senhaHash = hashPassword(senha);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailLimpo,
        senha: senhaHash,
        role: roleFinal,
        id_pessoa: idPessoa
      }
    });

    const token = generateToken({
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      role: novoUsuario.role,
      id_pessoa: novoUsuario.id_pessoa
    });

    res.status(201).json({
      token,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
        id_pessoa: novoUsuario.id_pessoa
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me
 * Retorna os dados do usuário autenticado a partir do token
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        pessoa: {
          include: {
            cliente: true,
            colaborador: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      id_pessoa: usuario.id_pessoa,
      pessoa: usuario.pessoa
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
