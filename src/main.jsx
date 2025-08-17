import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// This import is crucial. It makes sure the styles from index.css
// are applied to your entire application.
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
