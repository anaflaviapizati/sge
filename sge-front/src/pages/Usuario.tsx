import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import api from '../api/axios';
import { Curso, DadosAluno, DadosOrientador, Perfil } from '../types';

interface FormDataAluno {
    nome: string;
    cpf: string;
    rg: string;
    rua: string;
    numero: string;
    bairro: string;
    cep: string;
    cidade: string;
    estado: string;
    telefone: string;
    matricula: string;
}

interface FormDataOrientador {
    nome: string;
    cpf: string;
    telefone: string;
    departamento: string;
    especialidade: string;
    cursoId: string;
}

export default function Usuario() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [formAluno, setFormAluno] = useState<FormDataAluno>({
        nome: '',
        cpf: '',
        rg: '',
        rua: '',
        numero: '',
        bairro: '',
        cep: '',
        cidade: '',
        estado: '',
        telefone: '',
        cursoId: '',
        matricula: ''
    });
    const [formOrientador, setFormOrientador] = useState<FormDataOrientador>({
        nome: '',
        cpf: '',
        telefone: '',
        departamento: '',
        especialidade: '',
        cursoId: ''
    });
    const [emailUsuario, setEmailUsuario] = useState<string>('');

    const [cursos, setCursos] = useState<Curso[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        // Obter perfil do usuário logado
        const usuarioStr = localStorage.getItem('usuario');
        const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
        const perfilUsuario = usuario?.perfil as Perfil;
        setPerfil(perfilUsuario);

        if (perfilUsuario === Perfil.ALUNO) {
            api.get<Curso[]>('/cursos')
                .then(res => setCursos(res.data))
                .catch(() => {});

            api.get<DadosAluno>('/dados-aluno/me')
                .then(res => {
                    const data = res.data || {};
                    setFormAluno({
                        nome: data.nome || '',
                        cpf: data.cpf || '',
                        rg: data.rg || '',
                        rua: data.rua || '',
                        numero: data.numero || '',
                        bairro: data.bairro || '',
                        cep: data.cep || '',
                        cidade: data.cidade || '',
                        estado: data.estado || '',
                        telefone: data.telefone || '',
                        cursoId: data.curso?.id?.toString() || '',
                        matricula: data.matricula || ''
                    });
                })
                .catch(() => {});
        } else if (perfilUsuario === Perfil.ORIENTADOR) {
            setEmailUsuario(usuario?.email || '');
            
            api.get<Curso[]>('/cursos')
                .then(res => setCursos(res.data))
                .catch(() => {});

            api.get<DadosOrientador>('/dados-orientador/me')
                .then(res => {
                    const data = res.data || {};
                    setFormOrientador({
                        nome: data.nome || '',
                        cpf: data.cpf || '',
                        telefone: data.telefone || '',
                        departamento: data.departamento || '',
                        especialidade: data.especialidade || '',
                        cursoId: data.cursoId?.toString() || ''
                    });
                })
                .catch(() => {});
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (perfil === Perfil.ALUNO) {
            setFormAluno(prev => ({ ...prev, [name]: value }));
        } else if (perfil === Perfil.ORIENTADOR) {
            setFormOrientador(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSalvar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSalvando(true);
        setMensagem('');

        try {
            if (perfil === Perfil.ALUNO) {
                const payload: any = { ...formAluno };
                if (!payload.cursoId) payload.cursoId = null;

                await api.put('/dados-aluno/me', payload);
            } else if (perfil === Perfil.ORIENTADOR) {
                const payload: any = { ...formOrientador };
                if (!payload.cursoId) payload.cursoId = null;
                await api.put('/dados-orientador/me', payload);
            } else {
                throw new Error('Perfil não identificado');
            }
            
            // Verifica imediatamente se o perfil está completo após salvar
            try {
                const response = await api.get('/perfil/completo');
                if (response.data.completo) {
                    setMensagem('Informações salvas com sucesso! Redirecionando...');
                    // Redireciona para a home imediatamente
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 500);
                } else {
                    setMensagem('Informações salvas com sucesso. Complete todos os campos obrigatórios.');
                }
            } catch (error) {
                console.error('Erro ao verificar perfil:', error);
                setMensagem('Informações salvas com sucesso.');
            }
        } catch (error: any) {
            setMensagem(
                'Erro ao salvar: ' +
                (error?.response?.data?.message || error?.message || '')
            );
        } finally {
            setSalvando(false);
        }
    };

    if (!perfil) {
        return (
            <div className="container py-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">

            {/* HEADER */}
            <div className="mb-4">
                <h3 className="fw-bold text-dark mb-1">
                    Meus Dados
                </h3>
                <p className="text-muted mb-0">
                    Mantenha suas informações pessoais {perfil === Perfil.ALUNO ? 'e acadêmicas' : 'e profissionais'} sempre atualizadas.
                </p>
            </div>

            {/* ALERT */}
            {mensagem && (
                <div className={`alert ${mensagem.includes('Erro') ? 'alert-danger' : 'alert-success'} py-2`}>
                    <i className={`me-2 bi ${mensagem.includes('Erro') ? 'bi-exclamation-circle' : 'bi-check-circle'}`}></i>
                    {mensagem}
                </div>
            )}

            <form onSubmit={handleSalvar}>

                {/* DADOS PESSOAIS */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold text-danger mb-3">
                            <i className="bi bi-person me-2"></i>
                            Dados Pessoais
                        </h6>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small text-muted">Nome completo</label>
                                <input 
                                    className="form-control" 
                                    name="nome" 
                                    value={perfil === Perfil.ALUNO ? formAluno.nome : formOrientador.nome} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            {perfil === Perfil.ORIENTADOR ? (
                                <>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Email</label>
                                        <input 
                                            className="form-control" 
                                            type="email"
                                            value={emailUsuario} 
                                            disabled
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="col-md-3">
                                        <label className="form-label small text-muted">RG</label>
                                        <input 
                                            className="form-control" 
                                            name="rg" 
                                            value={formAluno.rg} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </>
                            )}
                            <div className="col-md-3">
                                <label className="form-label small text-muted">CPF</label>
                                <input 
                                    className="form-control" 
                                    name="cpf" 
                                    value={perfil === Perfil.ALUNO ? formAluno.cpf : formOrientador.cpf} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted">Telefone</label>
                                <input 
                                    className="form-control" 
                                    name="telefone" 
                                    value={perfil === Perfil.ALUNO ? formAluno.telefone : formOrientador.telefone} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* DADOS ACADÊMICOS / PROFISSIONAIS */}
                {perfil === Perfil.ALUNO ? (
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold text-danger mb-3">
                                <i className="bi bi-mortarboard me-2"></i>
                                Dados Acadêmicos
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small text-muted">Curso</label>
                                    <select className="form-select" name="cursoId" value={formAluno.cursoId} onChange={handleChange}>
                                        <option value="">Selecione um curso</option>
                                        {cursos.map(curso => (
                                            <option key={curso.id} value={curso.id}>
                                                {curso.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small text-muted">Matrícula</label>
                                    <input className="form-control" name="matricula" value={formAluno.matricula} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : perfil === Perfil.ORIENTADOR ? (
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold text-danger mb-3">
                                <i className="bi bi-briefcase me-2"></i>
                                Dados Profissionais
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small text-muted">Departamento</label>
                                    <input className="form-control" name="departamento" value={formOrientador.departamento} onChange={handleChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small text-muted">Especialidade</label>
                                    <input className="form-control" name="especialidade" value={formOrientador.especialidade} onChange={handleChange} />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small text-muted">Curso que orienta</label>
                                    <select className="form-select" name="cursoId" value={formOrientador.cursoId} onChange={handleChange}>
                                        <option value="">Selecione um curso</option>
                                        {cursos.map(curso => (
                                            <option key={curso.id} value={curso.id}>
                                                {curso.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* ENDEREÇO - apenas para alunos */}
                {perfil === Perfil.ALUNO && (
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold text-danger mb-3">
                                <i className="bi bi-geo-alt me-2"></i>
                                Endereço
                            </h6>

                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label small text-muted">Rua</label>
                                    <input 
                                        className="form-control" 
                                        name="rua" 
                                        value={formAluno.rua} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted">Número</label>
                                    <input 
                                        className="form-control" 
                                        name="numero" 
                                        value={formAluno.numero} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted">Bairro</label>
                                    <input 
                                        className="form-control" 
                                        name="bairro" 
                                        value={formAluno.bairro} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small text-muted">CEP</label>
                                    <input 
                                        className="form-control" 
                                        name="cep" 
                                        value={formAluno.cep} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small text-muted">Cidade</label>
                                    <input 
                                        className="form-control" 
                                        name="cidade" 
                                        value={formAluno.cidade} 
                                        onChange={handleChange} 
                                    />
                                </div>
                                <div className="col-md-1">
                                    <label className="form-label small text-muted">UF</label>
                                    <input 
                                        className="form-control text-uppercase" 
                                        maxLength={2} 
                                        name="estado" 
                                        value={formAluno.estado} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOTÃO */}
                <div className="d-flex justify-content-end">
                    <button className="btn btn-danger px-4 py-2 rounded-3" disabled={salvando}>
                        {salvando ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-save me-2"></i>
                                Salvar alterações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
