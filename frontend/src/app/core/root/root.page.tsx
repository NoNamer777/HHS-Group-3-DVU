import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth.context.ts';
import './root.page.css';

export default function RootPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [loading, user, navigate]);

    return loading || user ? <></> : <Navigate to="/login" replace />;
}
