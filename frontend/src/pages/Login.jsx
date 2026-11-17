import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cadastrarUsuario } from '../services/api';
import iconeImg from '../images/icone.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fazerLogin, usuario } = useAuth();

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
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setCarregando(true);
      if (modoCadastro) {
        if (!nome.trim()) {
          setErro('O nome completo é obrigatório para cadastro.');
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
      setErro(err.message || 'Falha ao autenticar.');
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
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 16px' }}>
      <div className="view-card" style={{ padding: '32px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src={iconeImg}
            alt="Renata Faveri"
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px' }}
          />
          <h2 style={{ fontSize: '22px', color: 'var(--primary)', marginBottom: '4px' }}>
            Renata Faveri
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Beauty &amp; Academy
          </span>
          <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
            {modoCadastro ? 'Crie sua conta de cliente para agendamentos' : 'Acesse o sistema com suas credenciais'}
          </p>
        </div>

        {erro && (
          <div style={{
            background: 'var(--red-bg)',
            color: 'var(--red-text)',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '18px',
            fontSize: '13.5px',
            border: '1px solid rgba(200, 30, 30, 0.2)'
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {modoCadastro && (
            <>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: Ana Clara Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>CPF (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>E-mail *</label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Senha *</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={carregando}
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {carregando
              ? 'Processando...'
              : modoCadastro
              ? 'Concluir Cadastro e Entrar'
              : 'Entrar no Sistema'}
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
              fontSize: '13.5px',
              textDecoration: 'underline'
            }}
          >
            {modoCadastro
              ? 'Já tem uma conta? Fazer login'
              : 'Novo cliente? Cadastre-se aqui'}
          </button>
        </div>

        {/* BOTÕES DE ACESSO RÁPIDO PARA DEMONSTRAÇÃO / AVALIAÇÃO ACADÊMICA */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', textAlign: 'center' }}>
            Acesso Rápido para Avaliação (Demo):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('admin@renatafaveri.com', 'admin123')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>👑 <strong>Proprietário</strong> (Renata Faveri)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>admin123</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('colaborador@renatafaveri.com', 'colab123')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>💼 <strong>Colaborador</strong> (Amanda Souza)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>colab123</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => preencherRapido('cliente@gmail.com', 'cliente123')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>💆‍♀️ <strong>Cliente</strong> (Carla Oliveira)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>cliente123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
