import React from 'react';
import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
import './index.css';

console.log("Main.jsx: Minimal render test...");
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ color: 'white', padding: 20 }}>TEST: MAIN.JSX IS RUNNING</div>
  </React.StrictMode>,
);
