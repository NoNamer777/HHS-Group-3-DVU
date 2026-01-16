import { useAuth0 } from '@auth0/auth0-react';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../../public/logo.png';
import AddPatientModalComponent from '../../patients/add-patient-modal/add-patient-modal.component';
import SyncModalComponent from '../../sync/sync-modal.component.tsx';
import './header.component.css';

export default function HeaderComponent() {
    const navigate = useNavigate();
    const { user, logout } = useAuth0();

    async function onLogOut() {
        await logout({ logoutParams: { returnTo: window.location.origin } });
        navigate('/login');
    }

    function onNavigateToDashboard() {
        navigate('/dashboard');
    }

    function canSeePatients() {
        const roles: string[] = user['http://localhost:5173/roles'] ?? [];
        return roles.every((role) => role !== 'Patient');
    }

    function isAdmin() {
        const roles: string[] = user['http://localhost:5173/roles'] ?? [];
        return roles.some((role) => role === 'Admin');
    }

    return (
        <nav className="navbar navbar-expand-lg bg-primary-subtle text-bg-primary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/dashboard">
                    <img
                        src={logo}
                        alt="logo.png"
                        width="60"
                        height="60"
                        className="bg-primary rounded-4 border p-1 navbar-brand"
                    />
                    Zorgverleners-tool
                </Link>

                <div className="navbar-collapse">
                    <ul className="navbar-nav ms-auto align-items-center gap-2">
                        {canSeePatients() && (
                            <>
                                <li className="nav-item">
                                    <button type="button" className="btn btn-primary" onClick={onNavigateToDashboard}>
                                        Patiënten
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <AddPatientModalComponent />
                                </li>
                            </>
                        )}
                        {isAdmin() && (
                            <li className="nav-item">
                                <SyncModalComponent />
                            </li>
                        )}
                        <li className="nav-item border-start border-dark-subtle border-2 align-self-stretch"></li>
                        <li className="nav-item d-flex">
                            <div className="d-flex flex-column align-items-center p-1">
                                <span className="navbar-text fw-bold flex-grow-0 p-0">{user.email}</span>
                                <span className="navbar-text text-sm ms-auto flex-grow-0 p-0">
                                    {user['http://localhost:5173/roles'][0]}
                                </span>
                            </div>
                            <button className="nav-link" type="button" onClick={onLogOut}>
                                <FontAwesomeIcon icon={faArrowRightFromBracket} size="3x" />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
