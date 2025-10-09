import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Alunos() {
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarAlunos();
    }, []);

    const carregarAlunos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/alunos');
            setAlunos(response.data);
        } catch (error) {
            setErro('Erro ao carregar alunos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container-fluid mt-4 px-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2>Gerenciar Alunos</h2>
                        <Link to="/alunos/cadastro" className="btn btn-primary">
                            <i className="fas fa-plus"></i> Novo Aluno
                        </Link>
                    </div>

                    {erro && (
                        <div className="alert alert-danger" role="alert">
                            {erro}
                        </div>
                    )}

                    <div className="card">
                        <div className="card-body">
                            {alunos.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-muted">Nenhum aluno cadastrado</p>
                                    <Link to="/alunos/cadastro" className="btn btn-primary">
                                        Cadastrar Primeiro Aluno
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nome</th>
                                                <th>Email</th>
                                                <th>Curso</th>
                                                <th>Status</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alunos.map(aluno => (
                                                <tr key={aluno.id}>
                                                    <td>{aluno.id}</td>
                                                    <td>{aluno.nome}</td>
                                                    <td>{aluno.email || 'Não informado'}</td>
                                                    <td>{aluno.curso || 'Não informado'}</td>
                                                    <td>
                                                        <span className="badge bg-success">Ativo</span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <button className="btn btn-sm btn-outline-primary">
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-info">
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button className="btn btn-sm btn-outline-danger">
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
