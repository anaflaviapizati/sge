import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar navbar-expand-lg bg-white shadow-sm">
            <div className="container-fluid d-flex justify-content-between align-items-center p-3">

                <div className="d-flex flex-column align-items-start">
                    <span className="fs-3 fw-bold text-black">SGE</span>
                    <span className="text-black-50" style={{ fontSize: '0.95rem' }}>
                        Sistema de Gerenciamento de Estágios
                    </span>
                    <div style={{ width: 500, height: 3, background: 'red', marginTop: 2, borderRadius: 2 }}></div>
                </div>

                <div className="d-flex align-items-center ms-auto">
                    <ul className="navbar-nav flex-row align-items-center">
                        <li className="nav-item mx-2">
                            <Link className={`nav-link position-relative ${isActive('/')}`} to="/">Início<span className="nav-underline"></span></Link>
                        </li>
                        <li className="nav-item mx-2">
                            <Link className={`nav-link position-relative ${isActive('/contratos')}`} to="/contratos">Meus Contratos<span className="nav-underline"></span></Link>
                        </li>
                        <li className="nav-item mx-2">
                            <Link className={`nav-link position-relative ${isActive('/ajuda')}`} to="/ajuda">Ajuda<span className="nav-underline"></span></Link>
                        </li>
                        <li className="nav-item mx-2">
                            <div className="dropdown">
                                <button className="btn btn-link p-0 user-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ border: 'none', background: 'none' }}>
                                    <i className="fas fa-user-circle fa-2x" style={{ color: '#dc3545' }}></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><h6 className="dropdown-header">Usuário</h6></li>
                                    <li><button className="dropdown-item" onClick={() => navigate('/usuario')}><i className="fas fa-id-card me-2"></i>Informações do Usuário</button></li>
                                    <li><button className="dropdown-item" onClick={() => { logout(); navigate('/login'); }}><i className="fas fa-sign-out-alt me-2"></i>Sair do Sistema</button></li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <style>{`
                .nav-link { color: #000; transition: color 0.2s; }
                .nav-link:hover, .nav-link.active { color: #ff5252 !important; }
                .nav-underline { display: block; height: 2px; width: 0; background: #ff5252; transition: width 0.2s; margin-top: 2px; }
                .nav-link:hover .nav-underline, .nav-link.active .nav-underline { width: 100%; }
                .user-icon { transition: transform 0.2s, opacity 0.2s; cursor: pointer; }
                .user-icon:hover { transform: scale(1.1); opacity: 0.8; }
                .dropdown-menu { border: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; padding: 0.5rem 0; }
                .dropdown-item { padding: 0.5rem 1rem; transition: background-color 0.2s; }
                .dropdown-item:hover { background-color: #f8f9fa; }
                .dropdown-header { color: #6c757d; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 0.5rem 1rem 0.25rem; }
            `}</style>
        </nav>
    );
}
