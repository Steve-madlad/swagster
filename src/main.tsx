import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <App />
      <Toaster
        toastOptions={{
          style: {
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          },
        }}
      />
    </Router>
  </StrictMode>,
);
