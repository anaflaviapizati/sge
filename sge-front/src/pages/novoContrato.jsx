import React, { useState } from 'react';
import api from '../api/axios';

export default function NovoContrato() {
    const [abaAtiva, setAbaAtiva] = useState('informacoes');
    const [form, setForm] = useState({
        empresa: '',
        dataInicio: '',
        dataFim: '',
        orientador: '',
        descricao: '',
    });
    const [anexos, setAnexos] = useState([]);
    const [mensagem, setMensagem] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAnexo = (e) => {
        const arquivos = Array.from(e.target.files);
        setAnexos((prev) => [...prev, ...arquivos]);
    };

    const removerAnexo = (index) => {
        setAnexos((prev) => prev.filter((_, i) => i !== index));
    };

    const salvarContrato = async () => {
        try {
            if (!form.empresa?.trim() || !form.dataInicio) {
                alert('Preencha os campos obrigatórios: Empresa e Data de Início.');
                return;
            }

            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => formData.append(key, value));
            anexos.forEach((file, i) => formData.append(`anexo_${i}`, file));

            await api.post('/contratos', formData);
            alert('Contrato cadastrado com sucesso!');
            setForm({ empresa: '', dataInicio: '', dataFim: '', orientador: '', descricao: '' });
            setAnexos([]);
        } catch (error) {
            alert('Erro ao salvar contrato: ' + (error?.message || ''));
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-danger">Novo Contrato</h2>

            {/* Abas */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${abaAtiva === 'informacoes' ? 'active bg-danger text-white' : ''}`}
                        onClick={() => setAbaAtiva('informacoes')}
                    >
                        Informações
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${abaAtiva === 'anexos' ? 'active bg-danger text-white' : ''}`}
                        onClick={() => setAbaAtiva('anexos')}
                    >
                        Anexos
                    </button>
                </li>
            </ul>

            <div className="card shadow-sm p-4">
                {/* Aba Informações */}
                {abaAtiva === 'informacoes' && (
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Empresa <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                name="empresa"
                                value={form.empresa}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Data de Início <span className="text-danger">*</span></label>
                            <input
                                type="date"
                                className="form-control"
                                name="dataInicio"
                                value={form.dataInicio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">Data de Fim</label>
                            <input
                                type="date"
                                className="form-control"
                                name="dataFim"
                                value={form.dataFim}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Orientador</label>
                            <input
                                type="text"
                                className="form-control"
                                name="orientador"
                                value={form.orientador}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Descrição</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="descricao"
                                value={form.descricao}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="col-12 d-grid mt-3">
                            <button className="btn btn-danger" onClick={salvarContrato}>
                                <i className="fas fa-save me-2"></i>Salvar Contrato
                            </button>
                        </div>
                    </div>
                )}

                {/* Aba Anexos */}
                {abaAtiva === 'anexos' && (
                    <div className="row g-3">
                        {anexos.length === 0 && (
                            <div className="text-center text-muted my-3">Nenhum arquivo adicionado.</div>
                        )}

                        {anexos.map((file, index) => (
                            <div key={index} className="col-md-4">
                                <div className="card bg-light p-2">
                                    <div className="text-center small">{file.name}</div>
                                    <div className="d-flex justify-content-end mt-2">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removerAnexo(index)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="col-md-3 d-flex align-items-center justify-content-center">
                            <label className="btn btn-outline-danger mb-0">
                                <i className="fas fa-plus fa-2x"></i>
                                <input
                                    type="file"
                                    className="d-none"
                                    multiple
                                    onChange={handleAnexo}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
