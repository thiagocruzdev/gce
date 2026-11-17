import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getServicos, getServico, criarServico, atualizarServico, excluirServico } from '../services/api';

export default function Servicos({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [servicos, setServicos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [servicoAtual, setServicoAtual] = useState(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [duracao, setDuracao] = useState('60');

  useEffect(() => {
    if (mode === 'list') {
      carregarServicos();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarServicos() {
    try {
      setCarregando(true);
      const dados = await getServicos();
      setServicos(dados || []);
    } catch (erro) {
      console.log('Erro ao buscar serviços:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idServico) {
    try {
      setCarregando(true);
      const s = await getServico(idServico);
      setServicoAtual(s);
      setNome(s.nome || '');
      setDescricao(s.descricao || '');
      setValor(s.valor != null ? String(s.valor) : '');
      setDuracao(s.duracao_minutos != null ? String(s.duracao_minutos) : '60');
    } catch (erro) {
      alert('Erro ao carregar serviço: ' + erro.message);
      navigate('/servicos');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setServicoAtual(null);
    setNome('');
    setDescricao('');
    setValor('');
    setDuracao('60');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim() || !valor) {
      alert('Informe o nome e o valor do serviço!');
      return;
    }

    try {
      if (id) {
        await atualizarServico(id, {
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor),
          duracao_minutos: parseInt(duracao) || 60
        });
        if (setMensagem) setMensagem('Serviço atualizado com sucesso!');
        navigate(`/servicos/${id}`);
      } else {
        await criarServico({
          nome: nome.trim(),
          descricao: descricao.trim(),
          valor: parseFloat(valor),
          duracao_minutos: parseInt(duracao) || 60
        });
        if (setMensagem) setMensagem('Serviço cadastrado com sucesso!');
        navigate('/servicos');
      }
    } catch (erro) {
      alert('Erro ao salvar serviço: ' + erro.message);
    }
  }

  async function remover(idServico) {
    if (!window.confirm('Deseja excluir este serviço?')) return;
    try {
      await excluirServico(idServico);
      if (setMensagem) setMensagem('Serviço excluído com sucesso!');
      if (mode === 'list') {
        carregarServicos();
      } else {
        navigate('/servicos');
      }
    } catch (erro) {
      alert('Erro ao excluir serviço: ' + erro.message);
    }
  }

  if (mode === 'view') {
    if (carregando && !servicoAtual) {
      return <div className="table-empty">Carregando detalhes do serviço...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Procedimento</h2>
            <p>Visualização das informações do serviço</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/servicos')}>
              &larr; Voltar para Lista
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/servicos/${id}/editar`)}>
              Editar Serviço
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{servicoAtual?.nome}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Código do Serviço #{servicoAtual?.id}</div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir Serviço
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Nome do Serviço</span>
              <span className="view-value">{servicoAtual?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Valor / Preço</span>
              <span className="view-value">
                R$ {Number(servicoAtual?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Duração Estimada</span>
              <span className="view-value">{servicoAtual?.duracao_minutos ? `${servicoAtual.duracao_minutos} minutos` : 'Não informada'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Status no Catálogo</span>
              <span className="view-value">
                <span className="badge badge-ativo">{servicoAtual?.status || 'Ativo'}</span>
              </span>
            </div>

            <div className="view-field view-full-width">
              <span className="view-label">Descrição do Procedimento</span>
              <span className="view-value" style={{ fontWeight: 'normal', lineHeight: '1.6' }}>
                {servicoAtual?.descricao || 'Nenhuma descrição detalhada cadastrada para este serviço.'}
              </span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/servicos')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/servicos/${id}/editar`)}>
              Editar Dados
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>{id ? `Editar Serviço #${id}` : 'Novo Serviço'}</h2>
            <p>{id ? 'Altere as informações do procedimento' : 'Adicione um novo procedimento ao catálogo da clínica'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/servicos')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">
            {id ? 'Editar Dados do Procedimento' : 'Cadastrar Novo Procedimento'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-group">
              <label>Nome do Serviço *</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Limpeza de Pele Profunda com Peeling de Diamante"
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="150.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Duração Prevista (minutos)</label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="60"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                rows="3"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Indicações clínicas, cuidados pré e pós-procedimento..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/servicos/${id}` : '/servicos')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? 'Salvar Alterações' : 'Salvar Serviço'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const servicosFiltrados = servicos.filter((s) => {
    const termo = busca.toLowerCase();
    const nomeS = s.nome?.toLowerCase() || '';
    const descS = s.descricao?.toLowerCase() || '';
    return nomeS.includes(termo) || descS.includes(termo);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Catálogo de Serviços</h2>
          <p>Procedimentos e tratamentos disponíveis na clínica</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/servicos/novo')}
        >
          + Novo Serviço
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h3>Serviços Cadastrados ({servicosFiltrados.length})</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome do serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/servicos/novo')}
          >
            + Adicionar
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Duração</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    {carregando ? 'Carregando serviços...' : 'Nenhum serviço cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                servicosFiltrados.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/servicos/${s.id}`)}
                      >
                        {s.nome}
                      </strong>
                    </td>
                    <td>{s.descricao || '-'}</td>
                    <td>{s.duracao_minutos ? `${s.duracao_minutos} min` : '-'}</td>
                    <td><strong>R$ {Number(s.valor || 0).toFixed(2)}</strong></td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/servicos/${s.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => navigate(`/servicos/${s.id}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(s.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
