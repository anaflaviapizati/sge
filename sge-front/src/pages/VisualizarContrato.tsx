import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obterContrato } from '../Services/contratoService';
import { listarDocumentos, downloadDocumento, uploadDocumento, excluirDocumento } from '../Services/documentoService';
import { listarMensagens, enviarMensagem } from '../Services/chatService';
import { ContratoDetalhe, Documento, Mensagem, Perfil } from '../types';

export default function VisualizarContrato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState<'informacoes' | 'documentos'>('informacoes');
  const [contrato, setContrato] = useState<ContratoDetalhe | null>(null);
  const [loadingContrato, setLoadingContrato] = useState(true);
  const [erroContrato, setErroContrato] = useState('');

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docMensagem, setDocMensagem] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [textoMsg, setTextoMsg] = useState('');
  const [perfil, setPerfil] = useState<Perfil | ''>('');
  const [usuarioLogado, setUsuarioLogado] = useState<{ id?: number; nome?: string; email?: string } | null>(null);
  const [mostrarMenuEnvio, setMostrarMenuEnvio] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState(0);

  const titulo = useMemo(() => `Contrato #${id}`, [id]);

  // 🔹 Formata data/horário de forma resumida
  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    const hoje = new Date();
    const ehHoje = data.toDateString() === hoje.toDateString();
    
    if (ehHoje) {
      return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + 
             ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  };

  // 🔹 Carrega contrato
  useEffect(() => {
    if (!id) return;
    
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    setPerfil(usuario?.perfil || '');
    setUsuarioLogado(usuario ? { id: usuario.id, nome: usuario.nome, email: usuario.email } : null);

    (async () => {
      try {
        const data = await obterContrato(id);
        setContrato(data);
      } catch (e: any) {
        setErroContrato('Erro ao carregar contrato: ' + (e?.message || ''));
      } finally {
        setLoadingContrato(false);
      }
    })();
  }, [id]);

  // 🔹 Função para carregar documentos
  const carregarDocumentos = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoadingDocs(true);
      setDocMensagem('');
      const data = await listarDocumentos(id);
      if (Array.isArray(data)) {
        setDocumentos(data);
      } else {
        setDocumentos([]);
      }
    } catch (e: any) {
      setDocMensagem('Erro ao carregar documentos: ' + (e?.response?.data || e?.message || 'Erro desconhecido'));
      setDocumentos([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [id]);

  // 🔹 Carrega documentos quando o ID muda
  useEffect(() => {
    carregarDocumentos();
    setPaginaAtiva(0); // Reset para primeira página quando documentos mudam
  }, [carregarDocumentos]);

  // 🔹 Sincroniza estado quando carrossel muda via Bootstrap
  useEffect(() => {
    const carousel = document.querySelector('#carouselDocumentos');
    if (!carousel) return;

    const handleSlide = (e: any) => {
      const activeIndex = e.to;
      setPaginaAtiva(activeIndex);
    };

    carousel.addEventListener('slid.bs.carousel', handleSlide);
    
    return () => {
      carousel.removeEventListener('slid.bs.carousel', handleSlide);
    };
  }, [documentos.length]);

  // 🔹 Carrega mensagens
  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        const data = await listarMensagens(id);
        setMensagens(Array.isArray(data) ? data : []);
      } catch (e) {
        // silencia para não poluir a UI
      } finally {
        setLoadingChat(false);
      }
    })();
  }, [id]);

  // 🔹 Download de documento
  const handleDownload = async (documentoId?: number) => {
    if (!documentoId) return;
    try {
      await downloadDocumento(documentoId);
    } catch (error: any) {
      setDocMensagem('Erro ao baixar documento: ' + (error?.message || ''));
    }
  };

  // 🔹 Excluir documento
  const handleExcluir = async (documentoId?: number) => {
    if (!documentoId) return;
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }
    try {
      await excluirDocumento(documentoId);
      setDocMensagem('Documento excluído com sucesso!');
      await carregarDocumentos();
      setTimeout(() => setDocMensagem(''), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.erro || error?.response?.data || error?.message || 'Erro desconhecido';
      setDocMensagem('Erro ao excluir documento: ' + errorMsg);
    }
  };

  // 🔹 Upload de documento
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !arquivo) return;

    try {
      setUploading(true);
      setDocMensagem('');
      
      await uploadDocumento(id, arquivo);
      
      // Limpar o input de arquivo
      setArquivo(null);
      if (e.currentTarget) {
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
      
      // Recarregar documentos imediatamente
      await carregarDocumentos();
      
      setDocMensagem('Documento enviado com sucesso!');
      setTimeout(() => setDocMensagem(''), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.erro || error?.response?.data || error?.message || 'Erro desconhecido';
      setDocMensagem('Erro ao enviar documento: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Enviar mensagem
  const handleEnviarMensagem = async (acao: string | null = null) => {
    if (!id) return;
    
    const conteudoTrim = textoMsg.trim();
    if (!conteudoTrim) return;

    let tipoEnvio = 'NORMAL';
    if (acao) {
      switch (acao) {
        case 'APROVAR':
          tipoEnvio = 'ENVIAR_E_APROVAR';
          break;
        case 'SOLICITAR_RESPOSTA':
          tipoEnvio = 'ENVIAR_E_SOLICITAR_CORRECAO';
          break;
        case 'CORRECAO':
          tipoEnvio = 'ENVIAR_E_SOLICITAR_CORRECAO';
          break;
        default:
          tipoEnvio = 'NORMAL';
      }
    }

    try {
      await enviarMensagem(id, conteudoTrim, tipoEnvio);
      setTextoMsg('');
      setMostrarMenuEnvio(false);

      // Recarregar mensagens após envio
      const novasMensagens = await listarMensagens(id);
      setMensagens(novasMensagens);

      // Sempre recarregar o contrato para atualizar o status (pode ter mudado mesmo sem ação explícita)
      const atualizado = await obterContrato(id);
      setContrato(atualizado);
    } catch (e: any) {
      console.error('Erro ao enviar mensagem:', e);
      const erroMsg = e?.response?.data?.erro || e?.message || 'Erro ao enviar mensagem. Por favor, tente novamente.';
      alert(erroMsg);
    }
  };

  return (
      <div className="container-fluid mt-4 px-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark">
            <i className="fas fa-file-contract me-2 text-danger"></i>{titulo}
          </h2>
          <div className="d-flex gap-2">
            {perfil !== Perfil.ORIENTADOR && (
              <button className="btn btn-outline-danger" onClick={() => navigate(`/contratos/${id}/editar`)}>
                <i className="fas fa-edit me-2"></i>Editar
              </button>
            )}
            <button className="btn btn-outline-secondary" onClick={() => navigate('/contratos')}>
              <i className="fas fa-arrow-left me-2"></i>Voltar
            </button>
          </div>
        </div>

        {erroContrato && <div className="alert alert-danger alert-dismissible fade show">{erroContrato}
          <button type="button" className="btn-close" onClick={() => setErroContrato('')}></button>
        </div>}

        <div className="row">
          {/* Abas: Informações e Documentos */}
          <div className="col-md-8 mb-3">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button
                        className={`nav-link ${abaAtiva === 'informacoes' ? 'active' : ''}`}
                        onClick={() => setAbaAtiva('informacoes')}
                    >
                      <i className="fas fa-info-circle me-2"></i>Informações
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                        className={`nav-link ${abaAtiva === 'documentos' ? 'active' : ''}`}
                        onClick={() => {
                          setAbaAtiva('documentos');
                          setTimeout(() => carregarDocumentos(), 100);
                        }}
                    >
                      <i className="fas fa-paperclip me-2"></i>Documentos
                    </button>
                  </li>
                </ul>

                {abaAtiva === 'informacoes' && (
                    <>
                      {loadingContrato ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-danger" role="status">
                              <span className="visually-hidden">Carregando...</span>
                            </div>
                          </div>
                      ) : !contrato ? (
                          <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle me-2"></i>Contrato não encontrado.
                          </div>
                      ) : (
                          <div className="row g-4">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Empresa</label>
                              <input type="text" className="form-control" disabled value={contrato.empresa || ''} />
                            </div>
                            {contrato.setor && (
                              <div className="col-md-3">
                                <label className="form-label fw-semibold">Setor</label>
                                <input type="text" className="form-control" disabled value={contrato.setor || ''} />
                              </div>
                            )}
                            {contrato.cargo && (
                              <div className="col-md-3">
                                <label className="form-label fw-semibold">Cargo</label>
                                <input type="text" className="form-control" disabled value={contrato.cargo || ''} />
                              </div>
                            )}
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Data de Início</label>
                              <input type="text" className="form-control" disabled 
                                value={contrato.dataInicio ? new Date(contrato.dataInicio).toLocaleDateString('pt-BR') : '-'} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Data de Fim</label>
                              <input type="text" className="form-control" disabled 
                                value={contrato.dataFim ? new Date(contrato.dataFim).toLocaleDateString('pt-BR') : '-'} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold">Status</label>
                              <input type="text" className="form-control" disabled value={contrato.status || '-'} />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">Orientador</label>
                              <input type="text" className="form-control" disabled value={contrato.orientador || 'Não atribuído'} />
                            </div>
                            <div className="col-12">
                              <label className="form-label fw-semibold">Descrição</label>
                              <textarea className="form-control" rows={4} disabled value={contrato.descricao || ''} readOnly />
                            </div>
                          </div>
                      )}
                    </>
                )}

                {abaAtiva === 'documentos' && (
                    <>
                      {docMensagem && (
                        <div className={`alert ${docMensagem.includes('Erro') || docMensagem.includes('erro') ? 'alert-danger' : 'alert-info'} alert-dismissible fade show`}>
                          {docMensagem}
                          <button type="button" className="btn-close" onClick={() => setDocMensagem('')}></button>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Documentos do Contrato</h5>
                      </div>

                      {/* Formulário de upload - apenas para orientadores */}
                      {perfil === Perfil.ORIENTADOR && (
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
                                  <button className="btn btn-danger" type="submit" disabled={!arquivo || uploading}>
                                    {uploading ? (
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
                      )}

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
                            <div id="carouselDocumentos" className="carousel slide" data-bs-ride="false">
                              <div className="carousel-inner pb-4">
                                {Array.from({ length: Math.ceil(documentos.length / 3) }).map((_, groupIndex) => {
                                  const startIndex = groupIndex * 3;
                                  const groupDocs = documentos.slice(startIndex, startIndex + 3);
                                  
                                  return (
                                    <div key={groupIndex} className={`carousel-item ${groupIndex === paginaAtiva ? 'active' : ''}`}>
                                      <div className="row g-3">
                                        {groupDocs.map((doc) => (
                                          <div key={doc.id || Math.random()} className="col-md-4">
                                            <div className="card border h-100 shadow-sm">
                                              <div className="card-body">
                                                <div className="d-flex align-items-start mb-3">
                                                  <i className="fas fa-file-pdf fa-2x text-danger me-3"></i>
                                                  <div className="flex-grow-1">
                                                    <h6 className="mb-1" style={{ wordBreak: 'break-word' }} title={doc.nome || 'Sem nome'}>
                                                      {doc.nome || 'Documento sem nome'}
                                                    </h6>
                                                    <small className="text-muted d-block">
                                                      <i className="fas fa-calendar me-1"></i>
                                                      {doc.criadoEm ? new Date(doc.criadoEm).toLocaleDateString('pt-BR') : '-'}
                                                    </small>
                                                  </div>
                                                </div>
                                                <div className="d-flex gap-2 justify-content-end">
                                                  <button
                                                      className="btn btn-sm btn-link text-danger p-0"
                                                      onClick={() => handleDownload(doc.id)}
                                                      disabled={!doc.id}
                                                      title="Baixar documento"
                                                  >
                                                    <i className="fas fa-download fa-lg"></i>
                                                  </button>
                                                  {(() => {
                                                    const usuarioStr = localStorage.getItem('usuario');
                                                    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                                                    const idUsuarioLogado = Number(usuario?.id || usuarioLogado?.id);
                                                    const idCriador = Number(doc.criadoPorId);
                                                    const podeExcluir = idUsuarioLogado && idCriador && idUsuarioLogado === idCriador;
                                                    
                                                    return podeExcluir ? (
                                                      <button
                                                          className="btn btn-sm btn-link text-danger p-0"
                                                          onClick={() => handleExcluir(doc.id)}
                                                          disabled={!doc.id}
                                                          title="Excluir documento"
                                                      >
                                                        <i className="fas fa-trash fa-lg"></i>
                                                      </button>
                                                    ) : null;
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        {/* Preencher espaços vazios se necessário */}
                                        {groupDocs.length < 3 && Array.from({ length: 3 - groupDocs.length }).map((_, idx) => (
                                          <div key={`empty-${idx}`} className="col-md-4"></div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {documentos.length > 3 && (
                                <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-2">
                                  <button 
                                    className="btn btn-outline-danger" 
                                    type="button" 
                                    onClick={() => {
                                      const novaPagina = paginaAtiva > 0 ? paginaAtiva - 1 : Math.ceil(documentos.length / 3) - 1;
                                      setPaginaAtiva(novaPagina);
                                      const carousel = document.querySelector('#carouselDocumentos');
                                      if (carousel) {
                                        const bsCarousel = (window as any).bootstrap?.Carousel?.getInstance(carousel);
                                        if (bsCarousel) {
                                          bsCarousel.to(novaPagina);
                                        }
                                      }
                                    }}
                                    disabled={documentos.length <= 3}
                                  >
                                    <i className="fas fa-chevron-left"></i>
                                  </button>
                                  <div className="d-flex gap-2">
                                    {Array.from({ length: Math.ceil(documentos.length / 3) }).map((_, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                          setPaginaAtiva(idx);
                                          const carousel = document.querySelector('#carouselDocumentos');
                                          if (carousel) {
                                            const bsCarousel = (window as any).bootstrap?.Carousel?.getInstance(carousel);
                                            if (bsCarousel) {
                                              bsCarousel.to(idx);
                                            }
                                          }
                                        }}
                                        className={`btn btn-sm ${idx === paginaAtiva ? 'btn-danger' : 'btn-outline-danger'}`}
                                        aria-label={`Slide ${idx + 1}`}
                                        style={{ width: '35px', height: '35px', borderRadius: '50%', padding: 0 }}
                                      >
                                        {idx + 1}
                                      </button>
                                    ))}
                                  </div>
                                  <button 
                                    className="btn btn-outline-danger" 
                                    type="button" 
                                    onClick={() => {
                                      const novaPagina = paginaAtiva < Math.ceil(documentos.length / 3) - 1 ? paginaAtiva + 1 : 0;
                                      setPaginaAtiva(novaPagina);
                                      const carousel = document.querySelector('#carouselDocumentos');
                                      if (carousel) {
                                        const bsCarousel = (window as any).bootstrap?.Carousel?.getInstance(carousel);
                                        if (bsCarousel) {
                                          bsCarousel.to(novaPagina);
                                        }
                                      }
                                    }}
                                    disabled={documentos.length <= 3}
                                  >
                                    <i className="fas fa-chevron-right"></i>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                      )}
                    </>
                )}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-3 h-100 d-flex flex-column">
              <div className="card-body d-flex flex-column" style={{ flex: '1 1 auto', minHeight: 0 }}>
                <h5 className="card-title text-danger mb-4">
                  <i className="fas fa-comments me-2"></i>Chat
                </h5>
              <div className="mb-3" style={{ flex: '1 1 auto', minHeight: '200px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {loadingChat ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                    </div>
                ) : mensagens.length === 0 ? (
                    <div className="text-center text-muted" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <i className="fas fa-comment-slash fa-2x mb-2"></i>
                      <p className="small">Nenhuma mensagem ainda.</p>
                    </div>
                ) : (
                    <div style={{ padding: '0.5rem' }}>
                    {mensagens.map((m) => {
                        // Obtém o usuário logado do localStorage
                        const usuarioStr = localStorage.getItem('usuario');
                        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
                        const idUsuarioLogado = Number(usuario?.id || usuarioLogado?.id);
                        const idAutor = Number(m.autorId);
                        // Compara apenas por ID do autor
                        const isMinhaMensagem = idUsuarioLogado && idAutor && !isNaN(idAutor) && !isNaN(idUsuarioLogado) && idUsuarioLogado === idAutor;

                        return (
                          <div
                            key={m.id}
                            className={`d-flex mb-2 ${
                              isMinhaMensagem ? 'justify-content-end' : 'justify-content-start'
                            }`}
                          >
                            <div
                              className="rounded-3 px-3 py-2 bg-light border"
                              style={{
                                maxWidth: '90%',   
                                minWidth: '250px',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              <div
                                className="fw-semibold mb-1 text-muted"
                                style={{ fontSize: '0.75rem' }}
                              >
                                {m.autor || 'Desconhecido'}
                              </div>

                              <div className="mb-1 text-dark" style={{ lineHeight: '1.4' }}>
                                {m.conteudo || m.texto || ''}
                              </div>

                              {m.criadoEm && (
                                <div
                                  className="text-end text-muted"
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {formatarData(m.criadoEm)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                )}
              </div>

              <div className="card-footer pt-3 border-top bg-transparent" style={{ flexShrink: 0 }}>
                <div className="d-flex gap-2">
                  <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      style={{ background: 'transparent' }}
                      placeholder="Digite sua mensagem..."
                      value={textoMsg}
                      onChange={(e) => setTextoMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                  />
                  <div className="position-relative">
                    <button 
                      className="btn btn-danger dropdown-toggle px-4" 
                      type="button"
                      onClick={() => setMostrarMenuEnvio(!mostrarMenuEnvio)}
                      disabled={!textoMsg.trim()}
                      title="Enviar mensagem"
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Enviar
                    </button>
                    {mostrarMenuEnvio && (
                      <div
                        className="dropdown-menu show"
                        style={{ position: 'absolute', right: 0, top: '100%', zIndex: 1000, marginTop: '0.25rem', minWidth: '220px' }}
                        onMouseLeave={() => setMostrarMenuEnvio(false)}
                      >
                        <button className="dropdown-item fw-semibold" onClick={() => { setMostrarMenuEnvio(false); handleEnviarMensagem(); }}>
                          <i className="fas fa-paper-plane me-2"></i>Enviar mensagem
                        </button>
                        <div className="dropdown-divider"></div>
                        {perfil === Perfil.ORIENTADOR ? (
                          <>
                            <button className="dropdown-item" onClick={() => { setMostrarMenuEnvio(false); handleEnviarMensagem('APROVAR'); }}>
                              <i className="fas fa-check me-2"></i>Enviar e aprovar
                            </button>
                            <button className="dropdown-item" onClick={() => { setMostrarMenuEnvio(false); handleEnviarMensagem('SOLICITAR_RESPOSTA'); }}>
                              <i className="fas fa-comment-dots me-2"></i>Enviar e solicitar resposta
                            </button>
                            <button className="dropdown-item" onClick={() => { setMostrarMenuEnvio(false); handleEnviarMensagem('CORRECAO'); }}>
                              <i className="fas fa-edit me-2"></i>Enviar para correção
                            </button>
                          </>
                        ) : (
                          <button className="dropdown-item" onClick={() => { setMostrarMenuEnvio(false); handleEnviarMensagem('SOLICITAR_RESPOSTA'); }}>
                            <i className="fas fa-comment-dots me-2"></i>Enviar e solicitar resposta
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

