import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'reflect-metadata';
import '../public/style.css';
import App from './app/app.tsx';

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
