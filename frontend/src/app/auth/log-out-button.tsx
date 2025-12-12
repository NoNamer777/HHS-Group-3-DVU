import { useAuth0 } from '@auth0/auth0-react';
import type { LogoutOptions } from '@auth0/auth0-react/src/auth0-context.tsx';

export default function LogOutButton() {
    const { logout } = useAuth0();

    const logoutParams = {
        logoutParams: { rereturnTo: window.location.origin },
    } satisfies LogoutOptions;

    async function onLogout() {
        await logout(logoutParams);
    }

    return (
        <a
            role="button"
            href="#"
            className="btn btn-primary"
            onClick={onLogout}
        >
            Log out
        </a>
    );
}
