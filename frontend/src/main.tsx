import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: 'Inter, sans-serif', fontSize: 14 },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
    </QueryClientProvider>
  </React.StrictMode>,
);
