const API_URL = 'http://localhost:3000/api';

async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }
  if (!response.ok) {
    const errorMsg = (data && data.error) ? data.error : `Erro na requisição (${response.status})`;
    throw new Error(errorMsg);
  }
  return data;
}

// ================= PESSOAS =================
export async function getPessoas() {
  const response = await fetch(`${API_URL}/pessoas`);
  return handleResponse(response);
}

export async function criarPessoa(dados) {
  const response = await fetch(`${API_URL}/pessoas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

// ================= CLIENTES =================
export async function getClientes() {
  const response = await fetch(`${API_URL}/clientes`);
  return handleResponse(response);
}

export async function criarCliente(dados) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarCliente(id, dados) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirCliente(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// ================= COLABORADORES =================
export async function getColaboradores() {
  const response = await fetch(`${API_URL}/colaboradores`);
  return handleResponse(response);
}

export async function criarColaborador(dados) {
  const response = await fetch(`${API_URL}/colaboradores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarColaborador(id, dados) {
  const response = await fetch(`${API_URL}/colaboradores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirColaborador(id) {
  const response = await fetch(`${API_URL}/colaboradores/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// ================= SERVIÇOS =================
export async function getServicos() {
  const response = await fetch(`${API_URL}/servicos`);
  return handleResponse(response);
}

export async function criarServico(dados) {
  const response = await fetch(`${API_URL}/servicos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarServico(id, dados) {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirServico(id) {
  const response = await fetch(`${API_URL}/servicos/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// ================= PRODUTOS =================
export async function getProdutos() {
  const response = await fetch(`${API_URL}/produtos`);
  return handleResponse(response);
}

export async function criarProduto(dados) {
  const response = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarProduto(id, dados) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirProduto(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function getEstoque() {
  const response = await fetch(`${API_URL}/estoque`);
  return handleResponse(response);
}

export async function movimentarEstoque(dados) {
  const response = await fetch(`${API_URL}/estoque`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

// ================= AGENDAMENTOS =================
export async function getAgendamentos() {
  const response = await fetch(`${API_URL}/agendamentos`);
  return handleResponse(response);
}

export async function criarAgendamento(dados) {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarAgendamento(id, dados) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirAgendamento(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// ================= VENDAS =================
export async function getVendas() {
  const response = await fetch(`${API_URL}/vendas`);
  return handleResponse(response);
}

export async function criarVenda(dados) {
  const response = await fetch(`${API_URL}/vendas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarVenda(id, dados) {
  const response = await fetch(`${API_URL}/vendas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function adicionarItemVenda(idVenda, dados) {
  const response = await fetch(`${API_URL}/vendas/${idVenda}/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function adicionarPagamentoVenda(idVenda, dados) {
  const response = await fetch(`${API_URL}/vendas/${idVenda}/pagamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirVenda(id) {
  const response = await fetch(`${API_URL}/vendas/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// ================= PÓS-VENDA =================
export async function getPosVendas() {
  const response = await fetch(`${API_URL}/pos-venda`);
  return handleResponse(response);
}

export async function criarPosVenda(dados) {
  const response = await fetch(`${API_URL}/pos-venda`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function atualizarPosVenda(id, dados) {
  const response = await fetch(`${API_URL}/pos-venda/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  return handleResponse(response);
}

export async function excluirPosVenda(id) {
  const response = await fetch(`${API_URL}/pos-venda/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}
