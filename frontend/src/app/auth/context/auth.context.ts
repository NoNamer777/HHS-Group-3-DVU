import { createContext, useContext } from 'react';
import type { LoginData, User } from '../models';

export interface AuthContext {
    user: User;
    loading: boolean;
    login: (data: LoginData) => Promise<User>;
    logout: () => Promise<void>;
}

const DEFAULT_AUTH_CONTEXT = {
    user: null,
} as AuthContext;

export const AuthContext = createContext<AuthContext>(DEFAULT_AUTH_CONTEXT);

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
