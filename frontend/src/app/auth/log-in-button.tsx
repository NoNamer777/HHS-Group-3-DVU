import { useAuth0 } from '@auth0/auth0-react';

export default function LogInButton() {
    const { loginWithRedirect } = useAuth0();

    async function onLogin() {
        await loginWithRedirect();
    }

    return (
        <a role="button" href="#" className="btn btn-primary" onClick={onLogin}>
            Log in
        </a>
    );
}
