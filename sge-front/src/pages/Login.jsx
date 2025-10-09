import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const res = await api.post('/auth/login', { email, senha });
            const { token, usuario } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            login();
            navigate('/');
        } catch (error) {
            setErro(error?.response?.data?.message || 'Erro ao fazer login. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: "url('/images/background.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <div
                            className="card shadow"
                            style={{
                                minHeight: 350,
                                maxHeight: 400,
                                height: 370,
                                background: 'rgba(255,255,255,0.95)'
                            }}
                        >
                            <div className="card-body p-4">
                                <div className="text-center mb-3">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className="fs-1 fw-bold mb-2">SGE</span>
                                        <span className="text-muted">Sistema de Gerenciamento de Estágios</span>
                                        <div
                                            style={{
                                                width: 100,
                                                height: 3,
                                                background: '#dc3545',
                                                marginTop: 8,
                                                borderRadius: 2
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <label htmlFor="email" className="form-label">
                                            <i className="fas fa-envelope me-2"></i>
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Digite seu email"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="senha" className="form-label">
                                            <i className="fas fa-lock me-2"></i>
                                            Senha
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="senha"
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            placeholder="Digite sua senha"
                                            required
                                        />
                                    </div>
                                    {erro && (
                                        <div className="alert alert-danger py-2" role="alert">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {erro}
                                        </div>
                                    )}
                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-danger btn-lg"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Entrando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-sign-in-alt me-2"></i>
                                                    Entrar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center mt-3">
                                    <small>Não tem conta? <Link to="/register">Cadastre-se</Link></small>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-3">
                            <small className="text-muted">
                                © 2024 SGE. Todos os direitos reservados.<br />
                                Desenvolvido por Ana Flávia Pizati
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
