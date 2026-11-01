'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

import api from '@/lib/api';
import { getAccessToken, setTokens, clearTokens } from '@/lib/auth';

interface AuthUser {
    id: number;
    username: string;
    email: string;
}

interface TokenResponse {
    access: string;
    refresh: string;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        passwowrd: string,
    ) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        async function restoreSession() {
            const accessToken = getAccessToken();

            if (!accessToken) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await api.get<AuthUser>('/auth/me');

                if (isMounted) {
                    setUser(response.data);
                }
            } catch {
                clearTokens();

                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoadin(false);
                }
            }
        }

        restoreSession();

        return () => (isMounted = false);
    }, []);

    async function login(username: string, password: string) {
        const response = await api.post<TokenResponse>('/auth/login/', {
            username,
            password,
        });

        const { access, refresh } = response.data;

        setTokens(access, refresh);

        try {
            const userResponse = await api.get<AuthUser>('/auth/me/');
            setUser(userResponse.data);
            router.push('/dashboard');
        } catch (error) {
            clearTokens();
            setUser(null);
            throw error;
        }
    }

    async function register(username: string, email: string, password: string) {
        const data: RegisterData = {
            username,
            email,
            password,
        };

        await api.post('/auth/register/', data);
    }

    function logout() {
        clearTokens();
        setUser(null);
        router.push('/login');
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }

    return context;
}