import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './functions';

export default function ProtectedRoot() {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return <></>;
}
