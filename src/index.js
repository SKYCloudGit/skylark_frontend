import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PermissionProvider } from './PermissionContext'; // ✅ Make sure the path is correct

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <PermissionProvider>
        <App />
      </PermissionProvider>
  </React.StrictMode>
);

reportWebVitals();