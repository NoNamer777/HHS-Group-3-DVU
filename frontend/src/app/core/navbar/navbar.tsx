import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import LogInButton from '../../auth/log-in-button.tsx';
import LogOutButton from '../../auth/log-out-button.tsx';
import './navbar.css';

export default function Navbar() {
    const { isLoading, isAuthenticated } = useAuth0();

    return (
        <nav className="navbar navbar-diapedis navbar-expand-lg px-3">
            <Link className="navbar-brand text-white fw-bold" to="/home">
                Diabeticum Pedis
            </Link>

            <section className="collapse navbar-collapse" id="navbarMenu">
                <ul className="navbar-nav ms-auto text-center">
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/dashboard">
                            Dashboard
                        </Link>
                    </li>
                </ul>
                <ul className="navbar-nav ms-auto text-end">
                    {!isLoading && !isAuthenticated && (
                        <li className="nav-item">
                            <LogInButton />
                        </li>
                    )}
                    {!isLoading && isAuthenticated && (
                        <li className="nav-item">
                            <LogOutButton />
                        </li>
                    )}
                </ul>
            </section>
        </nav>
    );
}
