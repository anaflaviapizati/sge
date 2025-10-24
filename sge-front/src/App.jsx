import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Contratos from './pages/Contratos.jsx';
import Usuario from './pages/Usuario';
import NovoContrato from './pages/novoContrato';
import DocumentosContrato from './pages/DocumentosContrato';
import VisualizarContrato from './pages/VisualizarContrato';
import Ajuda from './pages/Ajuda';


function App() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted">Carregando sistema...</p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Rota de login - sem header/footer */}
                <Route
                    path="/login"
                    element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Login />
                    }
                />
                <Route
                    path="/register"
                    element={
                        isAuthenticated ? <Navigate to="/" replace /> : <Register />
                    }
                />

                {/* Rotas protegidas - com header/footer */}
                <Route
                    path="/*"
                    element={
                        isAuthenticated ? (
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/contratos" element={<Contratos />} />
                                    <Route path="/usuario" element={<Usuario />} />
                                    <Route path="/ajuda" element={<Ajuda />} />
                                    <Route path="/novo-contrato" element={<NovoContrato />} />
                                    <Route path="/contratos/:id" element={<VisualizarContrato />} />
                                    <Route path="/contratos/:id/documentos" element={<DocumentosContrato />} />

                                </Routes>
                            </Layout>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
