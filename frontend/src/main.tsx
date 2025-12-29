import { initializeWorker, resetWorker } from '@/test';
import { Auth0Provider } from '@auth0/auth0-react';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js/src/global.ts';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import '../public/style.css';
import App from './app/app';
import AuthProvider from './app/auth/context/auth.provider';
import store from './app/store';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error("Root element '#root' not found in index.html");
}
if (import.meta.env['DEV']) {
    await initializeWorker();
    resetWorker();
}

const authorizationParams = {
    redirect_uri: window.location.origin,
} satisfies ClientAuthorizationParams;

// Create React root and render
createRoot(rootElement).render(
    <StrictMode>
        <Auth0Provider
            authorizationParams={authorizationParams}
            cacheLocation="localstorage"
            clientId={import.meta.env['VITE_AUTH0_CLIENT_ID']}
            domain={import.meta.env['VITE_AUTH0_DOMAIN']}
            useDpop={true}
            useRefreshTokens={true}
        >
            <BrowserRouter>
                <AuthProvider>
                    <Provider store={store}>
                        <App />
                    </Provider>
                </AuthProvider>
            </BrowserRouter>
        </Auth0Provider>
    </StrictMode>,
);
