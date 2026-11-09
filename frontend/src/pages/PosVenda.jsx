import React, { useEffect, useState } from 'react';
import { getPosVendas, getVendas, criarPosVenda, excluirPosVenda } from '../services/api';

export default function PosVenda({ setMensagem }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [idVenda, setIdVenda] = useState('');
  const [nota, setNota] = useState('5');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const listaAval = await getPosVendas();
      const listaVendas = await getVendas();
      setAvaliacoes(listaAval);
      setVendas(listaVendas);
    } catch (erro) {
      console.log('Erro ao carregar pós-venda:', erro);
    }
  }

  async function salvar(e) {
    e.preventDefault();

    if (!idVenda) {
      alert('Selecione uma venda!');
      return;
    }

    try {
      await criarPosVenda({
        id_venda: parseInt(idVenda),
        avaliacao: parseInt(nota),
        comentario: comentario
      });

      setIdVenda('');
      setNota('5');
      setComentario('');
      setMostrarForm(false);

      if (setMensagem) setMensagem('Avaliação registrada com sucesso!');
      carregarDados();
    } catch (erro) {
      alert('Erro ao registrar avaliação: ' + erro.message);
    }
  }

  async function remover(id) {
    const confirmou = window.confirm('Deseja excluir esta avaliação?');
    if (!confirmou) return;

    try {
      await excluirPosVenda(id);
      if (setMensagem) setMensagem('Avaliação excluída!');
      carregarDados();
    } catch (erro) {
      alert('Erro ao excluir: ' + erro.message);
    }
  }

  return (
    <div>
      <div className="topo-pagina">
        <h2>Pós-Venda e Avaliação de Clientes</h2>
        <button
          className="btn btn-principal"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? 'Cancelar' : '+ Nova Avaliação'}
        </button>
      </div>

      {mostrarForm && (
        <div className="formulario-card">
          <h3>Registrar Feedback do Cliente</h3>
          <form onSubmit={salvar}>
            <div className="campo">
              <label>Venda / Atendimento *</label>
              <select
                value={idVenda}
                onChange={(e) => setIdVenda(e.target.value)}
                required
              >
                <option value="">Selecione o atendimento...</option>
                {vendas.map((v) => (
                  <option key={v.id} value={v.id}>
                    Venda #{v.id} - {v.cliente?.pessoa?.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Nota (1 a 5 estrelas)</label>
              <select
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              >
                <option value="5">5 estrelas (Excelente)</option>
                <option value="4">4 estrelas (Muito bom)</option>
                <option value="3">3 estrelas (Regular)</option>
                <option value="2">2 estrelas (Ruim)</option>
                <option value="1">1 estrela (Péssimo)</option>
              </select>
            </div>

            <div className="campo">
              <label>Comentário da Cliente</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Opinião sobre o atendimento"
              />
            </div>

            <button type="submit" className="btn btn-principal">
              Salvar Feedback
            </button>
          </form>
        </div>
      )}

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Venda</th>
              <th>Nota</th>
              <th>Comentário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhum feedback registrado ainda.</td>
              </tr>
            ) : (
              avaliacoes.map((av) => (
                <tr key={av.id}>
                  <td>{new Date(av.data).toLocaleDateString('pt-BR')}</td>
                  <td>{av.venda?.cliente?.pessoa?.nome || 'Cliente'}</td>
                  <td>Venda #{av.id_venda}</td>
                  <td>{av.avaliacao} / 5</td>
                  <td>{av.comentario || '-'}</td>
                  <td>
                    <button
                      className="btn btn-excluir"
                      onClick={() => remover(av.id)}
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
