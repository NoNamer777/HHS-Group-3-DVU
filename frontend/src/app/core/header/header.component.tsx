import {
    faArrowRightFromBracket,
    faFileImport,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../../public/logo.png';
import { useAuth } from '../../auth';
import AddPatientModalComponent from '../../patients/add-patient-modal/add-patient-modal.component.tsx';
import './header.component.css';

export default function HeaderComponent() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    async function onLogOut() {
        await logout();
        navigate('/login');
    }

    function onNavigateToDashboard() {
        navigate('/dashboard');
    }

    function onShowSyncDialog() {
        console.warn('SHOWING SYNC DIALOG');
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
                        <li className="nav-item">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onNavigateToDashboard}
                            >
                                Patiënten
                            </button>
                        </li>
                        <li className="nav-item">
                            <AddPatientModalComponent />
                        </li>
                        <li className="nav-item">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onShowSyncDialog}
                            >
                                <FontAwesomeIcon icon={faFileImport} />
                                Import / Export
                            </button>
                        </li>
                        <li className="nav-item border-start border-dark-subtle border-2 align-self-stretch"></li>
                        <li className="nav-item d-flex">
                            <div className="d-flex flex-column align-items-center p-1">
                                <span className="navbar-text fw-bold flex-grow-0 p-0">
                                    {user.email}
                                </span>
                                <span className="navbar-text text-sm ms-auto flex-grow-0 p-0">
                                    {user.role}
                                </span>
                            </div>
                            <button
                                className="nav-link"
                                type="button"
                                onClick={onLogOut}
                            >
                                <FontAwesomeIcon
                                    icon={faArrowRightFromBracket}
                                    size="3x"
                                />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
