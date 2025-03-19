// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.jsx';
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ForgotPassword from './components/ForgotPassword.jsx'; // Importe o componente ForgotPassword
import ResetPassword from './components/ResetPassword.jsx'; // Importe o componente ResetPassword
import ProtectedRoute from './components/ProtectedRoute.jsx';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/forgot-password' element={<ForgotPassword />} /> {/* Rota para recuperação de senha */}
        <Route path='/reset-password/:token' element={<ResetPassword />} /> {/* Rota para redefinição de senha */}
        <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path='/App' element={<ProtectedRoute><App /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();