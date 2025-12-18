import { Link } from 'react-router-dom';
import './header.css';

export default function Header() {
    return (
        <header>
            <nav className="navbar navbar-diapedis navbar-expand-lg px-3">
                <Link className="navbar-brand text-white fw-bold" to="/home">
                    Diabeticum Pedis
                </Link>

                <section className="collapse navbar-collapse" id="navbarMenu">
                    <ul className="navbar-nav ms-auto text-center">
                        <li className="nav-item">
                            <Link
                                className="nav-link text-white"
                                to="/dashboard"
                            >
                                Dashboard
                            </Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto text-end">
                        <li className="nav-item">
                            <Link className="nav-link text-white" to="/login">
                                Inloggen
                            </Link>
                        </li>
                    </ul>
                </section>
            </nav>
        </header>
    );
}
