import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Alunos from './pages/Alunos';

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
                                    <Route path="/alunos" element={<Alunos />} />
                                    {/* Adicione mais rotas conforme necessário */}
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