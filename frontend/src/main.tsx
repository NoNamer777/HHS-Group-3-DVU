import { initializeWorker, resetWorker } from '@/test';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import '../public/style.css';
import App from './app/app.tsx';
import AuthProvider from './app/auth/auth.provider.tsx';
import store from './app/store.ts';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Root element '#root' not found in index.html");
}
if (import.meta.env['DEV']) {
    await initializeWorker();
    resetWorker();
}

// Create React root and render
createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Provider store={store}>
                    <App />
                </Provider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
);
