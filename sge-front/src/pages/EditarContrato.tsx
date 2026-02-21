import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterContrato } from '../Services/contratoService';
import { listarDocumentos, uploadDocumento, downloadDocumento, excluirDocumento } from '../Services/documentoService';
import { ContratoDetalhe, Documento } from '../types';

export default function EditarContrato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState<'informacoes' | 'documentos'>('documentos');
  const [contrato, setContrato] = useState<ContratoDetalhe | null>(null);
  const [loadingContrato, setLoadingContrato] = useState(true);

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docMensagem, setDocMensagem] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);

  const titulo = useMemo(() => `Editar Contrato #${id}`, [id]);

  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        const data = await obterContrato(id);
        setContrato(data);
      } catch (e: any) {
        console.error('Erro ao carregar contrato:', e);
      } finally {
        setLoadingContrato(false);
      }
    })();
  }, [id]);

  const carregarDocumentos = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoadingDocs(true);
      setDocMensagem('');
      const data = await listarDocumentos(id);
      console.log('Documentos carregados:', data);
      if (Array.isArray(data)) {
        setDocumentos(data);
      } else {
        setDocumentos([]);
      }
    } catch (e: any) {
      console.error('Erro ao carregar documentos:', e);
      setDocMensagem('Erro ao carregar documentos: ' + (e?.response?.data || e?.message || 'Erro desconhecido'));
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [id]);

  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!arquivo || !id) {
      setDocMensagem('Selecione um arquivo antes de enviar.');
      return;
    }
    try {
      setLoadingDocs(true);
      setDocMensagem('');
      
      const documentoSalvo = await uploadDocumento(id, arquivo);
      console.log('Documento salvo:', documentoSalvo);

      setArquivo(null);
      const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      await carregarDocumentos();
      
      setDocMensagem('Documento enviado com sucesso!');
      setTimeout(() => setDocMensagem(''), 3000);
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      const errorMsg = error?.response?.data?.erro || error?.response?.data || error?.message || 'Erro desconhecido';
      setDocMensagem('Erro ao enviar documento: ' + errorMsg);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleDownload = async (documentoId?: number) => {
    if (!documentoId) return;
    try {
      await downloadDocumento(documentoId);
    } catch (error: any) {
      setDocMensagem('Erro ao baixar documento: ' + (error?.message || ''));
    }
  };

  const handleExcluir = async (documentoId?: number) => {
    if (!documentoId) return;
    
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }
    try {
      setLoadingDocs(true);
      setDocMensagem('');
      
      await excluirDocumento(documentoId);

      await carregarDocumentos();
      
      setDocMensagem('Documento excluído com sucesso!');
      setTimeout(() => setDocMensagem(''), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      const errorMsg = error?.response?.data?.erro || error?.response?.data || error?.message || 'Erro desconhecido';
      setDocMensagem('Erro ao excluir documento: ' + errorMsg);
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
      <div className="container-fluid mt-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">
            <i className="fas fa-edit me-2 text-danger"></i>{titulo}
          </h2>
          <button className="btn btn-outline-secondary" onClick={() => navigate(`/contratos/${id}`)}>
            <i className="fas fa-arrow-left me-2"></i>Voltar para Visualização
          </button>
        </div>

        {loadingContrato ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body">
                  <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                      <button
                          className={`nav-link ${abaAtiva === 'informacoes' ? 'active' : ''}`}
                          onClick={() => setAbaAtiva('informacoes')}
                      >
                        <i className="fas fa-info-circle me-2"></i>Informações do Contrato
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                          className={`nav-link ${abaAtiva === 'documentos' ? 'active' : ''} position-relative`}
                          onClick={() => {
                            setAbaAtiva('documentos');
                            setTimeout(() => carregarDocumentos(), 100);
                          }}
                      >
                        <i className="fas fa-paperclip me-2"></i>Gerenciar Documentos
                        {documentos.length > 0 && (
                          <span className="badge bg-danger ms-2"></span>
                        )}
                      </button>
                    </li>
                  </ul>

                  {abaAtiva === 'informacoes' && contrato && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Informações:</strong> Para editar as informações do contrato, entre em contato com o administrador.
                    </div>
                  )}

                  {abaAtiva === 'documentos' && (
                    <>
                      {docMensagem && (
                        <div className={`alert ${docMensagem.includes('Erro') || docMensagem.includes('erro') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
                          {docMensagem}
                          <button type="button" className="btn-close" onClick={() => setDocMensagem('')}></button>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Gerenciar Documentos</h5>
                        <button 
                          className="btn btn-sm btn-outline-primary" 
                          onClick={carregarDocumentos}
                          disabled={loadingDocs}
                        >
                          <i className={`fas fa-sync-alt me-2 ${loadingDocs ? 'fa-spin' : ''}`}></i>
                          Atualizar
                        </button>
                      </div>

                      <div className="card bg-light mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">
                            <i className="fas fa-upload me-2"></i>Adicionar Novo Documento
                          </h5>
                          <form onSubmit={handleUpload}>
                            <div className="row align-items-end g-3">
                              <div className="col-md-8">
                                <label className="form-label">Selecionar Arquivo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      setArquivo(file);
                                      if (file) {
                                        setDocMensagem('');
                                      }
                                    }}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    required
                                    key={arquivo ? 'reset' : 'default'}
                                />
                              </div>
                              <div className="col-md-4 d-grid">
                                <button className="btn btn-danger" type="submit" disabled={!arquivo || loadingDocs}>
                                  {loadingDocs ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                      Enviando...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-upload me-2"></i>Enviar
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                      {loadingDocs ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                              <span className="visually-hidden">Carregando...</span>
                            </div>
                          </div>
                      ) : documentos.length === 0 ? (
                          <div className="text-center py-5 border rounded bg-light">
                            <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                            <p className="text-muted mb-3">Nenhum documento anexado ainda.</p>
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={carregarDocumentos}
                            >
                              <i className="fas fa-sync-alt me-2"></i>Verificar Novamente
                            </button>
                          </div>
                      ) : (
                          <>
                            <div className="mb-3">
                              <span className="badge bg-primary">
                                Total: {documentos.length} documento{documentos.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="row g-3">
                              {documentos.map((doc) => (
                                  <div key={doc.id || Math.random()} className="col-md-6 col-lg-4">
                                    <div className="card border h-100 shadow-sm">
                                      <div className="card-body">
                                        <div className="d-flex align-items-start mb-3">
                                          <i className="fas fa-file-pdf fa-2x text-danger me-3"></i>
                                          <div className="flex-grow-1">
                                            <h6 className="mb-1 text-truncate" title={doc.nome || 'Sem nome'}>
                                              {doc.nome || 'Documento sem nome'}
                                            </h6>
                                            <small className="text-muted d-block">
                                              <i className="fas fa-calendar me-1"></i>
                                              {doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : '-'}
                                            </small>
                                            {doc.id && (
                                              <small className="text-muted d-block">
                                                <i className="fas fa-hashtag me-1"></i>ID: {doc.id}
                                              </small>
                                            )}
                                          </div>
                                        </div>
                                        <div className="d-grid gap-2">
                                          <button
                                              className="btn btn-sm btn-danger"
                                              onClick={() => handleDownload(doc.id)}
                                              disabled={!doc.id}
                                          >
                                            <i className="fas fa-download me-2"></i>Baixar
                                          </button>
                                          <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={() => handleExcluir(doc.id)}
                                              disabled={!doc.id}
                                          >
                                            <i className="fas fa-trash me-2"></i>Excluir
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

