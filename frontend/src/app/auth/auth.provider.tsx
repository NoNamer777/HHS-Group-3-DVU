import {
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { delay, StorageKeys, StorageService } from '../shared';
import { AuthContext } from './auth.context.ts';
import { getAuthenticatedUser } from './functions.ts';
import { type LoginData, User } from './models.ts';

const AUTH_CHECK_DELAY = 500 as const;

export default function AuthProvider(props: { children: ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    const storageService = StorageService.instance();

    const login = useCallback(
        async (loginData: LoginData) => {
            await delay(AUTH_CHECK_DELAY);

            const user = new User();
            user.role = 'Zorgverlener';
            user.email = loginData.email;

            storageService.setItem(StorageKeys.ACCESS_TOKEN, user);
            setUser(user);
            return user;
        },
        [storageService],
    );

    const logout = useCallback(async () => {
        await delay(AUTH_CHECK_DELAY);

        storageService.removeItem(StorageKeys.ACCESS_TOKEN);
        setUser(null);
    }, [storageService]);

    const context = useMemo<AuthContext>(
        () => ({
            user: user,
            loading: loading,
            login: login,
            logout: logout,
        }),
        [user, loading, login, logout],
    );

    useEffect(() => {
        async function checkAuthenticated() {
            setLoading(true);
            await delay(AUTH_CHECK_DELAY);
            setUser(getAuthenticatedUser());
            setLoading(false);
        }

        checkAuthenticated();
    }, []);

    return (
        <AuthContext.Provider value={context}>
            {props.children}
        </AuthContext.Provider>
    );
}
