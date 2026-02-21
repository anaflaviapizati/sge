import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarContratos, listarContratosOrientador } from '../Services/contratoService';
import { Contrato, Perfil, StatusContrato } from '../types';

interface NotificationItemProps {
    text: string;
    type: 'warning' | 'info' | 'danger';
}

const NotificationItem = ({ text, type }: NotificationItemProps) => {
    const colors = {
        warning: 'text-warning',
        info: 'text-info',
        danger: 'text-danger'
    };

    return (
        <div className="d-flex align-items-start gap-3 py-3 border-bottom">
            <i className={`fas fa-circle mt-1 ${colors[type]}`} style={{ fontSize: '0.5rem' }}></i>
            <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
                {text}
            </p>
        </div>
    );
};

export default function Home() {
    const navigate = useNavigate();
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [loading, setLoading] = useState(true);
    const [perfil, setPerfil] = useState<Perfil | ''>('');

    useEffect(() => {
        (async () => {
            try {

                const usuarioStr = localStorage.getItem('usuario');
                const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                const p = (usuario?.perfil || Perfil.ALUNO) as Perfil;
                setPerfil(p);

                const data = p === Perfil.ORIENTADOR 
                    ? await listarContratosOrientador() 
                    : await listarContratos();
                setContratos(Array.isArray(data) ? data : []);
            } catch (e: any) {
                console.error('Erro ao carregar contratos:', e);
                setContratos([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const emAnalise = contratos.filter(
        c => c.status === StatusContrato.EM_ANALISE || 
             c.status === 'EM_ANALISE' || c.status === 'ANALISE').length;

    const pendentes = contratos.filter(
        c => c.status === StatusContrato.PENDENTE || 
             c.status === 'PENDENTE'
    ).length;

    const correcaoSolicitada = contratos.filter(
        c => c.status === StatusContrato.CORRECAO_SOLICITADA || 
             c.status === 'CORRECAO_SOLICITADA'
    ).length;

    const finalizados = contratos.filter(
        c => c.status === StatusContrato.FINALIZADO || 
             c.status === 'FINALIZADO'
    ).length;

    const notifications: Array<{ id: number; text: string; type: 'warning' | 'info' | 'danger' }> = [];

    contratos
        .filter(c => c.status === StatusContrato.EM_ANALISE || c.status === 'EM_ANALISE' || c.status === 'ANALISE')
        .slice(0, 3)
        .forEach((c, index) => {
            notifications.push({
                id: index + 1,
                text: `Contrato #${c.id} (${c.empresa}) aguardando análise.`,
                type: 'warning'
            });
        });

    contratos
        .filter(c => c.status === StatusContrato.CORRECAO_SOLICITADA || c.status === 'CORRECAO_SOLICITADA')
        .slice(0, 2)
        .forEach((c, index) => {
            notifications.push({
                id: notifications.length + index + 1,
                text: `Correção solicitada no contrato #${c.id} (${c.empresa}).`,
                type: 'danger'
            });
        });

    if (notifications.length < 5) {
        contratos
            .filter(c => c.status === StatusContrato.PENDENTE || c.status === 'PENDENTE')
            .slice(0, 5 - notifications.length)
            .forEach((c, index) => {
                notifications.push({
                    id: notifications.length + index + 1, text: `Contrato #${c.id} (${c.empresa}) está pendente.`, type: 'info'
                });
            });
    }

    return (
        <div className="bg-light min-vh-100">
            <main className="container py-5">
                <section className="mb-5">
                    <h1 className="fw-bold mb-2">
                        Olá 👋
                    </h1>
                    <p className="text-muted mb-0">
                        Acompanhe aqui o status dos seus estágios e contratos.
                    </p>
                </section>

                <section className="row g-4">
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                    Notificações
                                </h6>

                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                                    </div>
                                ) : notifications.length > 0 ? (
                                    <>
                                        {notifications.slice(0, 5).map(n => (
                                            <NotificationItem
                                                key={n.id}
                                                text={n.text}
                                                type={n.type}
                                            />
                                        ))}
                                        <button 
                                            className="btn btn-link text-danger px-0 mt-3"
                                            onClick={() => navigate('/contratos')}
                                        >
                                            Ver todos os contratos
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-muted text-center mt-4">
                                        Nenhuma notificação recente 🎉
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">
                                    Resumo dos Contratos
                                </h6>

                                {loading ? (
                                    <div className="text-center py-3">
                                        <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                                    </div>
                                ) : contratos.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="fas fa-folder-open fa-3x mb-3 text-secondary"></i>
                                        <p className="text-muted mb-3">Nenhum contrato encontrado.</p>
                                        {perfil !== Perfil.ORIENTADOR && (
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => navigate('/novo-contrato')}
                                            >
                                                <i className="fas fa-plus me-2"></i>Criar Primeiro Contrato
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-success bg-opacity-10 rounded">
                                                <div>
                                                    <p className="mb-0 fw-semibold text-success">Finalizados</p>
                                                    <small className="text-muted">Contratos concluídos</small>
                                                </div>
                                                <h3 className="mb-0 text-success">{finalizados}</h3>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-warning bg-opacity-10 rounded">
                                                <div>
                                                    <p className="mb-0 fw-semibold text-warning">Em Análise</p>
                                                    <small className="text-muted">Aguardando aprovação</small>
                                                </div>
                                                <h3 className="mb-0 text-warning">{emAnalise}</h3>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-danger bg-opacity-10 rounded">
                                                <div>
                                                    <p className="mb-0 fw-semibold text-danger">Correção Solicitada</p>
                                                    <small className="text-muted">Ação necessária</small>
                                                </div>
                                                <h3 className="mb-0 text-danger">{correcaoSolicitada}</h3>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-secondary bg-opacity-10 rounded">
                                                <div>
                                                    <p className="mb-0 fw-semibold text-secondary">Pendentes</p>
                                                    <small className="text-muted">Aguardando envio</small>
                                                </div>
                                                <h3 className="mb-0 text-secondary">{pendentes}</h3>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {contratos.length > 0 && (
                                    <div className="mt-4 pt-3 border-top">
                                        <button 
                                            className="btn btn-outline-danger w-100"
                                            onClick={() => navigate('/contratos')}
                                        >
                                            <i className="fas fa-list me-2"></i>Ver Todos os Contratos
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}