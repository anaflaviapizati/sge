import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

