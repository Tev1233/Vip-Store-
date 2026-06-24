/**
 * Entrypoint for the Isolated Admin Application
 * File: /src/admin-main.tsx
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import './index.css';

ReactDOM.createRoot(document.getElementById('admin-root')!).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
