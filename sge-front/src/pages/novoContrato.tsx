import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarContrato } from '../Services/contratoService';
import { ContratoDetalhe } from '../types';
import api from '../api/axios';

interface FormData {
    empresa: string;
    dataInicio: string;
    dataFim: string;
    orientador: string;
    descricao: string;
    setor: string;
    cargo: string;
}

interface Orientador {
    id: number;
    nome: string;
    email: string;
}

export default function NovoContrato() {
    const navigate = useNavigate();
    const [abaAtiva, setAbaAtiva] = useState<'informacoes' | 'anexos'>('informacoes');
    const [form, setForm] = useState<FormData>({
        empresa: '',
        dataInicio: '',
        dataFim: '',
        orientador: '',
        descricao: '',
        setor: '',
        cargo: '',
    });
    const [anexos, setAnexos] = useState<File[]>([]);
    const [mensagem, setMensagem] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [orientadores, setOrientadores] = useState<Orientador[]>([]);
    const [loadingOrientadores, setLoadingOrientadores] = useState(true);

    useEffect(() => {
        // Carregar orientadores do curso do aluno
        (async () => {
            try {
                const response = await api.get<Orientador[]>('/cursos/orientadores');
                setOrientadores(response.data || []);
            } catch (error) {
                console.error('Erro ao carregar orientadores:', error);
                setOrientadores([]);
            } finally {
                setLoadingOrientadores(false);
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAnexo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arquivos = Array.from(e.target.files || []);
        setAnexos((prev) => [...prev, ...arquivos]);
        setMensagem('');
    };

    const removerAnexo = (index: number) => {
        setAnexos((prev) => prev.filter((_, i) => i !== index));
        setMensagem('');
    };

    const formatarTamanho = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const salvarContrato = async () => {
        try {
            // Validação de campos obrigatórios
            if (!form.empresa?.trim() || !form.dataInicio) {
                setMensagem('Preencha os campos obrigatórios: Empresa e Data de Início.');
                setAbaAtiva('informacoes');
                return;
            }

            // Validação de documentos obrigatórios
            if (anexos.length === 0) {
                setMensagem('É necessário anexar pelo menos um documento antes de salvar o contrato.');
                setAbaAtiva('anexos');
                return;
            }

            setSalvando(true);
            setMensagem('');

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value);
                    console.log(`Adicionado ao FormData: ${key} = ${value}`);
                }
            });
            anexos.forEach((file, i) => {
                formData.append(`anexo_${i}`, file);
                console.log(`Adicionado anexo: anexo_${i} = ${file.name}`);
            });

            console.log('Total de campos no FormData:', Array.from(formData.keys()).length);
            const resposta: ContratoDetalhe = await criarContrato(formData);
            
            if (resposta && resposta.id) {
                alert('Contrato cadastrado com sucesso!');
                navigate(`/contratos/${resposta.id}`);
            } else {
                throw new Error('Resposta inválida do servidor');
            }
        } catch (error: any) {
            const erroMsg = error?.response?.data?.erro || 
                           error?.response?.data?.message || 
                           error?.message || 
                           'Erro desconhecido';
            setMensagem('Erro ao salvar contrato: ' + erroMsg);
            console.error('Erro completo ao salvar contrato:', error);
            console.error('Status:', error?.response?.status);
            console.error('Dados da resposta:', error?.response?.data);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">
                    <i className="fas fa-file-contract me-2 text-danger"></i>Novo Contrato
                </h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/contratos')}>
                    <i className="fas fa-arrow-left me-2"></i>Voltar
                </button>
            </div>

            {mensagem && (
                <div className={`alert ${mensagem.includes('Erro') ? 'alert-danger' : 'alert-warning'} alert-dismissible fade show`} role="alert">
                    {mensagem}
                    <button type="button" className="btn-close" onClick={() => setMensagem('')}></button>
                </div>
            )}

            {/* Abas */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body">
                    <ul className="nav nav-tabs nav-tabs-custom mb-4">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${abaAtiva === 'informacoes' ? 'active' : ''}`}
                                onClick={() => setAbaAtiva('informacoes')}
                                style={abaAtiva === 'informacoes' ? { borderBottom: 'none' } : {}}
                            >
                                <i className="fas fa-info-circle me-2"></i>Informações do Contrato
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${abaAtiva === 'anexos' ? 'active' : ''} position-relative`}
                                onClick={() => setAbaAtiva('anexos')}
                                style={abaAtiva === 'anexos' ? { borderBottom: 'none' } : {}}
                            >
                                <i className="fas fa-paperclip me-2"></i>Documentos
                                
                            </button>
                        </li>
                    </ul>
                    <style>{`
                        .nav-tabs-custom .nav-link.active::after {
                            display: none !important;
                        }
                    `}</style>

                    {/* Aba Informações */}
                    {abaAtiva === 'informacoes' && (
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">
                                    Empresa <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="empresa"
                                    value={form.empresa}
                                    onChange={handleChange}
                                    placeholder="Nome da empresa"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold">
                                    Setor
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="setor"
                                    value={form.setor}
                                    onChange={handleChange}
                                    placeholder="Setor da empresa"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold">
                                    Cargo
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="cargo"
                                    value={form.cargo}
                                    onChange={handleChange}
                                    placeholder="Cargo/Posição"
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Data de Início <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dataInicio"
                                    value={form.dataInicio}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Data de Fim
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="dataFim"
                                    value={form.dataFim}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">
                                    Orientador
                                </label>
                                <select
                                    className="form-select"
                                    name="orientador"
                                    value={form.orientador}
                                    onChange={handleChange}
                                    disabled={loadingOrientadores}
                                >
                                    <option value="">Selecione um orientador</option>
                                    {orientadores.map((orientador) => (
                                        <option key={orientador.id} value={orientador.email}>
                                            {orientador.nome}
                                        </option>
                                    ))}
                                </select>
                                {loadingOrientadores && (
                                    <small className="text-muted">Carregando orientadores...</small>
                                )}
                                {!loadingOrientadores && orientadores.length === 0 && (
                                    <small className="text-muted">Nenhum orientador disponível para seu curso</small>
                                )}
                            </div>

                            <div className="col-12">
                                <label className="form-label fw-semibold">
                                    Descrição
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    name="descricao"
                                    value={form.descricao}
                                    onChange={handleChange}
                                    placeholder="Descrição do contrato de estágio..."
                                ></textarea>
                            </div>

                            <div className="col-12 d-flex justify-content-end align-items-center mt-3">
                                <button 
                                    className="btn btn-danger px-4" 
                                    onClick={() => setAbaAtiva('anexos')}
                                >
                                    Próximo: Anexar Documentos <i className="fas fa-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Aba Anexos */}
                    {abaAtiva === 'anexos' && (
                        <div>
                            <div className="alert alert-info mb-4">
                                <i className="fas fa-exclamation-circle me-2"></i>
                                <strong>Importante:</strong> É necessário anexar pelo menos um documento para criar o contrato.
                            </div>

                            {anexos.length === 0 ? (
                                <div className="text-center py-5 border rounded bg-light">
                                    <i className="fas fa-file-upload fa-3x text-muted mb-3"></i>
                                    <p className="text-muted mb-4">Nenhum documento anexado ainda</p>
                                    <label className="btn btn-danger px-4">
                                        <i className="fas fa-plus me-2"></i>Selecionar Documentos
                                        <input
                                            type="file"
                                            className="d-none"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={handleAnexo}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            Documentos Anexados
                                        </h5>
                                        <label className="btn btn-outline-danger">
                                            <i className="fas fa-plus me-2"></i>Adicionar Mais
                                            <input
                                                type="file"
                                                className="d-none"
                                                multiple
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={handleAnexo}
                                            />
                                        </label>
                                    </div>

                                    <div className="row g-3">
                                        {anexos.map((file, index) => (
                                            <div key={index} className="col-md-6 col-lg-4">
                                                <div className="card border h-100">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-start mb-2">
                                                            <i className="fas fa-file-pdf fa-2x text-danger me-3"></i>
                                                            <div className="flex-grow-1">
                                                                <h6 className="mb-1 text-truncate" title={file.name}>
                                                                    {file.name}
                                                                </h6>
                                                                <small className="text-muted">
                                                                    {formatarTamanho(file.size)}
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger w-100"
                                                            onClick={() => removerAnexo(index)}
                                                        >
                                                            <i className="fas fa-trash me-2"></i>Remover
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                               
                                <button 
                                    className="btn btn-danger px-4" 
                                    onClick={salvarContrato}
                                    disabled={salvando || anexos.length === 0}
                                >
                                    {salvando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>Salvar Contrato
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

