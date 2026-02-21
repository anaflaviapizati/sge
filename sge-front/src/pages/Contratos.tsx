import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarContratos, listarContratosOrientador } from '../Services/contratoService';
import { Contrato, Perfil } from '../types';

export default function Contratos() {
    const navigate = useNavigate();
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [perfil, setPerfil] = useState<Perfil | ''>('');

    useEffect(() => {
        (async () => {
            try {
                document.documentElement.style.setProperty('--primary-color', '#a6213c');

                const usuarioStr = localStorage.getItem('usuario');
                const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                const p = (usuario?.perfil || Perfil.ALUNO) as Perfil;
                setPerfil(p);

                const data = p === Perfil.ORIENTADOR ? await listarContratosOrientador() : await listarContratos();
                setContratos(Array.isArray(data) ? data : []);
            } catch (e: any) {

                setErro('Erro ao carregar contratos: ' + (e?.message || 'Verifique a conexão com o servidor de backend.'));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const statusMap: Record<string, { color: string; text: string }> = {
        'ATIVO': { color: 'bg-success bg-opacity-10 text-success', text: 'Ativo' },
        'APROVADO': { color: 'bg-success bg-opacity-10 text-success', text: 'Aprovado' },
        'ANALISE': { color: 'bg-warning bg-opacity-10 text-warning', text: 'Em Análise' },
        'PENDENTE': { color: 'bg-secondary bg-opacity-10 text-secondary', text: 'Pendente' },
        'EM_ANALISE': { color: 'bg-warning bg-opacity-10 text-warning', text: 'Em Análise' },
        'CORRECAO_SOLICITADA': { color: 'bg-danger bg-opacity-10 text-danger', text: 'Correção Solicitada' },
        'REPROVADO': { color: 'bg-danger bg-opacity-10 text-danger', text: 'Reprovado' },
        'FINALIZADO': { color: 'bg-info bg-opacity-10 text-info', text: 'Finalizado' },
        'CANCELADO': { color: 'bg-dark bg-opacity-10 text-dark', text: 'Cancelado' }
    };

    const headerStyle = {
        backgroundColor: '#a6213c',
        color: '#fff',
    };

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
                <div className="d-flex align-items-center">
                    <h2 className="fw-bold text-dark me-3 mb-0">
                        <i className="fas fa-file-contract me-2 text-danger"></i>Contratos
                    </h2>
                    <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm">
                        {perfil === Perfil.ORIENTADOR ? 'ORIENTADOR' : 'ALUNO'}
                    </span>
                </div>

                {perfil !== Perfil.ORIENTADOR && (
                    <button className="btn btn-danger shadow-sm rounded-pill px-4" onClick={() => navigate('/novo-contrato')}>
                        <i className="fas fa-plus me-2"></i>Novo Contrato
                    </button>
                )}
            </div>

            {erro && <div className="alert alert-danger rounded-3">{erro}</div>}

            <div className="card border-0 shadow-lg rounded-3">
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status"></div>
                            <p className="mt-2 text-muted">Carregando contratos...</p>
                        </div>
                    ) : contratos.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-folder-open fa-3x mb-3 text-secondary"></i>
                            <p className="mb-0 fw-semibold">Nenhum contrato encontrado.</p>
                            {perfil !== Perfil.ORIENTADOR && (
                                <p className="text-sm mt-1">Clique em "Novo Contrato" para iniciar.</p>
                            )}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle table-hover mb-0">
                                <thead style={headerStyle} className="rounded-top">
                                <tr>
                                    <th className="fw-bold p-3" style={{ width: '10%', borderTopLeftRadius: '0.5rem' }}>#</th>
                                    <th className="fw-bold p-3">Empresa</th>
                                    <th className="fw-bold p-3">Início</th>
                                    <th className="fw-bold p-3">Fim</th>
                                    <th className="fw-bold p-3">Status</th>
                                    <th className="text-center fw-bold  p-3" style={{ width: '15%', borderTopRightRadius: '0.5rem' }}>Ações</th>
                                </tr>
                                </thead>
                                <tbody>
                                {contratos.map((c) => {
                                    const statusKey = (c.status || '').toUpperCase();
                                    const status = statusMap[statusKey] || { color: 'bg-secondary bg-opacity-10 text-secondary', text: c.status || '-' };

                                    const dataInicio = c.dataInicio ? new Date(c.dataInicio).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-';
                                    const dataFim = c.dataFim ? new Date(c.dataFim).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-';

                                    return (
                                        <tr key={c.id} className="align-middle" style={{ transition: 'background-color 0.2s' }}>
                                            <td className="fw-semibold text-muted">{c.id}</td>
                                            <td className="fw-medium text-dark">{c.empresa || '-'}</td>
                                            <td className="text-sm">{dataInicio}</td>
                                            <td className="text-sm">{dataFim}</td>
                                            <td>
                                                <span className={`badge ${status.color} rounded-pill px-3 py-1 fw-semibold`}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-outline-danger btn-sm px-3 rounded-pill shadow-sm"
                                                    onClick={() => navigate(`/contratos/${c.id}`)}
                                                    title="Visualizar Contrato"
                                                >
                                                    <i className="fas fa-eye me-1"></i> Visualizar
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