import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';

ReactDOM.hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)