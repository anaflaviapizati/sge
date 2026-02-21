import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Usuario, Perfil } from '../types';

interface RegisterResponse {
    token: string;
    usuario: Usuario;
}

export default function Register() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState<Perfil>(Perfil.ALUNO);
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        if (!nome || !email || !senha) {
            setErro('Preencha todos os campos.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post<RegisterResponse>(
                '/auth/register',
                { nome, email, senha, perfil }
            );

            const { token, usuario } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            navigate('/');
        } catch (error: any) {
            setErro(
                error?.response?.data?.message ||
                'Erro ao criar conta. Tente novamente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">

                        {/* CARD */}
                        <div
                            className="card border-0 shadow-lg rounded-4"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <div className="card-body p-4">

                                {/* HEADER */}
                                <div className="text-center mb-4">
                                    <h1 className="fw-bold text-danger mb-1">
                                        SGE
                                    </h1>
                                    <p className="text-muted small mb-2">
                                        Crie sua conta
                                    </p>
                                    <div
                                        style={{
                                            width: 60,
                                            height: 3,
                                            backgroundColor: '#dc3545',
                                            margin: '0 auto',
                                            borderRadius: 4
                                        }}
                                    />
                                </div>

                                {/* FORM */}
                                <form onSubmit={handleSubmit}>

                                    {/* NOME */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">
                                            Nome completo
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i className="fas fa-user text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Seu nome"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* EMAIL */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">
                                            Email
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i className="fas fa-envelope text-muted"></i>
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="seu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* SENHA */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">
                                            Senha
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-white">
                                                <i className="fas fa-lock text-muted"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="••••••••"
                                                value={senha}
                                                onChange={(e) => setSenha(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* PERFIL */}
                                    <div className="mb-3">
                                        <label className="form-label small text-muted d-block">
                                            Perfil
                                        </label>
                                        <div className="btn-group w-100" role="group">
                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="perfil"
                                                id="perfilAluno"
                                                checked={perfil === Perfil.ALUNO}
                                                onChange={() => setPerfil(Perfil.ALUNO)}
                                            />
                                            <label
                                                className="btn btn-outline-danger"
                                                htmlFor="perfilAluno"
                                            >
                                                Aluno
                                            </label>

                                            <input
                                                type="radio"
                                                className="btn-check"
                                                name="perfil"
                                                id="perfilOrientador"
                                                checked={perfil === Perfil.ORIENTADOR}
                                                onChange={() => setPerfil(Perfil.ORIENTADOR)}
                                            />
                                            <label
                                                className="btn btn-outline-danger"
                                                htmlFor="perfilOrientador"
                                            >
                                                Orientador
                                            </label>
                                        </div>
                                    </div>

                                    {/* ERRO */}
                                    {erro && (
                                        <div className="alert alert-danger py-2 small d-flex align-items-center">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            {erro}
                                        </div>
                                    )}

                                    {/* BOTÃO */}
                                    <div className="d-grid mt-3">
                                        <button
                                            type="submit"
                                            className="btn btn-danger btn-lg rounded-3"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Criando conta...
                                                </>
                                            ) : (
                                                'Cadastrar'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* LINK LOGIN */}
                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        Já tem conta?{' '}
                                        <Link to="/login" className="text-danger fw-semibold">
                                            Entrar
                                        </Link>
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="text-center mt-4">
                            <small className="text-muted">
                                © 2024 SGE <br />
                                Desenvolvido por Ana Flávia Pizati
                            </small>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
