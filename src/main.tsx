import { Analytics } from '@vercel/analytics/react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <Router>
    <App />
    <Analytics />
    <Toaster
      toastOptions={{
        style: {
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        },
      }}
    />
  </Router>
);
