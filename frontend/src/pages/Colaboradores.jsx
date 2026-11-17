import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getColaboradores, getColaborador, criarColaborador, atualizarColaborador, excluirColaborador } from '../services/api';

export default function Colaboradores({ mode = 'list', setMensagem }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [colaboradores, setColaboradores] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [colabAtual, setColabAtual] = useState(null);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [especializacao, setEspecializacao] = useState('');
  const [salario, setSalario] = useState('');

  useEffect(() => {
    if (mode === 'list') {
      carregarColaboradores();
    } else if ((mode === 'view' || mode === 'edit') && id) {
      carregarDetalhe(id);
    } else if (mode === 'edit' && !id) {
      limparCampos();
    }
  }, [mode, id]);

  async function carregarColaboradores() {
    try {
      setCarregando(true);
      const dados = await getColaboradores();
      setColaboradores(dados || []);
    } catch (erro) {
      console.log('Erro ao carregar colaboradores:', erro);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarDetalhe(idPessoa) {
    try {
      setCarregando(true);
      const colab = await getColaborador(idPessoa);
      setColabAtual(colab);
      setNome(colab.pessoa?.nome || '');
      setCpf(colab.pessoa?.cpf || '');
      setTelefone(colab.pessoa?.telefone || '');
      setEspecializacao(colab.especializacao || '');
      setSalario(colab.salario != null ? String(colab.salario) : '');
    } catch (erro) {
      alert('Erro ao carregar colaborador: ' + erro.message);
      navigate('/colaboradores');
    } finally {
      setCarregando(false);
    }
  }

  function limparCampos() {
    setColabAtual(null);
    setNome('');
    setCpf('');
    setTelefone('');
    setEspecializacao('');
    setSalario('');
  }

  async function salvar(e) {
    e.preventDefault();

    if (!nome.trim()) {
      alert('O nome do profissional é obrigatório!');
      return;
    }

    try {
      if (id) {
        await atualizarColaborador(id, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          especializacao: especializacao.trim(),
          salario: salario ? parseFloat(salario) : null
        });
        if (setMensagem) setMensagem('Colaborador atualizado com sucesso!');
        navigate(`/colaboradores/${id}`);
      } else {
        if (!cpf.trim()) {
          alert('O CPF é obrigatório para cadastrar um novo colaborador!');
          return;
        }
        await criarColaborador({
          nome: nome.trim(),
          cpf: cpf.trim(),
          telefone: telefone.trim(),
          especializacao: especializacao.trim(),
          salario: salario ? parseFloat(salario) : null
        });
        if (setMensagem) setMensagem('Colaborador cadastrado com sucesso!');
        navigate('/colaboradores');
      }
    } catch (erro) {
      alert('Erro ao salvar colaborador: ' + erro.message);
    }
  }

  async function remover(idPessoa) {
    if (!window.confirm('Deseja excluir este colaborador?')) return;
    try {
      await excluirColaborador(idPessoa);
      if (setMensagem) setMensagem('Colaborador excluído com sucesso!');
      if (mode === 'list') {
        carregarColaboradores();
      } else {
        navigate('/colaboradores');
      }
    } catch (erro) {
      alert('Erro ao excluir colaborador: ' + erro.message);
    }
  }

  if (mode === 'view') {
    if (carregando && !colabAtual) {
      return <div className="table-empty">Carregando dados do profissional...</div>;
    }

    return (
      <div>
        <div className="page-header">
          <div className="page-header-text">
            <h2>Detalhes do Colaborador</h2>
            <p>Visualização da ficha profissional e especialidades</p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/colaboradores')}>
              &larr; Voltar para Lista
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/colaboradores/${id}/editar`)}>
              Editar Colaborador
            </button>
          </div>
        </div>

        <div className="view-card">
          <div className="view-header">
            <div>
              <div className="view-title">{colabAtual?.pessoa?.nome || 'Profissional'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>ID Registro #{colabAtual?.id_pessoa}</div>
            </div>
            <button className="btn btn-danger" onClick={() => remover(id)}>
              Excluir Registro
            </button>
          </div>

          <div className="view-grid">
            <div className="view-field">
              <span className="view-label">Nome Completo</span>
              <span className="view-value">{colabAtual?.pessoa?.nome || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Especialização</span>
              <span className="view-value">{colabAtual?.especializacao || 'Geral'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">CPF</span>
              <span className="view-value">{colabAtual?.pessoa?.cpf || '-'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Telefone / WhatsApp</span>
              <span className="view-value">{colabAtual?.pessoa?.telefone || 'Não informado'}</span>
            </div>

            <div className="view-field">
              <span className="view-label">Remuneração / Salário</span>
              <span className="view-value">
                {colabAtual?.salario ? `R$ ${Number(colabAtual.salario).toFixed(2)}` : 'Não definido'}
              </span>
            </div>

            <div className="view-field">
              <span className="view-label">Status da Conta</span>
              <span className="view-value">
                <span className="badge badge-ativo">{colabAtual?.status || 'Ativo'}</span>
              </span>
            </div>
          </div>

          <div className="view-footer">
            <button className="btn btn-secondary" onClick={() => navigate('/colaboradores')}>
              Voltar
            </button>
            <button className="btn btn-primary" onClick={() => navigate(`/colaboradores/${id}/editar`)}>
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
            <h2>{id ? `Editar Colaborador #${id}` : 'Novo Profissional'}</h2>
            <p>{id ? 'Atualize as informações do profissional' : 'Cadastre um novo membro da equipe médica ou estética'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/colaboradores')}>
            &larr; Voltar para Lista
          </button>
        </div>

        <div className="form-card">
          <h3 className="form-title">
            {id ? 'Editar Dados do Profissional' : 'Cadastrar Novo Profissional'}
          </h3>
          <form onSubmit={salvar}>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nome do Profissional *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Juliana Costa"
                  required
                />
              </div>

              <div className="form-group">
                <label>CPF {id ? '(não editável)' : '*'}</label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  disabled={!!id}
                  required={!id}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                />
              </div>

              <div className="form-group">
                <label>Especialização</label>
                <input
                  type="text"
                  value={especializacao}
                  onChange={(e) => setEspecializacao(e.target.value)}
                  placeholder="Ex: Esteticista, Dermatologia, Cílios"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Salário (R$)</label>
              <input
                type="number"
                step="0.01"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
                placeholder="Ex: 3500.00"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(id ? `/colaboradores/${id}` : '/colaboradores')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {id ? 'Salvar Alterações' : 'Salvar Profissional'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const colabsFiltrados = colaboradores.filter((c) => {
    const termo = busca.toLowerCase();
    const nomePessoa = c.pessoa?.nome?.toLowerCase() || '';
    const esp = c.especializacao?.toLowerCase() || '';
    return nomePessoa.includes(termo) || esp.includes(termo);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h2>Equipe &amp; Colaboradores</h2>
          <p>Cadastro de profissionais e corpo clínico</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/colaboradores/novo')}
        >
          + Novo Colaborador
        </button>
      </div>

      <div className="table-card">
        <div className="table-header-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h3>Profissionais Cadastrados ({colabsFiltrados.length})</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome ou especialização..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Especialização</th>
                <th>Telefone</th>
                <th>Salário</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {colabsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    {carregando ? 'Carregando colaboradores...' : 'Nenhum colaborador encontrado.'}
                  </td>
                </tr>
              ) : (
                colabsFiltrados.map((colab) => (
                  <tr key={colab.id_pessoa}>
                    <td>#{colab.id_pessoa}</td>
                    <td>
                      <strong
                        style={{ cursor: 'pointer', color: 'var(--primary)' }}
                        onClick={() => navigate(`/colaboradores/${colab.id_pessoa}`)}
                      >
                        {colab.pessoa?.nome}
                      </strong>
                    </td>
                    <td>{colab.especializacao || '-'}</td>
                    <td>{colab.pessoa?.telefone || '-'}</td>
                    <td>{colab.salario ? 'R$ ' + Number(colab.salario).toFixed(2) : '-'}</td>
                    <td>
                      <span className="badge badge-ativo">
                        {colab.status || 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-coluna">
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => navigate(`/colaboradores/${colab.id_pessoa}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-editar"
                          onClick={() => navigate(`/colaboradores/${colab.id_pessoa}/editar`)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => remover(colab.id_pessoa)}
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
