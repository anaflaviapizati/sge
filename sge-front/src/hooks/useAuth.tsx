import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Usuario, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false, loading: true, usuario: null,
    login: async () => {},
    logout: () => {}
});

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const usuarioStr = localStorage.getItem('usuario');
        
        if (token && usuarioStr) {
            try {
                const usuarioObj = JSON.parse(usuarioStr);
                setUsuario(usuarioObj);
                setIsAuthenticated(true);
            } catch (e) {
                console.error('Erro ao parsear usuário:', e);
            }
        }
        setLoading(false);

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'token') {
                const hasToken = !!e.newValue;
                setIsAuthenticated(hasToken);
                if (!hasToken) {
                    setUsuario(null);
                }
            }
            if (e.key === 'usuario') {
                try {
                    const usuarioObj = e.newValue ? JSON.parse(e.newValue) : null;
                    setUsuario(usuarioObj);
                } catch (err) {
                    console.error('Erro ao parsear usuário do storage:', err);
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const login = async (email: string, senha: string): Promise<void> => {
        setIsAuthenticated(true);
        // A lógica de login real será feita na página de Login
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setIsAuthenticated(false);
        setUsuario(null);
    };

    const value = useMemo(() => ({ 
        isAuthenticated, 
        loading, 
        usuario,
        login, 
        logout 
    }), [isAuthenticated, loading, usuario]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    return useContext(AuthContext);
}

