import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './root.page.css';

export default function RootPage() {
    const { isLoading, user, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !user) {
            console.log('tes');
            loginWithRedirect();
        }
        if (!isLoading && user) {
            navigate('/dashboard');
        }
    }, [isLoading, user, navigate, loginWithRedirect]);

    return <></>;
}
