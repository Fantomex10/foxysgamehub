// =================================================================================
// FILE: src/main.jsx (UPDATED)
// DESC: Now imports the main `index.css` file to ensure all global styles
//       and Tailwind directives are applied to the entire application.
// =================================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ADDED: Import the main stylesheet

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
