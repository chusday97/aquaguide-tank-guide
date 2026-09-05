import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppLanguageProvider } from './AppLanguage.jsx';
import AdminNoticeViewport from './AdminNoticeViewport.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLanguageProvider>
      <App />
      <AdminNoticeViewport />
    </AppLanguageProvider>
  </React.StrictMode>,
);
