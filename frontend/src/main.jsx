import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AccessControlProvider } from './components/AccessControl';
import './styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccessControlProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AccessControlProvider>
  </React.StrictMode>
);
