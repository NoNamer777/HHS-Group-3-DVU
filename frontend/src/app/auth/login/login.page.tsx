import { type ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../../public/logo.png';
import { useAuth } from '../context';
import { type LoginData } from '../models';
import './login.page.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function onEmailChange(event: ChangeEvent) {
        setEmail((event.target as HTMLInputElement).value);
    }

    function onPasswordChange(event: ChangeEvent) {
        setPassword((event.target as HTMLInputElement).value);
    }

    async function onLogin() {
        const data: LoginData = {
            email: email,
            password: password,
        };

        await login(data);
        navigate('/dashboard');
    }

    return (
        <article className="bg-primary-subtle h-100 d-flex flex-column align-items-center justify-content-center">
            <img
                src={logo}
                alt="Logo.png"
                className="bg-primary rounded-4 border p-1 mb-4"
                height="100"
                width="100"
            />
            <h1 className="h5 text-body-emphasis">Zorgverleners-tool</h1>
            <h2 className="text-center h6 text-body mb-5">
                RoTT Groep 3<br />
                Interprofessionele communicatie
            </h2>
            <form
                action={onLogin}
                className="bg-body py-5 px-4 rounded-4 shadow-lg"
            >
                <h3 className="text-body fst-normal fs-6 mb-4">Inloggen</h3>
                <div className="mb-3">
                    <label htmlFor="email-input" className="form-label">
                        E-mailadres
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email-input"
                        placeholder="gebruiker@domein.nl"
                        value={email}
                        onChange={onEmailChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password-input" className="form-label">
                        Wachtwoord
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password-input"
                        value={password}
                        onChange={onPasswordChange}
                    />
                </div>
                <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                        Inloggen
                    </button>
                </div>
            </form>
        </article>
    );
}
