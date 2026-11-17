import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cadastrarUsuario } from '../services/api';
import iconeImg from '../images/icone.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fazerLogin } = useAuth();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const destino = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha os campos obrigatórios.');
      return;
    }

    try {
      setCarregando(true);
      if (modoCadastro) {
        if (!nome.trim()) {
          setErro('O nome é obrigatório.');
          setCarregando(false);
          return;
        }
        await cadastrarUsuario({
          nome: nome.trim(),
          email: email.trim(),
          senha: senha.trim(),
          cpf: cpf.trim() || undefined,
          telefone: telefone.trim() || undefined,
          role: 'CLIENTE'
        });
      }

      await fazerLogin(email.trim(), senha.trim());
      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message || 'Erro ao realizar login.');
    } finally {
      setCarregando(false);
    }
  }

  function preencherRapido(emailDemo, senhaDemo) {
    setEmail(emailDemo);
    setSenha(senhaDemo);
    setErro('');
  }

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '0 16px' }}>
      <div className="view-card" style={{ padding: '30px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={iconeImg}
            alt="Renata Faveri"
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px' }}
          />
          <h2 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '4px' }}>
            Renata Faveri
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Beauty &amp; Academy
          </span>
        </div>

        {erro && (
          <div style={{
            background: 'var(--red-bg)',
            color: 'var(--red-text)',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {modoCadastro && (
            <>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Telefone</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label>E-mail *</label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label>Senha *</label>
            <input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={carregando}
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          >
            {carregando ? 'Entrando...' : modoCadastro ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => {
              setModoCadastro(!modoCadastro);
              setErro('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {modoCadastro ? 'Já tem conta? Entrar' : 'Cadastre-se'}
          </button>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
            Acesso Rápido:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('admin@renatafaveri.com', 'admin123')}
            >
              Proprietário (Renata Faveri)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('colaborador@renatafaveri.com', 'colab123')}
            >
              Colaborador (Amanda Souza)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('cliente@gmail.com', 'cliente123')}
            >
              Cliente (Carla Oliveira)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
