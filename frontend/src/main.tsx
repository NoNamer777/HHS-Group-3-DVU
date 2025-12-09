import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app.tsx';
import '../public/style.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Root element '#root' not found in index.html");
}

// Create React root and render
createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
);
