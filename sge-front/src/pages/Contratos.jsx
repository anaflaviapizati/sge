import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarContratos, listarContratosOrientador } from '../Services/contratoService';

export default function Contratos() {
    const navigate = useNavigate();
    const [contratos, setContratos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [perfil, setPerfil] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const usuarioStr = localStorage.getItem('usuario');
                const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                const p = usuario?.perfil || '';
                setPerfil(p);
                const data = p === 'ORIENTADOR' ? await listarContratosOrientador() : await listarContratos();
                setContratos(Array.isArray(data) ? data : []);
            } catch (e) {
                setErro('Erro ao carregar contratos: ' + (e?.message || ''));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const statusMap = {
        'ATIVO': { color: 'bg-success bg-opacity-10 text-success', text: 'Ativo' },
        'APROVADO': { color: 'bg-success bg-opacity-10 text-success', text: 'Aprovado' },
        'ANALISE': { color: 'bg-warning bg-opacity-10 text-warning', text: 'Em Análise' },
        'PENDENTE': { color: 'bg-secondary bg-opacity-10 text-secondary', text: 'Pendente' },
        'CORRECAO_SOLICITADA': { color: 'bg-warning bg-opacity-10 text-warning', text: 'Correção Solicitada' },
        'REPROVADO': { color: 'bg-danger bg-opacity-10 text-danger', text: 'Reprovado' },
        'FINALIZADO': { color: 'bg-dark bg-opacity-10 text-dark', text: 'Finalizado' },
        'CANCELADO': { color: 'bg-dark bg-opacity-10 text-dark', text: 'Cancelado' }
    };

    return (
        <div className="container-fluid mt-4 px-4">
            {/* Cabeçalho da página */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">
                    <i className="fas fa-file-contract me-2 text-danger"></i>Contratos
                </h2>
                {perfil !== 'ORIENTADOR' && (
                    <button className="btn btn-danger shadow-sm" onClick={() => navigate('/novo-contrato')}>
                        <i className="fas fa-plus me-2"></i>Novo Contrato
                    </button>
                )}
            </div>

            {/* Mensagem de erro */}
            {erro && <div className="alert alert-danger">{erro}</div>}

            {/* Card da tabela */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status"></div>
                        </div>
                    ) : contratos.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-folder-open fa-3x mb-3 text-secondary"></i>
                            <p className="mb-0">Nenhum contrato encontrado.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead style={{ backgroundColor: '#a6213c', color: '#fff', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
                                <tr>
                                    <th style={{ width: '10%' }}>#</th>
                                    <th>Empresa</th>
                                    <th>Início</th>
                                    <th>Fim</th>
                                    <th>Status</th>
                                    <th className="text-center" style={{ width: '15%' }}>Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {contratos.map((c, idx) => {
                                    const status = statusMap[(c.status || '').toUpperCase()] || { color: 'bg-secondary bg-opacity-10 text-secondary', text: c.status || '-' };
                                    return (
                                        <tr key={c.id} className={idx % 2 === 0 ? 'bg-light bg-opacity-10' : ''} style={{ transition: '0.3s' }}>
                                            <td className="fw-semibold">{c.id}</td>
                                            <td>{c.empresa || '-'}</td>
                                            <td>{c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR') : '-'}</td>
                                            <td>{c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR') : '-'}</td>
                                            <td>
                                                    <span className={`badge ${status.color} rounded-pill px-3 py-1 fw-semibold`}>
                                                        {status.text}
                                                    </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                                                    onClick={() => navigate(`/contratos/${c.id}`)}
                                                >
                                                    <i className="fas fa-eye me-2"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
