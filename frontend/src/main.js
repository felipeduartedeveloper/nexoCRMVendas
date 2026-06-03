import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { initTheme } from '@/store/theme.store';
import './styles/index.css';
initTheme();
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsxs(QueryClientProvider, { client: queryClient, children: [_jsx(RouterProvider, { router: router }), _jsx(Toaster, { position: "top-right", toastOptions: {
                    style: { fontFamily: 'Inter, sans-serif', fontSize: 14 },
                    success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
                } }), import.meta.env.DEV && _jsx(ReactQueryDevtools, { initialIsOpen: false, buttonPosition: "bottom-left" })] }) }));
