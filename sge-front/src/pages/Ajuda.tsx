import { useState, useEffect } from 'react';
import { listarCursosComOrientadores, CursoComOrientador } from '../Services/cursoService';

export default function Ajuda() {
  const [cursos, setCursos] = useState<CursoComOrientador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [cursoSelecionado, setCursoSelecionado] = useState<CursoComOrientador | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listarCursosComOrientadores();
        const list = Array.isArray(data) ? data : [];
        setCursos(list);
        if (list.length > 0 && !cursoSelecionado) {
          setCursoSelecionado(list[0]);
        }
      } catch (e: any) {
        setErro('Erro ao carregar cursos: ' + (e?.message || ''));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const orientadorAtual = cursoSelecionado?.orientador ?? null;

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">
          <i className="fas fa-circle-question me-2 text-danger"></i>
          Central de Ajuda e Orientações
        </h2>
      </div>

      {erro && <div className="alert alert-danger rounded-3">{erro}</div>}

      <div className="row g-4">
        <div className="col-lg-12">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-3">
            <div className="card-body">
              <h5 className="fw-bold text-dark mb-3">Selecione seu Curso:</h5>
              <ul className="nav nav-pills mb-4">
                {cursos.map((c) => (
                  <li key={c.id} className="nav-item me-2">
                    <button
                      className={`nav-link ${cursoSelecionado?.id === c.id ? 'active bg-danger text-white shadow-sm' : 'text-danger'}`}
                      onClick={() => setCursoSelecionado(c)}
                    >
                      {c.nome}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="card bg-light border-0 rounded-3 shadow-inset p-3">
                <div className="card-body">
                  <h4 className="mb-4 text-dark fw-bold border-bottom pb-2">
                    Orientações para {cursoSelecionado?.nome ?? '—'}
                  </h4>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-danger" role="status"></div>
                      <p className="text-muted mt-2">Carregando informações do curso...</p>
                    </div>
                  ) : !cursoSelecionado ? (
                    <div className="alert alert-info py-2 mb-0">Nenhum curso disponível.</div>
                  ) : (
                    <>
                      <div className="mb-4 p-3 border rounded-3 bg-white shadow-sm">
                        <h6 className="fw-semibold text-danger mb-3 d-flex align-items-center">
                          <i className="fas fa-user-tie me-2"></i> Orientador(a) Responsável
                        </h6>
                        {orientadorAtual ? (
                          <ul className="list-unstyled mb-0 ms-3">
                            <li><strong className="text-dark">Nome:</strong> {orientadorAtual.nome}</li>
                            <li><strong className="text-dark">Email:</strong>{' '}
                              <a href={`mailto:${orientadorAtual.email}`}>{orientadorAtual.email}</a>
                            </li>
                          </ul>
                        ) : (
                          <div className="alert alert-info py-2 mb-0">Nenhum orientador definido para este curso.</div>
                        )}
                      </div>

                      <div className="mt-4">
                        <h6 className="fw-semibold text-danger mb-2 d-flex align-items-center">
                          <i className="fas fa-clipboard-list me-2"></i> Como prosseguir com a assinatura do estágio
                        </h6>
                        <p className="mb-0 text-muted">
                          Insira aqui as instruções específicas do curso de {cursoSelecionado.nome} para a assinatura do estágio,
                          como documentos adicionais ou fluxo de aprovação.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
