import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import theme from './theme'; // <-- import your custom theme
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // <-- import your AuthProvider
import { ThemeProvider } from '@mui/material/styles'; // <-- import ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}> {/* <-- wrap App with ThemeProvider */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
