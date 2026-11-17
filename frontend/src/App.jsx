import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Colaboradores from './pages/Colaboradores';
import Servicos from './pages/Servicos';
import Produtos from './pages/Produtos';
import Agendamentos from './pages/Agendamentos';
import Vendas from './pages/Vendas';
import PosVenda from './pages/PosVenda';
import Relatorios from './pages/Relatorios';

function RotaInicial({ setMensagem }) {
  const { usuario, ehCliente } = useAuth();
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (ehCliente) {
    return <Navigate to="/agendamentos" replace />;
  }
  return <Dashboard setMensagem={setMensagem} />;
}

export default function App() {
  const [mensagem, setMensagem] = useState('');

  function exibirMensagem(texto) {
    setMensagem(texto);
    setTimeout(() => {
      setMensagem('');
    }, 3500);
  }

  return (
    <AuthProvider>
      <div className="app-layout">
        <Navbar />

        <main className="app-container">
          {mensagem && (
            <div className="alerta-toast">
              {mensagem}
            </div>
          )}

          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <RotaInicial setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agendamentos"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Agendamentos mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Agendamentos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Agendamentos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Agendamentos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Agendamentos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendamentos/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Agendamentos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Clientes mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colaboradores/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Colaboradores mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/servicos"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Servicos mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Servicos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Servicos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR', 'CLIENTE']}>
                  <Servicos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Servicos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/servicos/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Servicos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/produtos"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Produtos mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Produtos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Produtos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO', 'COLABORADOR']}>
                  <Produtos mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Produtos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Produtos mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendas"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Vendas mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/posvenda"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="list" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posvenda/novo"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posvenda/:id"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posvenda/:id/view"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="view" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posvenda/:id/editar"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posvenda/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <PosVenda mode="edit" setMensagem={exibirMensagem} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/relatorios"
              element={
                <ProtectedRoute allowedRoles={['PROPRIETARIO']}>
                  <Relatorios />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="footer-simples">
          Renata Faveri &bull; Beauty &amp; Academy &bull; Sistema de Gestão Estética
        </footer>
      </div>
    </AuthProvider>
  );
}
