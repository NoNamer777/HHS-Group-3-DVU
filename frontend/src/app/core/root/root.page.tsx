import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../auth/functions.ts';
import './root.page.css';

export default function RootPage() {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    return <></>;
}
