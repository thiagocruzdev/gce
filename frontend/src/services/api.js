const API_URL = 'http://localhost:3001/api';

function getHeaders() {
  const token = localStorage.getItem('gce_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const errorMsg = (data && data.error) ? data.error : `Erro na requisição (${response.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

export async function login(email, senha) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  return handleResponse(response);
}

export async function cadastrarUsuario(dados) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function getMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getPessoas() {
  const response = await fetch(`${API_URL}/pessoas`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarPessoa(dados) {
  const response = await fetch(`${API_URL}/pessoas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function getClientes() {
  const response = await fetch(`${API_URL}/clientes`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getCliente(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarCliente(dados) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarCliente(id, dados) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirCliente(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getColaboradores() {
  const response = await fetch(`${API_URL}/colaboradores`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getColaborador(id) {
  const response = await fetch(`${API_URL}/colaboradores/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarColaborador(dados) {
  const response = await fetch(`${API_URL}/colaboradores`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarColaborador(id, dados) {
  const response = await fetch(`${API_URL}/colaboradores/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirColaborador(id) {
  const response = await fetch(`${API_URL}/colaboradores/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getServicos() {
  const response = await fetch(`${API_URL}/servicos`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getServico(id) {
  const response = await fetch(`${API_URL}/servicos/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarServico(dados) {
  const response = await fetch(`${API_URL}/servicos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarServico(id, dados) {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirServico(id) {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getProdutos() {
  const response = await fetch(`${API_URL}/produtos`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getProduto(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarProduto(dados) {
  const response = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarProduto(id, dados) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirProduto(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function movimentarEstoque(dados) {
  const response = await fetch(`${API_URL}/estoque`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function getAgendamentos(filtros = {}) {
  const query = new URLSearchParams();
  if (filtros.id_cliente) query.append('id_cliente', filtros.id_cliente);
  if (filtros.id_colaborador) query.append('id_colaborador', filtros.id_colaborador);
  if (filtros.status) query.append('status', filtros.status);
  if (filtros.data) query.append('data', filtros.data);
  if (filtros.tipo) query.append('tipo', filtros.tipo);

  const url = `${API_URL}/agendamentos${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getAgendaColaborador(idColaborador) {
  const response = await fetch(`${API_URL}/agendamentos/colaborador-painel/${idColaborador}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getAgendamento(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarAgendamento(dados) {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarAgendamento(id, dados) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirAgendamento(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getVendas(filtros = {}) {
  const query = new URLSearchParams();
  if (filtros.status) query.append('status', filtros.status);
  if (filtros.data_inicio) query.append('data_inicio', filtros.data_inicio);
  if (filtros.data_fim) query.append('data_fim', filtros.data_fim);

  const url = `${API_URL}/vendas${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getVenda(id) {
  const response = await fetch(`${API_URL}/vendas/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarVenda(dados) {
  const response = await fetch(`${API_URL}/vendas`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarVenda(id, dados) {
  const response = await fetch(`${API_URL}/vendas/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function adicionarItemVenda(idVenda, dados) {
  const response = await fetch(`${API_URL}/vendas/${idVenda}/itens`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function adicionarPagamentoVenda(idVenda, dados) {
  const response = await fetch(`${API_URL}/vendas/${idVenda}/pagamentos`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirVenda(id) {
  const response = await fetch(`${API_URL}/vendas/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getPosVendas() {
  const response = await fetch(`${API_URL}/pos-venda`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getPosVenda(id) {
  const response = await fetch(`${API_URL}/pos-venda/${id}`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function criarPosVenda(dados) {
  const response = await fetch(`${API_URL}/pos-venda`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarPosVenda(id, dados) {
  const response = await fetch(`${API_URL}/pos-venda/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirPosVenda(id) {
  const response = await fetch(`${API_URL}/pos-venda/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
}

export async function getRelatorioMultiTabelas(filtros = {}) {
  const query = new URLSearchParams();
  if (filtros.status) query.append('status', filtros.status);
  if (filtros.data_inicio) query.append('data_inicio', filtros.data_inicio);
  if (filtros.data_fim) query.append('data_fim', filtros.data_fim);
  if (filtros.id_colaborador) query.append('id_colaborador', filtros.id_colaborador);

  const url = `${API_URL}/relatorios/multi-tabelas${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getRelatorioAgrupamentos() {
  const response = await fetch(`${API_URL}/relatorios/agrupamentos`, { headers: getHeaders() });
  return handleResponse(response);
}

export async function getRelatorioPivot(ano) {
  const url = `${API_URL}/relatorios/pivot${ano ? `?ano=${ano}` : ''}`;
  const response = await fetch(url, { headers: getHeaders() });
  return handleResponse(response);
}
