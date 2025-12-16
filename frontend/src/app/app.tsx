import { Route, Routes } from 'react-router-dom';
import Login from './auth/login.tsx';
import Home from './core/home.tsx';
import Navbar from './core/navbar/navbar.tsx';
import Dashboard from './pages/dashboard.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from 'react';

export default function App() {
    const [queryClient] = useState(
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: "always",
            staleTime: 1000 * 60 * 60 * 24,
            retry: false,
            retryOnMount: true,
          },
          mutations: {
            // onError: () => Iets met een foutmelding doen of niet
          },
        },
      }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            <Navbar />
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </QueryClientProvider>
    );
}