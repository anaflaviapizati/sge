import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [perfil, setPerfil] = useState('ALUNO');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        try {
            const res = await api.post('/auth/register', { nome, email, senha, perfil });
            const { token, usuario } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            navigate('/');
        } catch (error) {
            setErro(error?.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
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
                                maxHeight: 500,
                                background: 'rgba(255,255,255,0.95)'
                            }}
                        >
                            <div className="card-body p-4">
                                <div className="text-center mb-3">
                                    <div className="d-flex flex-column align-items-center">
                                        <span className="fs-1 fw-bold mb-2">SGE</span>
                                        <span className="text-muted">Crie sua conta</span>
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
                                        <label className="form-label">Nome</label>
                                        <input className="form-control" value={nome} onChange={(e)=>setNome(e.target.value)} required/>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Senha</label>
                                        <input type="password" className="form-control" value={senha} onChange={(e)=>setSenha(e.target.value)} required/>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label d-block mb-1">Perfil</label>
                                        <div className="btn-group w-100" role="group">
                                            <input type="radio" className="btn-check" name="perfil" id="perfilAluno" autoComplete="off" checked={perfil==='ALUNO'} onChange={()=>setPerfil('ALUNO')} />
                                            <label className="btn btn-outline-danger" htmlFor="perfilAluno">Aluno</label>
                                            <input type="radio" className="btn-check" name="perfil" id="perfilOrientador" autoComplete="off" checked={perfil==='ORIENTADOR'} onChange={()=>setPerfil('ORIENTADOR')} />
                                            <label className="btn btn-outline-danger" htmlFor="perfilOrientador">Orientador</label>
                                        </div>
                                    </div>
                                    {erro && <div className="alert alert-danger py-2">{erro}</div>}
                                    <div className="d-grid">
                                        <button className="btn btn-danger btn-lg" disabled={loading} type="submit">
                                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                                        </button>
                                    </div>
                                </form>
                                <div className="text-center mt-3">
                                    <small>Já tem conta? <Link to="/login">Entrar</Link></small>
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


