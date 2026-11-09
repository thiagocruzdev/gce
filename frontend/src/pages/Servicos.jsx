import React, { useEffect, useState } from 'react';
import { getServicos, criarServico, excluirServico } from '../services/api';

export default function Servicos({ setMensagem }) {
  const [servicos, setServicos] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [duracao, setDuracao] = useState('60');

  useEffect(() => {
    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const dados = await getServicos();
      setServicos(dados);
    } catch (erro) {
      console.log('Erro ao buscar serviços:', erro);
    }
  }

  async function cadastrar(e) {
    e.preventDefault();

    if (!nome || !valor) {
      alert('Informe o nome e o valor do serviço!');
      return;
    }

    try {
      await criarServico({
        nome: nome,
        descricao: descricao,
        valor: parseFloat(valor),
        duracao_minutos: parseInt(duracao)
      });

      setNome('');
      setDescricao('');
      setValor('');
      setDuracao('60');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Serviço cadastrado com sucesso!');
      carregarServicos();
    } catch (erro) {
      alert('Erro ao cadastrar serviço: ' + erro.message);
    }
  }

  async function remover(id) {
    const confirmou = window.confirm('Deseja excluir este serviço?');
    if (!confirmou) return;

    try {
      await excluirServico(id);
      if (setMensagem) setMensagem('Serviço excluído com sucesso!');
      carregarServicos();
    } catch (erro) {
      alert('Erro ao excluir serviço: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Catálogo de Serviços</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Novo Serviço'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Preencha os dados do serviço</h3>
          <form onSubmit={cadastrar}>
            <div className="campo">
              <label>Nome do serviço *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Limpeza de Pele"
                required
              />
            </div>

            <div className="campo">
              <label>Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição do procedimento"
              />
            </div>

            <div className="linha-campos">
              <div className="campo">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="120.00"
                  required
                />
              </div>
              <div className="campo">
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-principal">
              Salvar Serviço
            </button>
          </form>
        </div>
      )}

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Duração</th>
              <th>Preço (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhum serviço cadastrado.</td>
              </tr>
            ) : (
              servicos.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.nome}</td>
                  <td>{s.descricao || '-'}</td>
                  <td>{s.duracao_minutos ? s.duracao_minutos + ' min' : '-'}</td>
                  <td>R$ {s.valor ? Number(s.valor).toFixed(2) : '0.00'}</td>
                  <td>
                    <button
                      className="btn btn-excluir"
                      onClick={() => remover(s.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
