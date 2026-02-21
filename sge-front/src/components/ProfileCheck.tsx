import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

interface ProfileCheckProps {
    children: React.ReactNode;
}

interface ProfileStatus {
    completo: boolean;
    perfil: string;
}

export default function ProfileCheck({ children }: ProfileCheckProps) {
    const [loading, setLoading] = useState(true);
    const [perfilCompleto, setPerfilCompleto] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verificarPerfil = async () => {
            try {
                const response = await api.get<ProfileStatus>('/perfil/completo');
                const completo = response.data.completo;

                if (location.pathname === '/usuario') {
                    if (completo) {
                        navigate('/', { replace: true });
                        return;
                    }
                    setPerfilCompleto(true);
                } else {
                    if (!completo) {
                        navigate('/usuario', { replace: true });
                        return;
                    }
                    setPerfilCompleto(true);
                }
            } catch (error) {
                setPerfilCompleto(true);
            } finally {
                setLoading(false);
            }
        };

        verificarPerfil();
    }, [navigate, location.pathname]);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-danger" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                    <p className="mt-3 text-muted">Verificando perfil...</p>
                </div>
            </div>
        );
    }
    if (!perfilCompleto) {
        return null;
    }
    return <>{children}</>;
}