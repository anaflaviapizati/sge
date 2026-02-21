import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { Usuario } from '../types';

interface LoginResponse {
    token: string;
    usuario: Usuario;
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const res = await api.post<LoginResponse>('/auth/login', { email, senha });
            const { token, usuario } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));

            await login(email, senha);
            navigate('/');
        } catch (error: any) {
            setErro(error?.response?.data?.message || 'Email ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">

                        {/* CARD */}
                        <div
                            className="card border-0 shadow-lg rounded-4"
                            style={{
                                backdropFilter: 'blur(10px)',
                                backgroundColor: 'rgba(255,255,255,0.95)',
                            }}
                        >
                            <div className="card-body p-4">

                                {/* LOGO / HEADER */}
                                <div className="text-center mb-4">
                                    <h1 className="fw-bold text-danger mb-1">SGE</h1>
                                    <p className="text-muted small mb-2">
                                        Sistema de Gerenciamento de Estágios
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
                                                    Entrando...
                                                </>
                                            ) : (
                                                'Entrar'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* FOOTER */}
                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        Não tem conta?{' '}
                                        <Link to="/register" className="text-danger fw-semibold">
                                            Cadastre-se
                                        </Link>
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* COPYRIGHT */}
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
