import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getMe } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem('gce_usuario');
    return salvo ? JSON.parse(salvo) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gce_token') || '');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function validarSessao() {
      const tokenSalvo = localStorage.getItem('gce_token');
      if (tokenSalvo) {
        try {
          const dados = await getMe();
          setUsuario(dados);
          localStorage.setItem('gce_usuario', JSON.stringify(dados));
        } catch (err) {
          console.warn('Sessão expirada:', err);
          fazerLogout();
        }
      }
      setCarregando(false);
    }
    validarSessao();
  }, []);

  async function fazerLogin(email, senha) {
    const res = await apiLogin(email, senha);
    if (res && res.token) {
      setToken(res.token);
      setUsuario(res.usuario);
      localStorage.setItem('gce_token', res.token);
      localStorage.setItem('gce_usuario', JSON.stringify(res.usuario));
      return res.usuario;
    }
    throw new Error('Resposta de login inválida do servidor');
  }

  function fazerLogout() {
    setUsuario(null);
    setToken('');
    localStorage.removeItem('gce_token');
    localStorage.removeItem('gce_usuario');
  }

  function temPermissao(rolesPermitidas = []) {
    if (!usuario) return false;
    const roleUpper = (usuario.role || '').toUpperCase();
    const permitidasUpper = rolesPermitidas.map((r) => r.toUpperCase());
    return permitidasUpper.includes(roleUpper);
  }

  const role = (usuario?.role || '').toUpperCase();
  const ehProprietario = role === 'PROPRIETARIO';
  const ehColaborador = role === 'COLABORADOR';
  const ehCliente = role === 'CLIENTE';

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        fazerLogin,
        fazerLogout,
        temPermissao,
        ehProprietario,
        ehColaborador,
        ehCliente
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
